from enum import Enum

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


