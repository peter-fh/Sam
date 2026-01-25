from enum import Enum
import time
from dataclasses import dataclass

from flask import json
from gotrue import List
from openai import AsyncOpenAI, OpenAI
from pydantic import BaseModel

from api.types import Mode, ModelType, PromptManager, UtilityType
from db import Database
import os

EXAMPLE_RESPONSE_FILEPATH = "api" + os.sep + "example_response.md"


@dataclass
class APIConfig:
    concept_model: ModelType
    problem_model: ModelType
    study_model: ModelType
    utility_model: ModelType
    mode_model: ModelType
    debug_mode: bool
    mock_mode: bool
    pass


class ModeResponse(BaseModel):
    mode: Mode

class API:
    config: APIConfig
    async_client: AsyncOpenAI
    client: OpenAI
    def __init__(self, config: APIConfig, client: OpenAI, async_client: AsyncOpenAI, prompt_manager: PromptManager):
        self.config = config
        self.async_client = async_client
        self.client = client
        self.prompt_manager: PromptManager = prompt_manager

    def getModel(self, prompt_type: Mode):
        if prompt_type == Mode.PROBLEM:
            return self.config.problem_model
        elif prompt_type == Mode.CONCEPT:
            return self.config.concept_model
        elif prompt_type == Mode.OTHER:
            return self.config.study_model
        else:
            raise ValueError("Prompt type is invalid!")

    def getDeveloperRole(self, model):
        if model == ModelType.o3_mini or model == ModelType.o4_mini:
            return "developer"
        else:
            return "system"

    def getMessage(self, conversation, course_code, prompt_type: Mode, brevity):

        model = self.getModel(prompt_type)
        instructions = self.prompt_manager.getInstructions(prompt_type, model)
        outline = self.prompt_manager.getOutline(course_code)
        prompt = instructions + "\n" + outline
        prompt = prompt.replace("{$brevity}", brevity)

        print("===")
        print(prompt_type.value)
        print(model.value)
        print("===")
        print("Conversation: ")
        print(conversation)
        print("End of conversation")

        conversation.insert(0, {
            "role": "system",
            "content": prompt,
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


        try:
            stream = self.client.chat.completions.create(
                messages=conversation,
                model=model.value,
                reasoning_effort="low",
                max_tokens=5000,
                stream=True,
            )
            for chunk in stream:
                content = chunk.choices[0].delta.content
                yield content
        except Exception as e:
            print("Ask error: ", e)
            yield "This service is currently unavailable, sorry!"




    async def getTranscription(self, image):

        if self.config.mock_mode:
            time.sleep(2)
            return "This conversation concerns an image sent by the user. It's transcription is as follows:\n\n" + "x^2*e^x (example response)"

        try:
            instructions = self.prompt_manager.getUtilityPrompt(UtilityType.TRANSCRIPTION)
            response = await self.async_client.chat.completions.create(
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

    async def getSummary(self, conversation):

        instructions = self.prompt_manager.getUtilityPrompt(UtilityType.SUMMARY)
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
            response = await self.async_client.chat.completions.create(
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

    async def getTitle(self, question):

        if self.config.mock_mode:
            time.sleep(2)
            return "Example title"

        instructions = self.prompt_manager.getUtilityPrompt(UtilityType.TITLE).replace("${question}", question)
        try:
            start_time = time.time()
            response = await self.async_client.chat.completions.create(
                model=self.config.utility_model.value,
                messages=[
                    {
                        "role": "user",
                        "content": instructions
                    },
                ],
            )
            end_time = time.time()
            print('Title in api.py took ' + str(end_time - start_time))
        except:
            print("Title error")
            return "Error Getting Title"


        title = str(response.choices[0].message.content)


        if self.config.debug_mode:
            print("Title: ", title)
        print("Title: ", title)
        return title

    async def getMode(self, question, type: Mode | None):
        if self.config.mock_mode:
            # time.sleep(3)
            return Mode.PROBLEM

        instructions = self.prompt_manager.getModePrompt(type).replace("${question}", str(question))

        start_time = time.time()
        response = await self.async_client.chat.completions.create(
            model=self.config.mode_model.value,
            reasoning_effort=None,
            messages=[
                {
                    "role": "user",
                    "content": instructions,
                },
            ],
            response_format= {
                "type": "json_schema",
                    "json_schema": {
                    "name": "mode",
                    "description": "Which mode is most accurate for the assistant to respond in",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "choice": {
                                "type": "string",
                                "enum": ["Problem", "Concept", "Other"],
                                "description": "Mode for assistant response"
                            }
                        },
                        "required": ["choice"],
                        "additionalProperties": False,
                    }
                }
            },
            max_tokens=100,
        )
        end_time = time.time()
        print("Time for mode fetch within api.py: " + str(end_time - start_time))


        res = response.choices[0].message.content

        if res == None:
            return None
        mode_raw = json.loads(res)["choice"]

        if self.config.debug_mode:
            print("Mode: ", mode_raw)
        return mode_raw
