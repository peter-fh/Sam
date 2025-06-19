import time
import os
from typing import Generator
from dotenv import load_dotenv
from openai import OpenAI
from api.log import displayConversation
from api.model import TutorModel, EXAMPLE_RESPONSE_FILEPATH, estimateTokens
from api.prompt import PromptManager, MODELS_DIR, PromptManagerConfig


O4_DIR = MODELS_DIR + os.sep + "o4_mini"
CONCEPT_FILE_PATH = O4_DIR + os.sep + "concept.md"
PROBLEM_FILE_PATH = O4_DIR + os.sep + "problem.md"

class OpenAI_o4_mini(TutorModel):
    debug: bool
    mock: bool
    prompt_manager: PromptManager
    client: OpenAI
    input_token_cost: float
    output_token_cost: float
    input_token_count: float
    output_token_count: float
    estimated_cost: float

    def __init__(self, api_key: str, debug=False, mock=False):
        load_dotenv(override=True)
        self.client = OpenAI(api_key=api_key)
        self.debug = debug
        self.mock = mock

        self.input_token_cost = 1.1 / 1000000
        config = PromptManagerConfig()
        config.Concept = True
        config.Problem = True
        config.concept_path = CONCEPT_FILE_PATH
        config.problem_path = PROBLEM_FILE_PATH
        self.prompt_manager = PromptManager(config)
        self.output_token_cost = 4.4 / 1000000
        self.input_token_count = 0
        self.output_token_count = 0
        self.estimated_cost = 0

    def ask(self, conversation, course_prompt, prompt_type, brevity):
        prompt = self.prompt_manager.instructions(prompt_type, brevity, debug=self.debug) + "\n" + course_prompt

        conversation.insert(0, {
            "role": "developer",
            "content": [{
                "type": "text",
                "text": prompt
            }
                        ]
        })

        if self.debug:
            displayConversation(conversation)

        if self.mock:
            time.sleep(4)
            with open(EXAMPLE_RESPONSE_FILEPATH) as f:
                for line in f:
                    for word in line.split(" "):
                        time.sleep(0.002)
                        yield word + " "
            return


        try:
            stream = self.client.chat.completions.create(
                model="o4-mini",
                messages=conversation,
                stream=True,
            )
        except Exception as e:
            print("Ask error: ", e)
            yield "This service is currently unavailable, sorry!"
            return

        total_input_characters = 0
        for message in conversation:
            for line in message["content"][0]["text"]:
                total_input_characters += len(line)


        total_output_characters = 0
        for chunk in stream:
            content = chunk.choices[0].delta.content 
            if content is not None:
                total_output_characters += len(content)
                yield content

        self.input_token_count += estimateTokens(total_input_characters)
        self.output_token_count += estimateTokens(total_output_characters)
        self.estimated_cost += self.input_token_count * self.input_token_cost + self.output_token_count * self.output_token_cost

