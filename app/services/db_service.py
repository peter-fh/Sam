from supabase import Client

class Database:
    client: Client
    def __init__(self, client: Client):
        self.client = client

    def getConversations(self, user_id: int, start: int, end: int):
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

    def getSettings(self, user_id: int, id: int):
        response = (
            self.client
                .table("conversations")
                .select("""
                    course:course_id (code), 
                    mode:mode_id (name)
                """)
                .eq("id", id)
                .eq("user_id", user_id)
                .single()
                .execute()
        )
        data = response.data
        return data

    def getConversation(self, id: int):
        response = (
            self.client
                .table("messages")
                .select()
                .eq("conversation_id", id)
                .order("timestamp", desc=False)
                .execute()
        )
        data = response.data
        return data

    def getSummary(self, user_id: int, id: int):
        response = (
            self.client
            .table("conversations")
            .select("summary")
            .eq("id", id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        data = response.data
        return data

    def addMessage(self, conversation_id: int, role: str, content: str):
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

    def getModeId(self, conversation_type: str):
        response = (
            self.client
            .table("modes")
            .select("id")
            .eq("name", conversation_type)
            .single()
            .execute()
        )

        return response.data["id"]

    def getCourseId(self, course: str) -> int:
        response = (
            self.client
            .table("courses")
            .select("id")
            .eq("code", course)
            .single()
            .execute()
        )
        return response.data["id"]

    def _addConversation(self, user_id: int, title: str, course: str, mode: str):
        course_id = self.getCourseId(course)
        mode_id = self.getModeId(mode)
        response = (
            self.client
            .table("conversations")
            .insert({
                "title": title,
                "course_id": course_id,
                "mode_id": mode_id,
                "user_id": user_id,
                })
            .execute()
        )

        return response.data[0]["id"]

    def addConversation(self, user_id: int, course: str) -> int:
        course_id = self.getCourseId(course)
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

    def updateTitle(self, conversation_id: int, title: str):

        _ = (
            self.client
            .table("conversations")
            .update({
                "title": title,
                })
            .eq("id", conversation_id)
        )
    def getMode(self, conversation_id: int):
        mode_id = (
            self.client
            .table("conversations")
            .select("mode_id")
            .eq("id", conversation_id)
            .execute()
        ).data[0]["mode_id"]
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

    def getCourse(self, conversation_id: int):
        course_id = (
            self.client
            .table("conversations")
            .select("course_id")
            .eq("id", conversation_id)
            .execute()
        ).data[0]["course_id"]
        response = (
            self.client
            .table("courses")
            .select("code")
            .eq("id", course_id)
            .single()
            .execute()
        )

        return response.data["code"]

    def updateMode(self, conversation_id: int, mode: str):
        mode_id = self.getModeId(mode)

        _ = (
            self.client
            .table("conversations")
            .update({
                "mode_id": mode_id,
                })
            .eq("id", conversation_id)
        )

    def updateSummary(self, conversation_id: int, summary: str):

        _ = (
            self.client
            .table("conversations")
            .update({
                "summary": summary,
                })
            .eq("id", conversation_id)
        )

