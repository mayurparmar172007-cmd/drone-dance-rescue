export type Difficulty = "easy" | "medium" | "hard";

export interface TaskConfig {
  name: Difficulty;
  grid_size: number;
  drones: number;
  survivors: number;
  obstacles: number;
  battery: number;
  max_steps: number;
  danger_zones: number;
}

export const TASK_CONFIGS: Record<Difficulty, TaskConfig> = {
  easy: {
    name: "easy",
    grid_size: 5,
    drones: 1,
    survivors: 1,
    obstacles: 2,
    battery: 20,
    max_steps: 40,
    danger_zones: 0,
  },
  medium: {
    name: "medium",
    grid_size: 7,
    drones: 1,
    survivors: 2,
    obstacles: 5,
    battery: 18,
    max_steps: 60,
    danger_zones: 0,
  },
  hard: {
    name: "hard",
    grid_size: 10,
    drones: 2,
    survivors: 3,
    obstacles: 12,
    battery: 30,
    max_steps: 100,
    danger_zones: 4,
  },
};

export type CellType = "empty" | "obstacle" | "survivor" | "danger_zone";

export interface EnvState {
  grid_size: number;
  drone_positions: number[][];
  battery: number[];
  survivors_remaining: number;
  explored: boolean[][];
  grid: CellType[][];
  step_count: number;
  max_steps: number;
  done: boolean;
  total_reward: number;
  active_drone: number;
  danger_zones: number[][];
}

export interface StepAction {
  drone_id: number;
  action: number; // 0=UP 1=DOWN 2=LEFT 3=RIGHT 4=SCAN
}

export interface StepResult {
  state: EnvState;
  reward: number;
  done: boolean;
  info: string;
}

export const ACTION_NAMES = ["UP", "DOWN", "LEFT", "RIGHT", "SCAN"] as const;

export const REWARDS = {
  valid_move: 1,
  unexplored_bonus: 2,
  scan_detect: 10,
  rescue_survivor: 50,
  mission_complete: 100,
  hit_obstacle: -10,
  invalid_move: -5,
  wasted_step: -1,
  scan_empty: -2,
  battery_depleted: -20,
  drone_collision: -5,
} as const;
