from dataclasses import dataclass
import json
from typing import Any
from collections.abc import Generator
from flask import current_app
from openai import AsyncOpenAI, OpenAI
from pydantic import BaseModel

from app.core.types import Mode, ModelType
from app.core.prompt import PromptManager, UtilityType
import os


@dataclass
class AIConfig:
    concept_model: ModelType
    problem_model: ModelType
    study_model: ModelType
    utility_model: ModelType
    mode_model: ModelType
    debug_mode: bool
    mock_mode: bool
    conversation_max_tokens: int


class ModeResponse(BaseModel):
    mode: Mode

class AIService:
    config: AIConfig
    async_client: AsyncOpenAI
    client: OpenAI
    def __init__(self, config: AIConfig, client: OpenAI, async_client: AsyncOpenAI, prompt_manager: PromptManager):
        self.config = config
        self.async_client = async_client
        self.client = client
        self.prompt_manager: PromptManager = prompt_manager

    def _getModel(self, prompt_type: Mode) -> ModelType:
        if prompt_type == Mode.PROBLEM:
            return self.config.problem_model
        elif prompt_type == Mode.CONCEPT:
            return self.config.concept_model
        elif prompt_type == Mode.OTHER:
            return self.config.study_model

    def _getDeveloperRole(self, model: ModelType) -> str:
        if model == ModelType.o3_mini or model == ModelType.o4_mini:
            return "developer"
        else:
            return "system"

    def getMessage(self, current_conversation: Any, course_code: str, prompt_type: Mode, brevity: str = "Detailed") -> Generator[str]:

        model = self._getModel(prompt_type)
        instructions = self.prompt_manager.getInstructions(prompt_type, model)
        outline = self.prompt_manager.getOutline(course_code)
        prompt = instructions + "\n" + outline
        prompt = prompt.replace("{$brevity}", brevity)

        conversation: Any = [{"role": "system", "content": prompt}, *current_conversation]

        stream = self.client.chat.completions.create(
            messages=conversation,
            model=model.value,
            reasoning_effort="low",
            max_tokens=5000,
            stream=True,
        )
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content


    async def getTranscription(self, image: str) -> str:
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

        transcription = str(response.choices[0].message.content)

        return transcription

    async def getSummary(self, conversation: Any) -> str:

        instructions = self.prompt_manager.getUtilityPrompt(UtilityType.SUMMARY).replace("${conversation}", json.dumps(conversation))

        response = await self.async_client.chat.completions.create(
            model=self.config.utility_model.value,
            messages=[
                {
                    "role": "user",
                    "content": instructions
                },
            ],
            temperature=0,
            max_tokens=600
        )   

        summary = str(response.choices[0].message.content)
        summary = "The following is a summary of the previous conversation:\n\n" + summary

        return summary

    async def getTitle(self, question: str) -> str:


        instructions = self.prompt_manager.getUtilityPrompt(UtilityType.TITLE).replace("${question}", question)
        response = await self.async_client.chat.completions.create(
            model=self.config.utility_model.value,
            messages=[
                {
                    "role": "user",
                    "content": instructions
                },
            ],
        )

        title = str(response.choices[0].message.content)
        return title

    async def getMode(self, question: str, type: Mode | None) -> str:
        instructions = self.prompt_manager.getModePrompt(type).replace("${question}", str(question))

        class ModeResponse(BaseModel):
            mode: Mode
        response = await self.async_client.responses.parse(
            model=self.config.mode_model.value,
            input=[
                {
                    "role": "user",
                    "content": instructions,
                },
            ],
            text_format=ModeResponse
        )

        res = response.output_parsed
        if res == None:
            raise ValueError("Mode fetch did not return a response")
        return res.mode.value
