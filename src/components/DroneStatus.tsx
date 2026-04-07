import { Progress } from "@/components/ui/progress";
import { type EnvState } from "@/lib/types";

interface DroneStatusProps {
  state: EnvState;
  maxBattery: number;
}

const DroneStatus = ({ state, maxBattery }: DroneStatusProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Drone Status
      </h3>
      {state.drone_positions.map((pos, i) => {
        const isActive = i === state.active_drone;
        const batteryPct = (state.battery[i] / maxBattery) * 100;
        const batteryColor =
          batteryPct > 50 ? "bg-primary" : batteryPct > 20 ? "bg-accent" : "bg-destructive";

        return (
          <div
            key={i}
            className={`rounded-lg p-3 border transition-all ${
              isActive ? "border-ring drone-active-ring" : "border-border"
            }`}
            style={{
              backgroundColor: isActive
                ? `hsl(var(--${i === 0 ? "drone-a" : "drone-b"}) / 0.1)`
                : "hsl(var(--card))",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${i === 0 ? "cell-drone-a" : "cell-drone-b"}`}
                />
                <span className="text-sm font-medium text-foreground">
                  Drone {i + 1}
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground uppercase">
                    Active
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                [{pos[0]}, {pos[1]}]
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">
                ⚡ {state.battery[i]}
              </span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${batteryColor}`}
                  style={{ width: `${batteryPct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DroneStatus;
