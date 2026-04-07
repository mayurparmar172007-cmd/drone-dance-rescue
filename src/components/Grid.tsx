import { type EnvState } from "@/lib/types";

interface GridProps {
  state: EnvState;
}

const Grid = ({ state }: GridProps) => {
  const { grid_size, grid, drone_positions, explored, active_drone } = state;

  const droneMap = new Map<string, number>();
  drone_positions.forEach((pos, i) => {
    droneMap.set(`${pos[0]},${pos[1]}`, i);
  });

  const cellSize = Math.max(24, Math.min(48, 480 / grid_size));

  return (
    <div
      className="inline-grid gap-px rounded-lg overflow-hidden border border-border p-1"
      style={{
        gridTemplateColumns: `repeat(${grid_size}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${grid_size}, ${cellSize}px)`,
        backgroundColor: "hsl(var(--grid-line))",
      }}
    >
      {Array.from({ length: grid_size }).map((_, r) =>
        Array.from({ length: grid_size }).map((_, c) => {
          const key = `${r},${c}`;
          const droneId = droneMap.get(key);
          const cell = grid[r][c];
          const isExplored = explored[r][c];

          let cellClass = isExplored ? "cell-explored" : "cell-unexplored";
          let content: React.ReactNode = null;

          if (cell === "obstacle") {
            cellClass = "cell-obstacle";
            content = <span className="text-xs opacity-60">▓</span>;
          } else if (cell === "survivor") {
            cellClass = "cell-survivor animate-pulse-glow";
            content = <span className="text-xs">🆘</span>;
          } else if (cell === "danger_zone") {
            cellClass = "cell-danger";
            content = <span className="text-xs opacity-70">⚠</span>;
          }

          if (droneId !== undefined) {
            const isActive = droneId === active_drone;
            cellClass = droneId === 0 ? "cell-drone-a" : "cell-drone-b";
            if (isActive) cellClass += " drone-active-ring";
            content = (
              <span className="text-xs font-bold" style={{ color: "hsl(var(--background))" }}>
                D{droneId + 1}
              </span>
            );
          }

          return (
            <div
              key={key}
              className={`flex items-center justify-center rounded-sm transition-all duration-150 ${cellClass}`}
              style={{ width: cellSize, height: cellSize }}
            >
              {content}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Grid;
