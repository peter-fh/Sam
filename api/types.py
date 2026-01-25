from dataclasses import dataclass
from enum import Enum
from pathlib import Path


class ModelType(Enum):
    gpt_5_2 = "openai/gpt-5.2"
    gpt_5 = "openai/gpt-5"
    gpt_5_mini = "openai/gpt-5-mini"
    o3_mini = "openai/o3-mini"
    o4_mini = "openai/o4-mini"
    gpt_4_1 = "openai/gpt-4.1"
    gpt_4_1_mini = "openai/gpt-4.1-mini"
    gemini_2_5_flash = "google/gemini-2.5-flash"
    gemini_2_5_flash_lite = "google/gemini-2.5-flash-lite"
    gemini_2_0_flash_lite = "google/gemini-2.0-flash-lite-001"
    claude_haiku_4_5 = "anthropic/claude-haiku-4.5"


class Mode(Enum):
    PROBLEM = "Problem"
    CONCEPT = "Concept"
    OTHER = "Other"


@dataclass
class PromptManagerConfig:
    outline_dir: Path
    concept_dir: Path
    problem_dir: Path
    default_dir: Path
    util_dir: Path
    mode_dir: Path

class UtilityType(Enum):
    SUMMARY = "summary"
    TITLE = "title"
    TRANSCRIPTION = "transcription"

class PromptManager:
    config: PromptManagerConfig
    def __init__(self, config: PromptManagerConfig):
        self.config = config

    def getFormattingString(self):
        formatting_filepath = self.config.util_dir / 'formatting.md'
        formatting_str = formatting_filepath.open('r').read()
        return formatting_str

    def readLocalPrompt(self, filepath: Path) -> str:
        prompt_raw = filepath.open('r').readlines()
        prompt = "\n".join(prompt_raw)
        return prompt

    def readNetlifyPrompt(self, filepath: Path) -> str:
        prompt_raw = filepath.open('r').readlines()
        formatting_string = self.getFormattingString()
        prompt = formatting_string + "\n" + "\n".join(prompt_raw[3:])
        return prompt

    def getModePrompt(self, mode: Mode | None) -> str:
        mode_filepath: Path | None = None
        if mode == Mode.PROBLEM:
            mode_filepath = self.config.mode_dir / 'problem.md'
        elif mode == Mode.CONCEPT:
            mode_filepath = self.config.mode_dir / 'concept.md'
        elif mode == Mode.OTHER:
            mode_filepath = self.config.mode_dir / 'other.md'
        else:
            mode_filepath = self.config.mode_dir / 'none.md'

        return self.readLocalPrompt(mode_filepath)

    def getInstructions(self, mode: Mode, model: ModelType) -> str:
        model_filename = model.value.replace("/", "_") + ".md"
        prompt_dir: Path | None = None
        if mode == Mode.PROBLEM:
            prompt_dir = self.config.problem_dir
        if mode == Mode.CONCEPT:
            prompt_dir = self.config.concept_dir
        if mode == Mode.OTHER:
            prompt_dir = self.config.default_dir

        if prompt_dir == None:
            raise ValueError("Invalid mode given to getInstructions")

        model_filepath: Path = prompt_dir / model_filename
        if model_filepath.is_file():
            return self.readNetlifyPrompt(model_filepath)

        model_filepath = prompt_dir / "default.md"
        return self.readNetlifyPrompt(model_filepath)

    def getOutline(self, course_code: str):
        outline_filename = course_code.lower().replace(" ", "-") + ".md"
        outline_path = self.config.outline_dir / outline_filename
        return self.readNetlifyPrompt(outline_path)

    def getUtilityPrompt(self, utility_type: UtilityType):
        prompt_filename = utility_type.value + ".md"
        prompt_filepath = self.config.util_dir / prompt_filename
        return self.readLocalPrompt(prompt_filepath)

