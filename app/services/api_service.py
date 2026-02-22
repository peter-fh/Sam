import json
from time import perf_counter
from typing import TypedDict, Literal
from openai import AsyncOpenAI, OpenAI
from supabase import Client as SupabaseClient
from app.core.prompt import PromptManager
from app.core.types import Mode
from app.services.ai_service import AIConfig, AIService
from app.core.async_runner import AsyncRunner
from app.services.db_service import Database
from concurrent.futures import ThreadPoolExecutor
import logging

executor = ThreadPoolExecutor(max_workers=8)


THREAD_RANGE = 100

class NewConversationResult(TypedDict):
    id: int

class LLMMessage(TypedDict):
    role: Literal['assistant', 'user']
    content: str

class ConversationResult(TypedDict):
    course: str
    messages: list[dict[str, str]]

class API:
    _asyncRunner: AsyncRunner
    aiService: AIService
    dbService: Database
    def __init__(self,
                 aiConfig: AIConfig,
                 aiClient: OpenAI,
                 asyncAiClient: AsyncOpenAI,
                 promptManager: PromptManager,
                 supabaseClient: SupabaseClient):
        self.aiService = AIService(aiConfig, aiClient, asyncAiClient, promptManager)
        self.dbService = Database(supabaseClient)
        self._asyncRunner = AsyncRunner()

    def newConversation(self, userId: int, course: str):
        id = self.dbService.addConversation(userId, course)
        return id

    def getConversationMessages(self, conversationId: int) -> ConversationResult:
        messages: list[dict[str, str]] = self.dbService.getConversation(conversationId)
        course = self.dbService.getCourse(conversationId)
        res: ConversationResult = {
            'course': course,
            'messages': messages,
        }
        return res

    def getConversationList(self, userId: int, index: int = 0):
        threads = self.dbService.getConversations(userId, index, index + THREAD_RANGE)
        return threads

    def newMessage(self, userId: int, conversationId: int, message: str, image: str | None=None):
        t0 = perf_counter()
        t = {}
        # Update the conversation and fetch current state
        try:
            self.dbService.addMessage(conversationId, 'user', message)
            currentConversationInfo = message
            t["image_start"] = perf_counter()
            t["image_start"] = perf_counter()
            if image:
                transcription = self._asyncRunner.run(self.aiService.getTranscription(image))
                currentConversationInfo += "\nImage uploaded with transcription:\n" + transcription
                self.dbService.addMessage(conversationId, 'user', transcription)
            conversation = self.dbService.getConversation(conversationId)
            course = self.dbService.getCourse(conversationId)
            t["mode_start"] = perf_counter()
            starting_mode = self.dbService.getMode(conversationId)

            # Fetch the current mode
            raw_mode = self._asyncRunner.run(self.aiService.getMode(json.dumps(conversation), starting_mode))
            mode = Mode[raw_mode.upper()]

            t["message_start"] = perf_counter()
            chunks = []
            yield "__START__"
            for chunk in self.aiService.getMessage(conversation, course, mode):
                chunks.append(chunk)
                yield chunk

            totalResponse = ''.join(chunks)

            t["message_end"] = perf_counter()
            # Update conversation with newly fetched information
            if not self.dbService.hasTitle(conversationId):
                title = self._asyncRunner.run(self.aiService.getTitle(currentConversationInfo))
                self.dbService.updateTitle(conversationId, title)
            self.dbService.updateMode(conversationId, mode.value)
            self.dbService.addMessage(conversationId, 'assistant', totalResponse)
            t["end"] = perf_counter()
            logging.info(f'Time to image start:    {t['image_start'] - t0}s')
            logging.info(f'Time to mode start:     {t['mode_start'] - t0}s')
            logging.info(f'Time to message start:  {t['message_start'] - t0}s')
            logging.info(f'Time to message end:    {t['message_end'] - t0}s')
            logging.info(f'Total time:             {t['end'] - t0}s')
        except Exception as e:
            yield "__ERROR__"
            logging.exception("Failed to get next message: ", e)
        finally:
            # Yield the end symbol to ensure the app knows when this conversation is done processing
            yield "__END__"


