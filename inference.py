
from env import DisasterDroneEnv, SCAN, RIGHT, DOWN
from grader import compute_score


def main():
    env = DisasterDroneEnv(task_name="easy", seed=42)
    env.reset(task_name="easy", seed=42)

    actions = [RIGHT, DOWN, SCAN, RIGHT, DOWN, SCAN, RIGHT, DOWN, SCAN]

    done = False
    i = 0
    while not done and i < len(actions):
        _, _, done, _ = env.step(actions[i])
        i += 1

    final_state = env.state()
    score = compute_score(final_state)

    print(
        {
            "task_name": final_state["task_name"],
            "score": score,
            "survivors_found": final_state["survivors_found"],
            "survivors_total": final_state["survivors_total"],
        }
    )


if __name__ == "__main__":
    main()
