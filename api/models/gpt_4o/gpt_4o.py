import time
import os
from dotenv import load_dotenv
from openai import OpenAI
from api.log import displayConversation
from api.model import TutorModel, EXAMPLE_RESPONSE_FILEPATH, estimateTokens
from api.prompt import PromptManager, MODELS_DIR, PromptType


GPT_4O_DIR = MODELS_DIR + os.sep + "gpt_4o"
CONCEPT_FILE_PATH = GPT_4O_DIR + os.sep + "concept.md"
PROBLEM_FILE_PATH = GPT_4O_DIR + os.sep + "problem.md"

class OpenAI_4o(TutorModel):
    debug: bool
    mock: bool
    prompt_manager: PromptManager
    client: OpenAI
    input_token_cost: float
    output_token_cost: float
    input_token_count: float
    output_token_count: float
    estimated_cost: float

    def __init__(self, api_key: str, mock=False, debug=False):
        load_dotenv(override=True)
        self.client = OpenAI(api_key=api_key)
        self.mock = mock
        self.debug = debug

        self.input_token_cost = 2.5 / 1000000
        self.prompt_manager = PromptManager()
        self.prompt_manager.setConcept(CONCEPT_FILE_PATH)
        self.prompt_manager.setProblem(PROBLEM_FILE_PATH)
        self.output_token_cost = 10 / 1000000
        self.input_token_count = 0
        self.output_token_count = 0
        self.estimated_cost = 0


    def ask(self, conversation, course_prompt, prompt_type, brevity):


        prompt = self.prompt_manager.instructions(prompt_type, brevity) + "\n" + course_prompt

        conversation.insert(0, {
            "role": "system",
            "content": [{
                "type": "text",
                "text": prompt
            }
                        ]
        })

        if self.debug:
            displayConversation(conversation)

        if self.mock:
            with open(EXAMPLE_RESPONSE_FILEPATH) as f:
                for line in f:
                    for word in line.split(" "):
                        time.sleep(0.002)
                        yield word + " "
            return

        temperature = 0.7
        if prompt_type == PromptType.PROBLEM:
            temperature = 0

        try:
            # Send the request to OpenAI API
            stream = self.client.chat.completions.create(
                model="gpt-4o",
                messages=conversation,
                temperature=temperature,
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

