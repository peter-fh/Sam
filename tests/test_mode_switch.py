import json
from pathlib import Path
from typing import Any
from app.core.types import Mode
from tests.fixture import Fixture


async def run_mode_tests(fixture: Fixture):
    test_case_file = Path("./tests/mode_conversations.json")
    mode_cases = json.loads(test_case_file.read_text())
    case_totals = {
        "from": {
        Mode.PROBLEM: 0,
        Mode.CONCEPT: 0,
        Mode.OTHER: 0,
        None: 0,
        },
        "to": {
        Mode.PROBLEM: 0,
        Mode.CONCEPT: 0,
        Mode.OTHER: 0,
        None: 0,
        }
    }
    case_results = {
        "from": {
        Mode.PROBLEM: 0,
        Mode.CONCEPT: 0,
        Mode.OTHER: 0,
        None: 0,
        },
        "to": {
        Mode.PROBLEM: 0,
        Mode.CONCEPT: 0,
        Mode.OTHER: 0,
        None: 0,
        }
    }
    async def run_test_case(case: Any):
        print("=" * 30)
        conversation = case["conversation"]
        from_raw = case["from"].upper()
        to_raw = case["mode"].upper()
        from_mode: Mode | None
        if from_raw == "NONE":
            from_mode = None
        else:
            from_mode = Mode[from_raw]
        to_mode: Mode
        to_mode = Mode[to_raw]
        received_mode_raw: str= await fixture.api.getMode(conversation, from_mode)
        received_mode: Mode = Mode[received_mode_raw.upper()]
        case_totals["from"][from_mode] += 1
        case_totals["to"][to_mode] += 1
        if received_mode == to_mode:
            case_results["from"][from_mode] += 1
            case_results["to"][to_mode] += 1
        print(f"conversation: {conversation}")
        print(f"Expected mode: {to_mode}")
        print(f"Received mode: {received_mode}")
        print("=" * 30)
        print("\n")

    if fixture.mode_test_case != None:
        for i in range(fixture.test_iterations):
            await run_test_case(mode_cases[fixture.mode_test_case])
    else:
        for i in range(fixture.test_iterations):
            for case in mode_cases:
                await run_test_case(case)

    print("=" * 30)
    print("Mode test results:")
    for mode in Mode:
        print(f"From {mode}: {case_results["from"][mode]}/{case_totals["from"][mode]}")
    print(f"From None: {case_results["from"][None]}/{case_totals["from"][None]}")
    for mode in Mode:
        print(f"To {mode}: {case_results["to"][mode]}/{case_totals["to"][mode]}")
    print(f"To None: {case_results["to"][None]}/{case_totals["to"][None]}")
    print("=" * 30)


