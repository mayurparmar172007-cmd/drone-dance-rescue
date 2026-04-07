import { Button } from "@/components/ui/button";
import { ACTION_NAMES, type StepAction } from "@/lib/types";

interface ControlsProps {
  droneCount: number;
  activeDrone: number;
  onStep: (action: StepAction) => void;
  onReset: () => void;
  disabled: boolean;
}

const Controls = ({ droneCount, activeDrone, onStep, onReset, disabled }: ControlsProps) => {
  const handleAction = (action: number) => {
    onStep({ drone_id: activeDrone, action });
  };

  return (
    <div className="space-y-4">
      {droneCount > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Select Drone
          </h3>
          <div className="flex gap-2">
            {Array.from({ length: droneCount }).map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={i === activeDrone ? "default" : "secondary"}
                onClick={() => onStep({ drone_id: i, action: -1 })}
                className="text-xs"
                disabled={disabled}
              >
                Drone {i + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Actions
        </h3>
        <div className="grid grid-cols-3 gap-1.5 w-fit">
          <div />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAction(0)}
            disabled={disabled}
            className="text-xs"
          >
            ↑ UP
          </Button>
          <div />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAction(2)}
            disabled={disabled}
            className="text-xs"
          >
            ← LEFT
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction(4)}
            disabled={disabled}
            className="text-xs"
          >
            📡 SCAN
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAction(3)}
            disabled={disabled}
            className="text-xs"
          >
            RIGHT →
          </Button>
          <div />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAction(1)}
            disabled={disabled}
            className="text-xs"
          >
            ↓ DOWN
          </Button>
          <div />
        </div>
      </div>

      <Button variant="destructive" size="sm" onClick={onReset} className="w-full text-xs">
        Reset Environment
      </Button>
    </div>
  );
};

export default Controls;
