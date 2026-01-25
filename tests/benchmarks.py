import time
from api.api import API
import asyncio

from tests.fixture import Fixture

async def benchmark_mode(fixture: Fixture):
    total_start = time.time()
    prompt_type = None
    conversation = "Derivative of x^2"
    api_start = time.time()

    prompt_type = await fixture.api.getMode(conversation, prompt_type)
    api_end = time.time()

    total_end = time.time()
    total_duration = total_end - total_start
    api_duration = api_end - api_start
    print("Total get mode took %s seconds" % total_duration)
    print("API get mode took %s seconds" % api_duration)
    print(prompt_type)

async def benchmark_title(fixture: Fixture):
    conversation = "Derivative of x^2"

    api_start = time.time()
    title = await fixture.api.getTitle(conversation)
    api_end = time.time()

    api_duration = api_end - api_start
    print("API get mode took %s seconds" % api_duration)
    print(title)
