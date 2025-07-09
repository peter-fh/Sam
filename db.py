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

