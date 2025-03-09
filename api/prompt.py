import os
from enum import Enum

MODELS_DIR = "api" + os.sep + "models" 

class PromptType(Enum):
    PROBLEM = 1
    CONCEPT = 2


class UtilityPromptManager:
    image_prompt_file: str
    summary_prompt_file: str

    def __init__(self, image_file, summary_file):
        self.image_prompt_file = image_file
        self.summary_prompt_file = summary_file

    def summaryPrompt(self):
        summary_file = open(self.summary_prompt_file)
        return summary_file.read()
    def imagePrompt(self):
        image_file = open(self.image_prompt_file)
        return image_file.read()


class PromptManager:
    concept_prompt_file: str
    problem_prompt_file: str

    def __init__(self, concept_file, problem_file):
        self.concept_prompt_file = concept_file
        self.problem_prompt_file = problem_file


    def conceptPrompt(self, brevity: str):
        prompt = open(self.concept_prompt_file).read()

        return_prompt = (prompt
            .replace("{$brevity}", brevity))

        return return_prompt

    def problemPrompt(self, brevity: str):
        prompt = open(self.problem_prompt_file).read()

        return_prompt = (prompt
            .replace("{$brevity}", brevity))

        return return_prompt

    def instructions(self, prompt_type: PromptType, brevity: str):
        if prompt_type == PromptType.PROBLEM:
            return self.problemPrompt(brevity) 
        elif prompt_type == PromptType.CONCEPT:
            return self.conceptPrompt(brevity)

