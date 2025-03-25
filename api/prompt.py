from dataclasses import dataclass
import os
from enum import Enum

MODELS_DIR = "api" + os.sep + "models" 

class PromptType(Enum):
    PROBLEM = 1
    CONCEPT = 2


@dataclass
class PromptManagerConfig:
    Concept: bool = False
    concept_path: str = ""
    Problem: bool = False
    problem_path: str = ""
    Summary: bool = False
    summary_path: str = ""
    Transcription: bool = False
    transcription_path: str = ""

class InvalidConfigurationException(Exception):
    """Raised when PromptManager configuration does not include prompt being requested"""
    pass


class PromptManager:
    concept_path: str = ""
    problem_path: str = ""
    summary_path: str = ""
    transcription_path: str = ""
    review_path: str = ""


    def setConcept(self, concept_path):
        self.concept_path = concept_path

    def setProblem(self, problem_path):
        self.problem_path = problem_path

    def setSummary(self, summary_path):
        self.summary_path = summary_path

    def setTranscription(self, transcription_path):
        self.transcription_path = transcription_path

    def setReview(self, review_path):
        self.review_path = review_path

    def conceptPrompt(self, brevity: str):
        if not self.concept_path: 
            raise InvalidConfigurationException("Concept prompt has not been enabled for this prompt manager")

        prompt = open(self.concept_path).read()
        return_prompt = (prompt
            .replace("{$brevity}", brevity))

        return return_prompt

    def problemPrompt(self, brevity: str):
        if not self.problem_path: 
            raise InvalidConfigurationException("Problem prompt has not been enabled for this prompt manager")

        prompt = open(self.problem_path).read()
        return_prompt = (prompt
            .replace("{$brevity}", brevity))

        return return_prompt

    def summaryPrompt(self):
        if not self.summary_path: 
            raise InvalidConfigurationException("Summary prompt has not been enabled for this prompt manager")

        summary_file = open(self.summary_path)
        return summary_file.read()

    def transcriptionPrompt(self):
        if not self.transcription_path: 
            raise InvalidConfigurationException("Transcription prompt has not been enabled for this prompt manager")

        image_file = open(self.transcription_path)

        return image_file.read()

    def reviewPrompt(self):
        if not self.review_path:
            raise InvalidConfigurationException("Review prompt has not been enabled for this prompt manager")

        review_file = open(self.review_path)

        return review_file.read()

    def instructions(self, prompt_type: PromptType, brevity: str):
        if not self.problem_path or not self.concept_path:
            raise InvalidConfigurationException("Calling instructions() while missing either problem or concept prompt")

        if prompt_type == PromptType.PROBLEM:
            return self.problemPrompt(brevity) 
        elif prompt_type == PromptType.CONCEPT:
            return self.conceptPrompt(brevity)

