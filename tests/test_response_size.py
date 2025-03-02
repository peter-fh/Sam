from flask import json
from api.gpt import GPT
from prompt.prompt_manager import PromptType, prompt
import os

test_dir = "tests"
problem_file = test_dir + os.sep + "problems.json"


def testFirstMessageLength(gpt: GPT, count=-1):
    instructions = prompt(PromptType.PROBLEM, "MATH_203", "Detailed")

    with open(problem_file) as f:
        test_cases = json.load(f)
        problems = test_cases["problems"]
        if count > len(problems) or count < 0:
            count = len(problems)

        for problem in problems[0:count]:
            final_response = ""
            conversation = [{
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": problem
                }]
            }]

            stream = gpt.ask(conversation, instructions, PromptType.PROBLEM)
            for line in stream:
                final_response += line


            print("=" * 100)
            if final_response == "":
                raise ValueError("Stream didn't return anything!")

            if len(final_response) > 1000:
                print("FAILED TEST CASE (%d characters): %s" % (len(final_response), problem))
                print("RESPONSE:\n%s" % final_response)
            else:
                print("PASSED TEST CASE (%d characters): %s" % (len(final_response), problem))
            print("=" * 100)
            print()


