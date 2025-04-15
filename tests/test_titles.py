import os
from flask import json
from api.model import UtilityModel


test_dir = "tests"
problem_file = test_dir + os.sep + "problems.json"

def testConversationTitles(model, count=-1):
    with open(problem_file) as f:
        test_cases = json.load(f)
        problems = test_cases["problems"]
        if count > len(problems) or count < 0:
            count = len(problems)

        for problem_obj in problems[0:count]:
            problem = problem_obj["problem"]
            title = model.title(problem)
            print("=" * 50)
            print("Question: ", problem)
            print("Title: ", title)
            print("=" * 50)
            print()

