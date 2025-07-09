from enum import Enum
import time
from dataclasses import dataclass
from typing import Literal

from openai import OpenAI
from pydantic import BaseModel

from api.log import displayConversation
from api.prompt import PromptType
from db import Database
import os

EXAMPLE_RESPONSE_FILEPATH = "api" + os.sep + "example_response.md"
STATIC_PROMPT_DIR = "api" + os.sep + "static"
SUMMARY_FILE_PATH = STATIC_PROMPT_DIR + os.sep + "summary.md"
TITLE_FILE_PATH = STATIC_PROMPT_DIR + os.sep + "title.md"
TRANSCRIPTION_FILE_PATH = STATIC_PROMPT_DIR + os.sep + "transcription.md"
GET_MODE_FILE_PATH = STATIC_PROMPT_DIR + os.sep + "get_mode.md"


class ModelType(Enum):
    o3_mini = "o3-mini"
    o4_mini = "o4-mini"
    gpt_4_1 = "gpt-4.1"
    gpt_4_1_mini = "gpt-4.1-mini"

@dataclass
class APIConfig:
    concept_model: ModelType
    problem_model: ModelType
    study_model: ModelType
    utility_model: ModelType
    debug_mode: bool
    mock_mode: bool
    pass

class ModeResponse(BaseModel):
    mode: Literal['Problem', 'Concept', 'Other']

class API:
    config: APIConfig
    client: OpenAI
    db: Database
    def __init__(self, config: APIConfig, client: OpenAI, db: Database):
        self.config = config
        self.client = client
        self.db = db

    def getModel(self, prompt_type: PromptType):
        if prompt_type == PromptType.PROBLEM:
            return self.config.problem_model
        elif prompt_type == PromptType.CONCEPT:
            return self.config.concept_model
        elif prompt_type == PromptType.STUDYING:
            return self.config.study_model

    def getDeveloperRole(self, model):
        if model == ModelType.o3_mini or model == ModelType.o4_mini:
            return "developer"
        else:
            return "system"

    def ask(self, conversation, course_code, prompt_type: PromptType, brevity):

        model = self.getModel(prompt_type)
        print("===")
        print(prompt_type.value)
        print(model.value)
        print("===")
        instructions = self.db.getPrompt(prompt_type.value, model.value)
        outline = self.db.getOutline(course_code)
        prompt = instructions + "\n" + outline
        prompt = prompt.replace("{$brevity}", brevity)

        conversation.insert(0, {
            "role": self.getDeveloperRole(model),
            "content": [{
                "type": "text",
                "text": prompt
            }
                        ]
        })

        # if self.config.debug_mode:
        #    displayConversation(conversation)

        if self.config.mock_mode:
            time.sleep(4)
            with open(EXAMPLE_RESPONSE_FILEPATH) as f:
                for line in f:
                    for word in line.split(" "):
                        time.sleep(0.002)
                        yield word + " "
            return


        try:
            stream = self.client.chat.completions.create(
                model=model.value,
                messages=conversation,
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

    def transcribe(self, image):

        if self.config.mock_mode:
            time.sleep(2)
            return "This conversation concerns an image sent by the user. It's transcription is as follows:\n\n" + "x^2*e^x (example response)"

        try:
            instructions = open(TRANSCRIPTION_FILE_PATH).read()
            response = self.client.chat.completions.create(
                model=self.config.utility_model.value,
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

        return transcription

    def summarize(self, conversation):

        instructions = open(SUMMARY_FILE_PATH).read()
        conversation.insert(0, {
            "role": "system",
            "content": [{
                "type": "text",
                "text": instructions 
            }
                        ]
        })

        if self.config.mock_mode:
            time.sleep(2)
            return "Example summary"

        try:
            response = self.client.chat.completions.create(
                model=self.config.utility_model.value,
                messages=conversation,
                temperature=0,
                max_tokens=600
            )   
        except:
            print("Summary error")
            return "There is supposed to be a summary here, but a fatal error has occurred."


        summary = str(response.choices[0].message.content)
        summary = "The following is a summary of the previous conversation:\n\n" + summary

        return summary

    def title(self, question):

        if self.config.mock_mode:
            time.sleep(2)
            return "Example title"

        instructions = open(TITLE_FILE_PATH).read().replace("${question}", question)
        try:
            response = self.client.chat.completions.create(
                model=self.config.utility_model.value,
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

        if self.config.debug_mode:
            print("Title: ", title)
        return title

    def getMode(self, question):
        if self.config.mock_mode:
            time.sleep(1)
            return PromptType.PROBLEM

        instructions = open(GET_MODE_FILE_PATH).read().replace("${question}", str(question))
        try:
            response = self.client.responses.parse(
                model=self.config.utility_model.value,
                input=[
                    {
                        "role": "user",
                        "content": instructions,
                    },
                ],
                text_format=ModeResponse
            )
        except:
            return None


        res = response.output_parsed

        if res == None:
            return None
        mode_raw = res.mode

        if self.config.debug_mode:
            print("Mode: ", mode_raw)
        if mode_raw == "Problem":
            return PromptType.PROBLEM
        if mode_raw == "Concept":
            return PromptType.CONCEPT
        if mode_raw == "Other":
            return PromptType.STUDYING
        return None
