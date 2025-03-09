import time
from typing import Generator
from openai import OpenAI
import os
from dotenv import load_dotenv
import textwrap
from abc import ABC, abstractmethod

EXAMPLE_RESPONSE_FILEPATH = "api" + os.sep + "example_response.txt"


def estimateTokens(length):
    return length * 0.25

