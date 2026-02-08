import asyncio
from typing import Any, Callable
from collections.abc import Coroutine
from tests.test_mode_switch import run_mode_tests
from tests.fixture import Fixture
from tests.test_titles import testCasualConversationTitles, testConversationTitles
from tests.benchmarks import benchmark_mode, benchmark_title
import argparse




if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test suite for Sam")
    _ = parser.add_argument(
        "action",
        type=str,
        choices=["all", "benchmark", "title", "mode"],
        help="The type of tests to perform"
    )

    _ = parser.add_argument(
        "--iters",
        type=int,
        help="Number of iterations for each test"
    )

    test_fixture = Fixture()
    # test_fixture.mode_test_case = -1

    test_functions: list[Callable[[Fixture], Coroutine[Any, Any, None]]] = []
    args = parser.parse_args()
    if args.iters:
        test_fixture.setIterations(args.iters)
    if args.action == "benchmark" or args.action == "all":
        test_functions.append(benchmark_mode)
        test_functions.append(benchmark_title)
    if args.action == "title" or args.action == "all":
        test_functions.append(testCasualConversationTitles)
        test_functions.append(testConversationTitles)
    if args.action == "mode" or args.action == "all":
        test_functions.append(run_mode_tests)

    for test_func in test_functions:
        asyncio.run(test_func(test_fixture))

    exit(0)
