import {
  type Difficulty,
  type TaskConfig,
  type CellType,
  type EnvState,
  type StepAction,
  type StepResult,
  TASK_CONFIGS,
  REWARDS,
} from "./types";

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function posKey(r: number, c: number): string {
  return `${r},${c}`;
}

export class DroneRescueEnv {
  private config!: TaskConfig;
  private state_data!: EnvState;
  private survivor_positions: Set<string> = new Set();

  constructor(private difficulty: Difficulty = "easy") {
    this.config = TASK_CONFIGS[difficulty];
  }

  setDifficulty(d: Difficulty) {
    this.difficulty = d;
    this.config = TASK_CONFIGS[d];
  }

  reset(): EnvState {
    const { grid_size, drones, survivors, obstacles, battery, max_steps, danger_zones } = this.config;
    const grid: CellType[][] = Array.from({ length: grid_size }, () =>
      Array(grid_size).fill("empty")
    );
    const explored: boolean[][] = Array.from({ length: grid_size }, () =>
      Array(grid_size).fill(false)
    );

    const occupied = new Set<string>();

    // Place drones
    const drone_positions: number[][] = [];
    const batteryArr: number[] = [];
    for (let i = 0; i < drones; i++) {
      let r: number, c: number;
      do {
        r = randInt(grid_size);
        c = randInt(grid_size);
      } while (occupied.has(posKey(r, c)));
      drone_positions.push([r, c]);
      batteryArr.push(battery);
      occupied.add(posKey(r, c));
      explored[r][c] = true;
    }

    // Place obstacles
    let placed = 0;
    while (placed < obstacles) {
      const r = randInt(grid_size);
      const c = randInt(grid_size);
      if (!occupied.has(posKey(r, c))) {
        grid[r][c] = "obstacle";
        occupied.add(posKey(r, c));
        placed++;
      }
    }

    // Place survivors
    this.survivor_positions = new Set();
    placed = 0;
    while (placed < survivors) {
      const r = randInt(grid_size);
      const c = randInt(grid_size);
      if (!occupied.has(posKey(r, c))) {
        grid[r][c] = "survivor";
        occupied.add(posKey(r, c));
        this.survivor_positions.add(posKey(r, c));
        placed++;
      }
    }

    // Place danger zones
    const dangerPositions: number[][] = [];
    placed = 0;
    while (placed < danger_zones) {
      const r = randInt(grid_size);
      const c = randInt(grid_size);
      if (!occupied.has(posKey(r, c))) {
        grid[r][c] = "danger_zone";
        occupied.add(posKey(r, c));
        dangerPositions.push([r, c]);
        placed++;
      }
    }

    this.state_data = {
      grid_size,
      drone_positions,
      battery: batteryArr,
      survivors_remaining: survivors,
      explored,
      grid,
      step_count: 0,
      max_steps,
      done: false,
      total_reward: 0,
      active_drone: 0,
      danger_zones: dangerPositions,
    };

    return this.state();
  }

  state(): EnvState {
    return JSON.parse(JSON.stringify(this.state_data));
  }

  step(action: StepAction): StepResult {
    if (this.state_data.done) {
      return { state: this.state(), reward: 0, done: true, info: "Episode already done" };
    }

    const { drone_id, action: act } = action;
    const s = this.state_data;

    // Validate drone_id
    if (drone_id < 0 || drone_id >= s.drone_positions.length) {
      return { state: this.state(), reward: REWARDS.invalid_move, done: false, info: "Invalid drone_id" };
    }

    s.active_drone = drone_id;
    s.step_count++;

    // Check battery
    if (s.battery[drone_id] <= 0) {
      const reward = REWARDS.battery_depleted;
      s.total_reward += reward;
      this.checkDone();
      return { state: this.state(), reward, done: s.done, info: "Battery depleted" };
    }

    s.battery[drone_id]--;

    let reward = 0;
    let info = "";

    if (act === 4) {
      // SCAN
      const [dr, dc] = s.drone_positions[drone_id];
      let found = false;
      for (let r = dr - 1; r <= dr + 1; r++) {
        for (let c = dc - 1; c <= dc + 1; c++) {
          if (r >= 0 && r < s.grid_size && c >= 0 && c < s.grid_size) {
            if (s.grid[r][c] === "survivor") {
              found = true;
              // Rescue survivor
              s.grid[r][c] = "empty";
              s.survivors_remaining--;
              this.survivor_positions.delete(posKey(r, c));
              reward += REWARDS.rescue_survivor;
              info = "Survivor rescued!";
            }
          }
        }
      }
      if (found) {
        reward += REWARDS.scan_detect;
      } else {
        reward += REWARDS.scan_empty;
        info = "Scan empty";
      }
    } else {
      // Movement: 0=UP 1=DOWN 2=LEFT 3=RIGHT
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      if (act < 0 || act > 3) {
        reward = REWARDS.invalid_move;
        info = "Invalid action";
      } else {
        const [dr, dc] = dirs[act];
        const [cr, cc] = s.drone_positions[drone_id];
        const nr = cr + dr;
        const nc = cc + dc;

        if (nr < 0 || nr >= s.grid_size || nc < 0 || nc >= s.grid_size) {
          reward = REWARDS.invalid_move;
          info = "Out of bounds";
        } else if (s.grid[nr][nc] === "obstacle") {
          reward = REWARDS.hit_obstacle;
          info = "Hit obstacle";
        } else {
          // Check drone collision
          const collision = s.drone_positions.some(
            (pos, i) => i !== drone_id && pos[0] === nr && pos[1] === nc
          );
          if (collision) {
            reward = REWARDS.drone_collision;
            info = "Drone collision avoided";
          } else {
            s.drone_positions[drone_id] = [nr, nc];
            reward = REWARDS.valid_move;
            info = "Moved";

            if (!s.explored[nr][nc]) {
              s.explored[nr][nc] = true;
              reward += REWARDS.unexplored_bonus;
              info = "Explored new cell";
            }

            // Check danger zone
            if (s.grid[nr][nc] === "danger_zone") {
              reward += REWARDS.wasted_step;
              info = "In danger zone";
            }
          }
        }
      }
    }

    // Check mission complete
    if (s.survivors_remaining === 0) {
      reward += REWARDS.mission_complete;
      s.done = true;
      info = "Mission complete!";
    }

    s.total_reward += reward;
    this.checkDone();

    return { state: this.state(), reward, done: s.done, info };
  }

  private checkDone() {
    const s = this.state_data;
    if (s.step_count >= s.max_steps) {
      s.done = true;
    }
    if (s.battery.every((b) => b <= 0)) {
      s.done = true;
    }
  }
}
