from dataclasses import dataclass


@dataclass
class TaskConfig:
    name: str
    grid_size: int
    num_survivors: int
    num_obstacles: int
    battery: int
    max_steps: int


TASKS = {
    "easy": TaskConfig("easy", 5, 1, 2, 20, 40),
    "medium": TaskConfig("medium", 7, 2, 5, 18, 60),
    "hard": TaskConfig("hard", 10, 3, 12, 30, 100),
}


def get_task(name: str) -> TaskConfig:
    if name not in TASKS:
        raise ValueError(f"Unknown task: {name}")
    return TASKS[name]


def list_tasks():
    return list(TASKS.keys())
