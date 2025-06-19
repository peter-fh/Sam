from abc import ABC, abstractmethod
from collections.abc import Generator
from enum import Enum
from openai import OpenAI
import os

from dataclasses import dataclass
import time
from api.log import displayConversation
from api.models.o3_mini.model import OpenAI_o3_mini
from api.prompt import PromptManager, PromptType
from db import Database




class UtilityModel(ABC):
    prompt_manager: PromptManager 
    mock: bool
    debug: bool
    @abstractmethod
    def transcribe(self, image) -> str:
        pass

    @abstractmethod
    def summarize(self, conversation) -> str:
        pass

    @abstractmethod
    def title(self, question) -> str:
        pass


class TutorModel(ABC):
    prompt_manager: PromptManager 
    debug: bool
    mock: bool
    @abstractmethod
    def ask(self, conversation, course_prompt, prompt_type, brevity) -> Generator[str, None, None]:
        pass

class ReviewerModel(ABC):
    prompt_manager: PromptManager 
    debug: bool
    mock: bool
    @abstractmethod
    def review(self, conversation, course_prompt) -> Generator[str, None, None]:
        pass


def estimateTokens(length):
    return length * 0.25

