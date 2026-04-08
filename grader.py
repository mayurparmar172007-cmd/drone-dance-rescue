from tasks import get_task


def compute_score(state: dict) -> float:
    task = get_task(state["task_name"])
    survivor_ratio = state["survivors_found"] / max(state["survivors_total"], 1)
    battery_ratio = state["battery_left"] / max(task.battery, 1)
    exploration_ratio = state["explored_cells_count"] / max(task.grid_size * task.grid_size, 1)

    score = 0.6 * survivor_ratio + 0.2 * battery_ratio + 0.2 * exploration_ratio
    return round(max(0.0, min(1.0, score)), 4)
