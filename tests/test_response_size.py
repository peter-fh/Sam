from flask import json
from api.gpt import GPT
from prompt.prompt_manager import PromptType, prompt
import os

test_dir = "tests"
problem_file = test_dir + os.sep + "problems.json"


def testFirstMessageLengthManual(gpt: GPT, count=-1):
    instructions = prompt(PromptType.PROBLEM, "MATH_203", "Detailed")

    with open(problem_file) as f:
        cases = 0
        passed_cases = 0
        failed_cases = 0
        test_cases = json.load(f)
        problems = test_cases["problems"]
        if count > len(problems) or count < 0:
            count = len(problems)

        for problem_obj in problems[0:count]:
            problem = problem_obj["problem"]

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
            print("TEST CASE (%d characters): %s" % (len(final_response), problem))
            print("RESPONSE:\n%s" % final_response)
            valid_input = False
            passed = False
            print("=" * 100)
            print()
            print("Did this pass? (y/n): ", end="")
            while not valid_input:
                inp = input()
                valid_input = True
                if inp == "y":
                    passed = True
                elif inp == "n":
                    passed = False
                else:
                    valid_input = False

            if passed:
                failed_cases += 1
            else:
                passed_cases += 1
        print("Passed: %d, failed: %d, total: %d" % (passed_cases, failed_cases, cases))



# In Problem mode, the chatbot should not answer the entire question in the first message.
# When working with the problem instructions prompt, verifying that the chatbot doesn't
# try and solve too much within its first message allows us to see whether the problem 
# prompt is working.
# COST: ~$1.5 estimate, though the estimation is way off of reality from the API dashboard. Actual is like $0.20.
def testFirstMessageLength(gpt: GPT, failing_size=1000, count=-1, show_all=False):
    instructions = prompt(PromptType.PROBLEM, "MATH_203", "Detailed")

    with open(problem_file) as f:
        cases = 0
        passed_cases = 0
        failed_cases = 0
        test_cases = json.load(f)
        problems = test_cases["problems"]
        if count > len(problems) or count < 0:
            count = len(problems)

        for problem_obj in problems[0:count]:
            problem = problem_obj["problem"]

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
            if len(final_response) > failing_size:
                print("FAILED TEST CASE (%d characters): %s" % (len(final_response), problem))
                print("RESPONSE:\n%s" % final_response)
                failed_cases += 1
            else:
                print("PASSED TEST CASE (%d characters): %s" % (len(final_response), problem))
                if show_all:
                    print("RESPONSE:\n%s" % final_response)
                passed_cases += 1
            print("=" * 100)
            print()
        print("Passed: %d, failed: %d, total: %d" % (passed_cases, failed_cases, cases))


