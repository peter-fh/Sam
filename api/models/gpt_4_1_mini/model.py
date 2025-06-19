import os
import time
from dotenv import load_dotenv
from api.log import displayConversation
from openai import OpenAI
from api.prompt import MODELS_DIR, PromptManager, PromptManagerConfig, PromptType
from api.model import EXAMPLE_RESPONSE_FILEPATH, UtilityModel, TutorModel


GPT_4_1_MINI_DIR = MODELS_DIR + os.sep + "gpt_4_1_mini"
SUMMARY_FILE_PATH =  GPT_4_1_MINI_DIR+ os.sep + "summary.md"
TRANSCRIPTION_FILE_PATH = GPT_4_1_MINI_DIR + os.sep + "transcription.md"
TITLE_FILE_PATH =  GPT_4_1_MINI_DIR+ os.sep + "title.md"
STRATEGY_FILE_PATH = GPT_4_1_MINI_DIR+ os.sep + "strategy.md"

class OpenAI_4_1_mini(UtilityModel, TutorModel):
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
        config.Transcription = True
        config.Title = True
        config.Strategy = True
        config.transcription_path = TRANSCRIPTION_FILE_PATH
        config.title_path = TITLE_FILE_PATH
        config.strategy_path = STRATEGY_FILE_PATH
        self.prompt_manager = PromptManager(config)

    def transcribe(self, image):

        if self.mock:
            time.sleep(2)
            return "This conversation concerns an image sent by the user. It's transcription is as follows:\n\n" + "x^2*e^x (example response)"

        try:
            # Send the request to OpenAI API
            instructions = self.prompt_manager.transcriptionPrompt()
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
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
                max_tokens=1000
            )   
        except:
            print("Transcription error")
            return "There is supposed to be a transcription of an image, but there was a fatal error."

        transcription = str(response.choices[0].message.content)
        # if self.debug:
        #   print("Transcription: ", transcription)

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
                model="gpt-4.1-mini",
                messages=conversation,
                temperature=0,
                max_tokens=600
            )   
        except:
            print("Summary error")
            return "There is supposed to be a summary here, but a fatal error has occurred."


        summary = str(response.choices[0].message.content)
        summary = "The following is a summary of the previous conversation:\n\n" + summary

        # if self.debug:
        #     print("Summary: ", summary)
        return summary

    def title(self, question):

        if self.mock:
            time.sleep(2)
            return "Example title"

        instructions = self.prompt_manager.titlePrompt(question)
        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
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

    def ask(self, conversation, course_prompt, prompt_type, brevity):

        prompt = self.prompt_manager.instructions(prompt_type, brevity) + "\n" + course_prompt

        conversation.insert(0, {
            "role": "system",
            "content": [{
                "type": "text",
                "text": prompt
            }
                        ]
        })

        if self.debug:
            displayConversation(conversation)

        if self.mock:
            with open(EXAMPLE_RESPONSE_FILEPATH) as f:
                for line in f:
                    for word in line.split(" "):
                        time.sleep(0.002)
                        yield word + " "
            return

        temperature = 0.7
        if prompt_type == PromptType.PROBLEM:
            temperature = 0

        try:
            # Send the request to OpenAI API
            stream = self.client.chat.completions.create(
                model="gpt-4.1",
                messages=conversation,
                temperature=temperature,
                stream=True,
            )
        except Exception as e:
            print("Ask error: ", e)
            yield "This service is currently unavailable, sorry!"
            return

        total_input_characters = 0
        for message in conversation:
            for line in message["content"][0]["text"]:
                total_input_characters += len(line)


        total_output_characters = 0
        for chunk in stream:
            content = chunk.choices[0].delta.content 
            if content is not None:
                total_output_characters += len(content)
                yield content


