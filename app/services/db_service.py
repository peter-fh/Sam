from typing import Literal, TypedDict
from supabase import Client

from app.core.types import Mode


class Message(TypedDict):
    content: str
    role: Literal['user', 'assistant']
    timestamp: str | None

class ConversationResult(TypedDict):
    messages: list[Message]
    summary: str
    summarized_at: str
    course: str
    mode: Mode | None

class ConversationUpdateResult(TypedDict):
    userMessage: str
    aiMessage: str
    mode: Mode


class Database:
    client: Client
    def __init__(self, client: Client):
        self.client = client

    def _getMode(self, mode_id: int | None):
        if not mode_id:
            return None
        response = (
            self.client
            .table("modes")
            .select("name")
            .eq("id", mode_id)
            .single()
            .execute()
        )

        return response.data["name"]

    def _getModeId(self, conversation_type: str):
        response = (
            self.client
            .table("modes")
            .select("id")
            .eq("name", conversation_type)
            .single()
            .execute()
        )

        return response.data["id"]

    def _getCourse(self, course_id: int):
        response = (
            self.client
            .table("courses")
            .select("code")
            .eq("id", course_id)
            .single()
            .execute()
        )

        return response.data["code"]

    def _getCourseId(self, course: str) -> int:
        response = (
            self.client
            .table("courses")
            .select("id")
            .eq("code", course)
            .single()
            .execute()
        )
        return response.data["id"]

    def _getMessages(self, conversation_id: int, timestamp: str | None) -> list[Message]:
        query = (
            self.client
            .table("messages")
            .select()
        )

        if timestamp:
            query = query.gte("timestamp", timestamp)

        response = (
            query
            .order("timestamp", desc=False)
            .eq("conversation_id", conversation_id)
            .execute()
        )
        data = response.data
        messages: list[Message] = []
        for raw_message in data:
            messages.append({
                'content': raw_message['content'],
                'role': raw_message['role'],
                'timestamp': raw_message['timestamp']
            })
        return messages

    def GetConversation(self, user_id: int, conversation_id: int) -> ConversationResult:
        settingsResponse = (
            self.client
            .table("conversations")
            .select()
            .eq("id", conversation_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        settings = settingsResponse.data
        timestamp = None
        if settings["summary"] and settings["summarized_at"]:
            timestamp = settings["summarized_at"]

        messages = self._getMessages(conversation_id, timestamp)
        course = self._getCourse(settings["course_id"])
        mode = self._getMode(settings["mode_id"])
        return {
            'messages': messages,
            'summary': settings["summary"],
            'mode': mode,
            'course': course,
            'summarized_at': settings["summarized_at"]
        }

    def GetConversations(self, user_id: int, start: int, end: int):
        response = (
            self.client
                .table("conversations")
                .select()
                .range(start, end)
                .order("created_at", desc=True)
                .eq("user_id", user_id)
                .execute()
        )
        data = response.data
        return data

    def _addMessage(self, conversation_id: int, role: str, content: str):
        _ = (
            self.client
            .table("messages")
            .insert({
                "conversation_id": conversation_id,
                "role": role,
                "content": content,
                })
            .execute()
        )

    def AddConversation(self, user_id: int, course: str) -> int:
        course_id = self._getCourseId(course)
        response = (
            self.client
            .table("conversations")
            .insert({
                "course_id": course_id,
                "user_id": user_id,
                })
            .execute()
        )

        return response.data[0]["id"]

    def UpdateConversation(self, conversation_id: int, request: ConversationUpdateResult):
        self._addMessage(conversation_id, 'user', request["userMessage"])
        self._addMessage(conversation_id, 'assistant', request["aiMessage"])
        mode_id = self._getModeId(request["mode"].value)
        _ = (
            self.client
            .table("conversations")
            .update({
                "mode_id": mode_id,
                })
            .eq("id", conversation_id)
            .execute()
        )

    def UpdateSummary(self, conversation_id: int, summary: str, timestamp: str):
        _ = (
            self.client
            .table("conversations")
            .update({
                "summary": summary,
                "summarized_at": timestamp,
                })
            .eq("id", conversation_id)
            .execute()
        )



    def UpdateTitle(self, conversation_id: int, title: str):

        _ = (
            self.client
            .table("conversations")
            .update({
                "title": title,
                })
            .eq("id", conversation_id)
            .execute()
        )

    def HasTitle(self, conversation_id: int) -> bool:
        title = ( 
            self.client 
            .table("conversations")
            .select("title")
            .eq("id", conversation_id)
            .execute()
        ).data[0]["title"]

        if not title or title == "":
            return False
        return True
