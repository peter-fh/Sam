from supabase import Client

class Database:
    client: Client
    def __init__(self, client: Client):
        self.client = client

    def getConversations(self, user_id):
        response = (
            self.client
                .table("conversations")
                .select()
                .order("created_at", desc=True)
                .eq("user_id", user_id)
                .execute()
        )
        data = response.data
        return data

    def getSettings(self, user_id, id: int):
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

    def getConversation(self, user_id, id: int):
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

    def getSummary(self, user_id, id: int):
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
        print(data)
        return data

    def addMessage(self, conversation_id: int, role: str, content: str):
        response = (
            self.client
            .table("messages")
            .insert({
                "conversation_id": conversation_id,
                "role": role,
                "content": content,
                })
            .execute()
        )

    def getModeId(self, conversation_type):
        response = (
            self.client
            .table("modes")
            .select("id")
            .eq("name", conversation_type)
            .single()
            .execute()
        )

        return response.data["id"]

    def getCourseId(self, course):
        response = (
            self.client
            .table("courses")
            .select("id")
            .eq("code", course)
            .single()
            .execute()
        )
        return response.data["id"]


    def addConversation(self, user_id, title: str, course: str, mode: str):
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

