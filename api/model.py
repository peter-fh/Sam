from abc import ABC, abstractmethod
from collections.abc import Generator

from api.prompt import PromptManager

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
    input_token_cost: float
    output_token_cost: float
    input_token_count: float
    output_token_count: float
    estimated_cost: float
    @abstractmethod
    def ask(self, conversation, course_prompt, prompt_type, brevity) -> Generator[str, None, None]:
        pass
