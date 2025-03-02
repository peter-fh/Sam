import os
from enum import Enum

class PromptType(Enum):
    PROBLEM = 1
    CONCEPT = 2


prompt_dir = "prompt"
course_prompt_dir = prompt_dir + os.sep + "course"
instructions_dir = prompt_dir + os.sep + "instructions"
helper_dir = prompt_dir + os.sep + "helpers"
concept_prompt_file = instructions_dir + os.sep + "concept.md"
problem_prompt_file = instructions_dir + os.sep + "problem.md"
image_prompt_file = helper_dir + os.sep + "transcription.md"
summary_prompt_file = helper_dir + os.sep + "summary.md"

def summaryPrompt():
    summary_file = open(summary_prompt_file)
    return summary_file.read()

def imagePrompt():
    image_file = open(image_prompt_file)
    return image_file.read()

def coursePrompt(course_code: str):
    # Open the coures json file and extract the course specific information
    course_filename = course_prompt_dir + os.sep + course_code.replace(" ", "_") + ".md"
    course_file = open(course_filename)

    # Open and read the prompt txt file
    prompt = course_file.read()

    return prompt 

def conceptPrompt(brevity: str):
    prompt = open(concept_prompt_file).read()

    return_prompt = (prompt
        .replace("{$brevity}", brevity))

    return return_prompt

def problemPrompt(brevity: str):
    prompt = open(problem_prompt_file).read()

    return_prompt = (prompt
        .replace("{$brevity}", brevity))

    print(return_prompt)
    return return_prompt


def prompt(prompt_type: PromptType, course_code: str, brevity: str):
    if prompt_type == PromptType.PROBLEM:
        return problemPrompt(brevity) + coursePrompt(course_code)
    elif prompt_type == PromptType.CONCEPT:
        return conceptPrompt(brevity) + coursePrompt(course_code)



# [Debug] Get example prompt and display it on the terminal
if __name__ == "__main__":
    print(coursePrompt("MATH 203"))
