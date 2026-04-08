
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

from env import DisasterDroneEnv
from grader import compute_score
from tasks import list_tasks


app = FastAPI(title="Drone Dance Rescue OpenEnv Backend")

env = DisasterDroneEnv(task_name="easy", seed=42)


class ResetRequest(BaseModel):
    task_name: Optional[str] = "easy"
    seed: Optional[int] = 42


class StepRequest(BaseModel):
    action: int


@app.get("/")
def root():
    return {
        "message": "Drone Dance Rescue backend is running",
        "available_tasks": list_tasks(),
    }


@app.post("/reset")
def reset_post(req: ResetRequest):
    state = env.reset(task_name=req.task_name, seed=req.seed)
    return state


@app.get("/reset")
def reset_get(task_name: str = "easy", seed: int = 42):
    state = env.reset(task_name=task_name, seed=seed)
    return state


@app.post("/step")
def step_post(req: StepRequest):
    state, reward, done, info = env.step(req.action)
    return {
        "state": state,
        "reward": reward,
        "done": done,
        "info": info,
    }


@app.get("/step/{action}")
def step_get(action: int):
    state, reward, done, info = env.step(action)
    return {
        "state": state,
        "reward": reward,
        "done": done,
        "info": info,
    }


@app.get("/state")
def state():
    return env.state()


@app.get("/score")
def score():
    return {"score": compute_score(env.state())}
