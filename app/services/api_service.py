import asyncio
import json
from time import perf_counter
from typing import TypedDict, Literal
from supabase import Client as SupabaseClient
from openai import AsyncOpenAI, OpenAI
from app.core.prompt import PromptManager
from app.core.types import Mode
from app.services.ai_service import AIConfig, AIService
from app.core.async_runner import AsyncRunner
import app.services.db_service as db_service
from concurrent.futures import ThreadPoolExecutor
from flask import current_app

executor = ThreadPoolExecutor(max_workers=8)


THREAD_RANGE = 100
CONVERSATION_TOKEN_THRESHOLD = 5000

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
    dbService: db_service.Database
    def __init__(self,
                 aiConfig: AIConfig,
                 aiClient: OpenAI,
                 asyncAiClient: AsyncOpenAI,
                 promptManager: PromptManager,
                 supabaseClient: SupabaseClient):
        self.aiService = AIService(aiConfig, aiClient, asyncAiClient, promptManager)
        self.dbService = db_service.Database(supabaseClient)
        self._asyncRunner = AsyncRunner()

    def newConversation(self, userId: int, course: str):
        id = self.dbService.AddConversation(userId, course)
        return id

    def getConversationMessages(self, userId: int, conversationId: int) -> db_service.ConversationResult:
        return self.dbService.GetConversation(userId, conversationId)

    def getConversationList(self, userId: int, index: int = 0):
        return self.dbService.GetConversations(userId, index, index + THREAD_RANGE)

    async def _updateTitle(self, conversation_id: int, userMessage: str):
        title = await self.aiService.getTitle(userMessage)
        await asyncio.to_thread(self.dbService.UpdateTitle, conversation_id, title)

    async def _summarize(self, conversationId: int, messages: list[db_service.Message]):
        threshold = CONVERSATION_TOKEN_THRESHOLD / 2
        count = 0
        timestamp: str | None = None
        conversationToSummarize: list[db_service.Message] = []
        for message in messages:
            conversationToSummarize.append(message)
            count += len(message['content'])
            if count > threshold:
                timestamp = message["timestamp"]
                break

        if timestamp:
            summary = await self.aiService.getSummary(conversationToSummarize)
            await asyncio.to_thread(self.dbService.UpdateSummary, conversationId, summary, timestamp)
            current_app.logger.info(f"Summarized conversation {conversationId}: {summary}")
        else:
            current_app.logger.info(f"Failed to summarize conversation {conversationId}, timestamp is null")


    def _shouldSummarize(self, messages: list[db_service.Message]) -> bool:
        total_chars = sum(len(msg["content"]) for msg in messages)
        return total_chars > CONVERSATION_TOKEN_THRESHOLD

    def newMessage(self, userId: int, conversationId: int, message: str, image: str | None=None):
        t0 = perf_counter()
        t = {}
        # Update the conversation and fetch current state
        try:
            conversationResult: db_service.ConversationResult = self.dbService.GetConversation(userId, conversationId)
            userRequest = message
            t["image_start"] = perf_counter()
            if image:
                transcription = self._asyncRunner.run(self.aiService.getTranscription(image))
                userRequest += "\nImage uploaded with transcription:\n" + transcription

            t["mode_start"] = perf_counter()

            currentConversation = conversationResult["messages"]
            currentConversation.append({
                'content': userRequest,
                'role': 'user',
                'timestamp': None,
            })
            if (conversationResult["summary"]):
                currentConversation.insert(0, {
                'content': userRequest,
                'role': 'user',
                'timestamp': conversationResult["summarized_at"],
                })

            # Fetch the current mode
            raw_mode = self._asyncRunner.run(self.aiService.getMode(json.dumps(currentConversation), conversationResult["mode"]))
            mode = Mode[raw_mode.upper()]

            t["message_start"] = perf_counter()
            chunks = []
            yield "__START__"
            for chunk in self.aiService.getMessage(currentConversation, conversationResult["course"], mode):
                chunks.append(chunk)
                yield chunk

            totalResponse = ''.join(chunks)

            t["message_end"] = perf_counter()
            # Update conversation with newly fetched information
            if not self.dbService.HasTitle(conversationId):
                self._asyncRunner.fire_and_forget(self._updateTitle(conversationId, userRequest))

            if self._shouldSummarize(currentConversation):
                self._asyncRunner.fire_and_forget(self._summarize(conversationId, currentConversation))
                current_app.logger.info(f"Summarizing conversation {conversationId}")


            self.dbService.UpdateConversation(conversationId, {
                'userMessage': userRequest,
                'aiMessage': totalResponse,
                'mode': mode,
                })

            t["summary_start"] = perf_counter()
            t["end"] = perf_counter()
            current_app.logger.info(f'Time to image start:    {t['image_start'] - t0}s')
            current_app.logger.info(f'Time to mode start:     {t['mode_start'] - t0}s')
            current_app.logger.info(f'Time to message start:  {t['message_start'] - t0}s')
            current_app.logger.info(f'Time to message end:    {t['message_end'] - t0}s')
            current_app.logger.info(f'Total time:             {t['end'] - t0}s')

            # Yield the end symbol to ensure the app knows when this conversation is done processing
            yield "__END__"
        except GeneratorExit:
            current_app.logger.exception('Client disconnected the stream')
            return
        except Exception as e:
            current_app.logger.exception("Failed to get next message: ", e)
            yield "__ERROR__"



