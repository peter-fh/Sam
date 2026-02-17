import asyncio
from typing import Sequence, TypedDict, Literal
from openai import AsyncOpenAI, OpenAI
from supabase import Client as SupabaseClient
from app.core.prompt import PromptManager
from app.core.types import Mode
from app.services.ai_service import AIConfig, AIService
from app.services.db_service import Database
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=8)

def run_async(coro):
    return asyncio.run(coro)

THREAD_RANGE = 5

class NewConversationResult(TypedDict):
    id: int

class LLMMessage(TypedDict):
    role: Literal['assistant', 'user']
    content: str

class ConversationResult(TypedDict):
    course: str
    messages: list[dict[str, str]]

class API:
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
        print("getting mode")
        print("conversation id: ", conversationId)
        starting_mode = self.dbService.getMode(conversationId)
        print("got initial mode")
        raw_mode = asyncio.run(self.aiService.getMode(message, starting_mode))
        print("got mode")
        mode = Mode[raw_mode.upper()]

        conversation = self.dbService.getConversation(conversationId)
        print("got conversation")
        course = self.dbService.getCourse(conversationId)
        print("got course")
        totalResponse = ""
        yield "__START__"
        for chunk in self.aiService.getMessage(conversation, course, mode):
            totalResponse += chunk
            yield chunk

        if starting_mode is None:
            title = asyncio.run(self.aiService.getTitle(message))
            self.dbService.updateTitle(conversationId, title)

        self.dbService.updateMode(conversationId, mode.value)
        self.dbService.addMessage(conversationId, 'user', message)
        self.dbService.addMessage(conversationId, 'assistant', totalResponse)


