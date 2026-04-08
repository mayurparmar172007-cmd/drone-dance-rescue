
from __future__ import annotations
import random
from typing import Any, Dict, Tuple

from tasks import get_task


UP = 0
DOWN = 1
LEFT = 2
RIGHT = 3
SCAN = 4


class DisasterDroneEnv:
    def __init__(self, task_name: str = "easy", seed: int = 42):
        self.task_name = task_name
        self.seed = seed
        self.rng = random.Random(seed)
        self.reset(task_name=task_name, seed=seed)

    def reset(self, task_name: str | None = None, seed: int | None = None) -> Dict[str, Any]:
        if task_name is not None:
            self.task_name = task_name
        if seed is not None:
            self.seed = seed
            self.rng = random.Random(seed)

        cfg = get_task(self.task_name)
        self.grid_size = cfg.grid_size
        self.max_battery = cfg.battery
        self.max_steps = cfg.max_steps
        self.steps_taken = 0
        self.battery_left = cfg.battery
        self.survivors_total = cfg.num_survivors
        self.survivors_found = 0
        self.done = False
        self.total_reward = 0.0

        self.drone_position = [0, 0]

        all_cells = [
            (r, c)
            for r in range(self.grid_size)
            for c in range(self.grid_size)
            if (r, c) != (0, 0)
        ]
        self.rng.shuffle(all_cells)

        self.obstacles = set(all_cells[: cfg.num_obstacles])
        survivor_cells = all_cells[cfg.num_obstacles : cfg.num_obstacles + cfg.num_survivors]
        self.survivors = set(survivor_cells)
        self.found_survivor_cells = set()
        self.explored = {(0, 0)}
        return self.state()

    def state(self) -> Dict[str, Any]:
        return {
            "task_name": self.task_name,
            "grid_size": self.grid_size,
            "drone_position": self.drone_position,
            "battery_left": self.battery_left,
            "steps_taken": self.steps_taken,
            "max_steps": self.max_steps,
            "survivors_total": self.survivors_total,
            "survivors_found": self.survivors_found,
            "explored_cells_count": len(self.explored),
            "done": self.done,
            "total_reward": round(self.total_reward, 2),
        }

    def step(self, action: int) -> Tuple[Dict[str, Any], float, bool, Dict[str, Any]]:
        if self.done:
            return self.state(), 0.0, True, {"message": "Episode already finished"}

        reward = -1.0
        info: Dict[str, Any] = {"action": action}
        r, c = self.drone_position

        if action == UP:
            nr, nc = r - 1, c
        elif action == DOWN:
            nr, nc = r + 1, c
        elif action == LEFT:
            nr, nc = r, c - 1
        elif action == RIGHT:
            nr, nc = r, c + 1
        elif action == SCAN:
            found_now = 0
            for sr, sc in list(self.survivors):
                if abs(sr - r) <= 1 and abs(sc - c) <= 1:
                    self.survivors.remove((sr, sc))
                    self.found_survivor_cells.add((sr, sc))
                    self.survivors_found += 1
                    found_now += 1
            if found_now > 0:
                reward = 50.0 * found_now
                info["message"] = f"Found {found_now} survivor(s)"
            else:
                reward = -2.0
                info["message"] = "Scan found nothing"
            self.steps_taken += 1
            self.battery_left -= 1
            if self.survivors_found == self.survivors_total:
                reward += 100.0
                self.done = True
            elif self.battery_left <= 0 or self.steps_taken >= self.max_steps:
                self.done = True
            self.total_reward += reward
            return self.state(), reward, self.done, info
        else:
            reward = -5.0
            info["message"] = "Invalid action"
            self.steps_taken += 1
            self.battery_left -= 1
            if self.battery_left <= 0 or self.steps_taken >= self.max_steps:
                self.done = True
            self.total_reward += reward
            return self.state(), reward, self.done, info

        if not (0 <= nr < self.grid_size and 0 <= nc < self.grid_size):
            reward = -5.0
            info["message"] = "Hit boundary"
        elif (nr, nc) in self.obstacles:
            reward = -10.0
            info["message"] = "Hit obstacle"
        else:
            self.drone_position = [nr, nc]
            if (nr, nc) not in self.explored:
                reward = 3.0
                self.explored.add((nr, nc))
            else:
                reward = 0.0

        self.steps_taken += 1
        self.battery_left -= 1

        if self.survivors_found == self.survivors_total:
            self.done = True
        elif self.battery_left <= 0 or self.steps_taken >= self.max_steps:
            self.done = True

        self.total_reward += reward
        return self.state(), reward, self.done, info
