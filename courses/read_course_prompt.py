import os
from enum import Enum

class PromptType(Enum):
    PROBLEM = 1
    CONCEPT = 2


COURSE_DIR = "courses"
def coursePrompt(course_code: str):
    course_filename = COURSE_DIR + os.sep + course_code.replace(" ", "_") + ".md"
    course_file = open(course_filename)

    prompt = course_file.read()

    return prompt 


if __name__ == "__main__":
    print(coursePrompt("MATH 203"))
