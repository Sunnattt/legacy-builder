export const GOAL_MILESTONES = [1, 5, 10, 25, 50, 75, 100] as const;

export const milestonesReached = (pct: number) =>
  GOAL_MILESTONES.filter((m) => pct >= m);

export const newlyReached = (oldPct: number, newPct: number) =>
  GOAL_MILESTONES.filter((m) => oldPct < m && newPct >= m);

export const progressColor = (pct: number) => {
  if (pct >= 100) return "#28C78A";
  if (pct >= 76) return "#28C78A";
  if (pct >= 51) return "#4A8FE8";
  if (pct >= 26) return "#C9A84C";
  return "#E04545";
};
