from abc import ABC, abstractmethod
from collections.abc import Generator
import os
from api.prompt import PromptManager

EXAMPLE_RESPONSE_FILEPATH = "api" + os.sep + "example_response.md"
EXAMPLE_REVIEW_FILEPATH = "api" + os.sep + "example_review.md"

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


class TutorModel(ABC):
    prompt_manager: PromptManager 
    debug: bool
    mock: bool
    estimated_cost: float
    @abstractmethod
    def ask(self, conversation, course_prompt, prompt_type, brevity) -> Generator[str, None, None]:
        pass

class ReviewerModel(ABC):
    prompt_manager: PromptManager 
    debug: bool
    mock: bool
    estimated_cost: float
    @abstractmethod
    def review(self, conversation, course_prompt) -> Generator[str, None, None]:
        pass


def estimateTokens(length):
    return length * 0.25

