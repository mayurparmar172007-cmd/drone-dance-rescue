import { useState, useCallback } from "react";
import { DroneRescueEnv } from "@/lib/environment";
import { type Difficulty, type EnvState, type StepAction, TASK_CONFIGS } from "@/lib/types";
import Grid from "@/components/Grid";
import DroneStatus from "@/components/DroneStatus";
import Controls from "@/components/Controls";
import { Badge } from "@/components/ui/badge";

const env = new DroneRescueEnv("easy");

const Dashboard = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [state, setState] = useState<EnvState>(() => env.reset());
  const [lastInfo, setLastInfo] = useState("Environment ready");
  const [lastReward, setLastReward] = useState(0);
  const [activeDrone, setActiveDrone] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-49), msg]);

  const handleDifficultyChange = useCallback((d: Difficulty) => {
    setDifficulty(d);
    env.setDifficulty(d);
    const s = env.reset();
    setState(s);
    setActiveDrone(0);
    setLastInfo(`Reset to ${d} mode`);
    setLastReward(0);
    setLog([`[RESET] ${d} mode`]);
  }, []);

  const handleReset = useCallback(() => {
    const s = env.reset();
    setState(s);
    setActiveDrone(0);
    setLastInfo("Environment reset");
    setLastReward(0);
    setLog((prev) => [...prev, "[RESET]"]);
  }, []);

  const handleStep = useCallback(
    (action: StepAction) => {
      if (action.action === -1) {
        // Just switching drone
        setActiveDrone(action.drone_id);
        return;
      }
      const result = env.step({ ...action, drone_id: activeDrone });
      setState(result.state);
      setLastInfo(result.info);
      setLastReward(result.reward);
      addLog(`[D${activeDrone + 1}] act=${action.action} → r=${result.reward} | ${result.info}`);
    },
    [activeDrone]
  );

  const config = TASK_CONFIGS[difficulty];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          🚁 Disaster Drone Rescue
        </h1>
        <p className="text-sm text-muted-foreground">OpenEnv Multi-Drone Coordination</p>
      </header>

      {/* Difficulty Selector */}
      <div className="flex gap-2 mb-6">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => handleDifficultyChange(d)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              difficulty === d
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Grid */}
        <div className="flex-shrink-0">
          <Grid state={state} />
        </div>

        {/* Side Panel */}
        <div className="flex-1 space-y-5 min-w-[250px] max-w-md">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-xs text-muted-foreground">Step</div>
              <div className="text-lg font-bold text-foreground">
                {state.step_count}/{state.max_steps}
              </div>
            </div>
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-xs text-muted-foreground">Survivors</div>
              <div className="text-lg font-bold text-accent">
                {config.survivors - state.survivors_remaining}/{config.survivors}
              </div>
            </div>
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-xs text-muted-foreground">Total Reward</div>
              <div className={`text-lg font-bold ${state.total_reward >= 0 ? "text-primary" : "text-destructive"}`}>
                {state.total_reward}
              </div>
            </div>
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-xs text-muted-foreground">Last Reward</div>
              <div className={`text-lg font-bold ${lastReward >= 0 ? "text-primary" : "text-destructive"}`}>
                {lastReward > 0 ? "+" : ""}{lastReward}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={state.done ? "destructive" : "default"}>
              {state.done ? "DONE" : "RUNNING"}
            </Badge>
            <span className="text-xs text-muted-foreground truncate">{lastInfo}</span>
          </div>

          {/* Drone Status */}
          <DroneStatus state={state} maxBattery={config.battery} />

          {/* Controls */}
          <Controls
            droneCount={state.drone_positions.length}
            activeDrone={activeDrone}
            onStep={handleStep}
            onReset={handleReset}
            disabled={state.done}
          />

          {/* Log */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Log
            </h3>
            <div className="bg-card border border-border rounded-lg p-2 h-32 overflow-y-auto text-[11px] text-muted-foreground font-mono space-y-0.5">
              {log.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
