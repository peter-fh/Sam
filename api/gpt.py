import time
from openai import OpenAI
import os
from dotenv import load_dotenv
import textwrap
from prompt.prompt_manager import PromptType, summaryPrompt, imagePrompt

api_dir = "api"
example_response_file = api_dir + os.sep + "example_response.txt"

cheap_model = "gpt-4o-mini"
math_model = "o3-mini"

INPUT_TOKEN_COST = 2.5 / 1000000
OUTPUT_TOKEN_COST = 10 / 1000000


class GPT:
    client: OpenAI
    debug: bool
    input_token_count: float
    output_token_count: float
    estimated_cost: float

    def __init__(self, api_key: str):
        load_dotenv(override=True)
        self.client = OpenAI(api_key=api_key)
        self.input_token_count = 0
        self.output_token_count = 0
        self.estimated_cost = 0.0


    def estimateTokens(self, length):
        return length * 0.25

    def resetCost(self):
        self.input_token_count = 0
        self.output_token_count = 0

    def transcribe(self, image):

        if self.debug:
            time.sleep(2)
            return "This conversation concerns an image sent by the user. It's transcription is as follows:\n\n" + "x^2*e^x (example response)"

        try:
            # Send the request to OpenAI API
            response = self.client.chat.completions.create(
                model=cheap_model,
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
        except:
            print("Transcription error")
            return "There is supposed to be a transcription of an image, but there was a fatal error."

        transcription = str(response.choices[0].message.content)
        transcription = "The following is a transcription of an image sent by the user:\n\n" + transcription
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

        try:
            response = client.chat.completions.create(
                model=cheap_model,
                messages=conversation,
                temperature=0,
                max_tokens=300
            )   
        except:
            print("Summary error")
            return "There is supposed to be a summary here, but a fatal error has occurred."


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
        # displayConversation(conversation)

        if self.debug:
            with open(example_response_file) as f:
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
            stream = client.chat.completions.create(
                model=math_model,
                messages=conversation,
                # temperature=temperature,
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


        # Extract the content of the returned message
        total_output_characters = 0
        for chunk in stream:
            content = chunk.choices[0].delta.content 
            if content is not None:
                total_output_characters += len(content)
                yield content

        self.input_token_count += self.estimateTokens(total_input_characters)
        self.output_token_count += self.estimateTokens(total_output_characters)
        self.estimated_cost += self.input_token_count * INPUT_TOKEN_COST + self.output_token_count * OUTPUT_TOKEN_COST

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

