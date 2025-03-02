from flask import json
from api.gpt import GPT
from prompt.prompt_manager import PromptType, prompt
import os

test_dir = "tests"
problem_file = test_dir + os.sep + "problems.json"


# In Problem mode, the chatbot should not answer the entire question in the first message.
# When working with the problem instructions prompt, verifying that the chatbot doesn't
# try and solve too much within its first message allows us to see whether the problem 
# prompt is working.
# COST: ~$1.5 estimate, though the estimation is way off of reality from the API dashboard. Actual is like $0.20.
def testFirstMessageLength(gpt: GPT, count=-1):
    instructions = prompt(PromptType.PROBLEM, "MATH_203", "Detailed")

    with open(problem_file) as f:
        cases = 0
        passed_cases = 0
        failed_cases = 0
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

            cases += 1
            if len(final_response) > 1000:
                print("FAILED TEST CASE (%d characters): %s" % (len(final_response), problem))
                print("RESPONSE:\n%s" % final_response)
                failed_cases += 1
            else:
                print("PASSED TEST CASE (%d characters): %s" % (len(final_response), problem))
                passed_cases += 1
            print("=" * 100)
            print()
        print("Passed: %d, failed: %d, total: %d" % (passed_cases, failed_cases, cases))


