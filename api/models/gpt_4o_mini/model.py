import os
import time
from dotenv import load_dotenv
from openai import OpenAI
from api.prompt import MODELS_DIR, PromptManager, PromptManagerConfig
from api.model import UtilityModel


GPT_4O_MINI_DIR = MODELS_DIR + os.sep + "gpt_4o_mini"
SUMMARY_FILE_PATH = GPT_4O_MINI_DIR + os.sep + "summary.md"
TRANSCRIPTION_FILE_PATH = GPT_4O_MINI_DIR + os.sep + "transcription.md"
TITLE_FILE_PATH = GPT_4O_MINI_DIR + os.sep + "title.md"

class OpenAI_4o_mini(UtilityModel):
    client: OpenAI
    prompt_manager: PromptManager
    debug: bool
    mock: bool
    def __init__(self, api_key: str, debug=False, mock=False):
        load_dotenv(override=True)
        self.client = OpenAI(api_key=api_key)
        self.debug = debug
        self.mock = mock


        config = PromptManagerConfig()
        config.Summary = True
        config.Transcription = True
        config.Title = True
        config.summary_path = SUMMARY_FILE_PATH
        config.transcription_path = TRANSCRIPTION_FILE_PATH
        config.title_path = TITLE_FILE_PATH
        self.prompt_manager = PromptManager(config)

    def transcribe(self, image):

        if self.mock:
            time.sleep(2)
            return "This conversation concerns an image sent by the user. It's transcription is as follows:\n\n" + "x^2*e^x (example response)"

        try:
            # Send the request to OpenAI API
            instructions = self.prompt_manager.transcriptionPrompt()
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": instructions},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image,
                                }
                            },
                        ],
                    }
                ],
                temperature=0,
                max_tokens=300
            )   
        except:
            print("Transcription error")
            return "There is supposed to be a transcription of an image, but there was a fatal error."

        transcription = str(response.choices[0].message.content)
        if self.debug:
            print("Transcription: ", transcription)

        if response.usage:
            print(f"Tokens used by image transcriptions: {response.usage.total_tokens} (${response.usage.total_tokens  * 0.00000015})")


        return transcription

    def summarize(self, conversation):

        instructions = self.prompt_manager.summaryPrompt()
        conversation.insert(0, {
            "role": "system",
            "content": [{
                "type": "text",
                "text": instructions 
            }
                        ]
        })

        if self.mock:
            time.sleep(2)
            return "Example summary"

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=conversation,
                temperature=0,
                max_tokens=300
            )   
        except:
            print("Summary error")
            return "There is supposed to be a summary here, but a fatal error has occurred."


        summary = str(response.choices[0].message.content)
        summary = "The following is a summary of the previous conversation:\n\n" + summary

        if self.debug:
            print("Summary: ", summary)
        return summary

    def title(self, question):

        if self.mock:
            time.sleep(2)
            return "Example title"

        instructions = self.prompt_manager.titlePrompt(question)
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": instructions,
                    },
                ],
                max_tokens=40
            )
        except:
            print("Title error")
            return "Error Getting Title"


        title = str(response.choices[0].message.content)

        if self.debug:
            print("Title: ", title)
        return title

