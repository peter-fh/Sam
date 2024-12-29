import time
from openai import OpenAI
import os
from dotenv import load_dotenv
import textwrap
from prompt.prompt_manager import PromptType, summaryPrompt, imagePrompt

api_dir = "api"
example_response_file = api_dir + os.sep + "example_response.txt"

class GPT:
    client: OpenAI
    debug: bool

    def __init__(self, api_key: str):
        load_dotenv(override=True)
        self.client = OpenAI(api_key=api_key)

    def setDebug(self, debug: bool):
        self.debug = debug

    def transcribe(self, image):

        if self.debug:
            time.sleep(2)
            return "x^2*e^x (example response)"

        # Send the request to OpenAI API
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": imagePrompt()},
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

        transcription = str(response.choices[0].message.content)
        transcription = "The following is a transcription of an image:\n\n" + transcription
        if response.usage:
            print(f"Tokens used by image transcriptions: {response.usage.total_tokens} (${response.usage.total_tokens  * 0.00000015})")

        return transcription


    def summarize(self, conversation):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        conversation.insert(0, {
            "role": "system",
            "content": [{
                "type": "text",
                "text": summaryPrompt() 
            }
                        ]
        })

        if self.debug:
            time.sleep(2)
            return "Example summary"

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation,
            temperature=0,
            max_tokens=300
        )   


        summary = str(response.choices[0].message.content)
        summary = "The following is a summary of the previous conversation:\n\n" + summary
        return summary

    def ask(self, conversation, prompt, prompt_type):
        # Retreive the OpenAI API Key
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        conversation.insert(0, {
            "role": "system",
            "content": [{
                "type": "text",
                "text": prompt
            }
                        ]
        })
        displayConversation(conversation)

        if self.debug:
            with open(example_response_file) as f:
                for line in f:
                    for word in line.split(" "):
                        time.sleep(0.02)
                        yield word + " "
            return


        temperature = 0.7
        if prompt_type == PromptType.PROBLEM:
            temperature = 0

        # Send the request to OpenAI API
        stream = client.chat.completions.create(
            model="gpt-4o",
            messages=conversation,
            temperature=temperature,
            stream=True,
        )

        # Extract the content of the returned message
        for chunk in stream:
            content = chunk.choices[0].delta.content 
            if content is not None:
                yield content





def wrap(text, indent=0):
    scentences = text.split("\n")
    wrapped_paragraphs = [textwrap.fill(scentence) for scentence in scentences]
    lines = []
    for paragraph in wrapped_paragraphs:
        for line in paragraph.split("\n"):
            lines.append(("    " * indent) + line)

    return lines

def displayConversation(conversation):
    print("\n\n")
    print("Sending the following query to ChatGPT:")
    print("=" * 74)
    for message in conversation:
        print(f'{message["role"]}: ')
        for line in wrap(message["content"][0]["text"], indent=1):
            print(line)
    print("=" * 74)

