from supabase import Client

class Database:
    client: Client
    def __init__(self, client: Client):
        self.client = client

    def getOutline(self, course_code):
        print("Getting outline for: ", course_code)
        response = (
            self.client
                .table("outlines")
                .select("text, courses!inner()")
                .eq("courses.code", course_code)
                .order("created_at", desc=True)
                .limit(1)
                .single()
                .execute()
        )
        data = response.data
        prompt = data["text"]
        return prompt

    def getPrompt(self, mode, model):
        print("Getting prompt for: ", mode, " ", model)
        response = (
            self.client
                .table("prompts")
                .select("text, modes!inner()")
                .order("created_at", desc=True)
                .eq("modes.name", mode)
                .eq("model", model)
                .limit(1)
                .single()
                .execute()
        )
        data = response.data
        prompt = data["text"]
        return prompt

    def addPrompt(self, text, mode, model):
        print("Adding prompt for: ", mode, " ", model)

        mode_response = (
            self.client
                .table("modes")
                .select("id")
                .eq("name", mode)
                .limit(1)
                .single()
                .execute()
        )
        mode_id = mode_response.data["id"]

        response = (
            self.client
                .table("prompts")
                .insert({
                    "text": text,
                    "model": model,
                    "mode_id": mode_id
                })
                .execute()
        )

        data = response.data[0]
        return data

    def addOutline(self, text, course_code):
        course_response = (
            self.client
                .table("courses")
                .select("id")
                .eq("code", course_code)
                .single()
                .execute()
        )
        course_id = course_response.data["id"]
        response = (
            self.client
                .table("outlines")
                .insert({
                    "text": text,
                    "course_id": course_id,
                })
                .execute()
        )
        data = response.data[0]
        return data

    def getConversations(self):
        response = (
            self.client
                .table("conversations")
                .select()
                .order("created_at", desc=True)
                .execute()
        )
        data = response.data
        return data

    def getSettings(self, id: int):
        response = (
            self.client
                .table("conversations")
                .select("""
                    course:course_id (code), 
                    mode:mode_id (name)
                """)
                .eq("id", id)
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

    def getSummary(self, id: int):
        response = (
            self.client
            .table("conversations")
            .select("summary")
            .eq("id", id)
            .single()
            .execute()
        )
        data = response.data
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


    def addConversation(self, title: str, course: str, mode: str):
        course_id = self.getCourseId(course)
        mode_id = self.getModeId(mode)
        response = (
            self.client
            .table("conversations")
            .insert({
                "title": title,
                "course_id": course_id,
                "mode_id": mode_id,
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

