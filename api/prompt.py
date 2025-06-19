from dataclasses import dataclass
import os
from enum import Enum

from db import Database


class PromptType(Enum):
    PROBLEM = "Problem"
    CONCEPT = "Concept"
    STUDYING = "Studying"


@dataclass
class PromptManagerConfig:
    Concept: bool = False
    concept_path: str = ""
    Problem: bool = False
    problem_path: str = ""
    Strategy: bool = False
    strategy_path: str = ""
    Summary: bool = False
    summary_path: str = ""
    Transcription: bool = False
    transcription_path: str = ""
    Review: bool = False
    review_path: str = ""
    Title: bool = False
    title_path: str = ""

