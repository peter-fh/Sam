from abc import ABC, abstractmethod
from collections.abc import Generator
import os
from api.prompt import PromptManager

EXAMPLE_RESPONSE_FILEPATH = "api" + os.sep + "example_response.md"

class UtilityModel(ABC):
    prompt_manager: PromptManager 
    debug: bool
    @abstractmethod
    def transcribe(self, image) -> str:
        pass

    @abstractmethod
    def summarize(self, conversation) -> str:
        pass


class MathModel(ABC):
    prompt_manager: PromptManager 
    debug: bool
    estimated_cost: float
    enable_logging: bool
    @abstractmethod
    def ask(self, conversation, course_prompt, prompt_type, brevity) -> Generator[str, None, None]:
        pass

def estimateTokens(length):
    return length * 0.25

