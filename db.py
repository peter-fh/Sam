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
                .single()
                .execute()
        )
        data = response.data
        print(data)
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
