import { Activity, Infinity, Zap, Globe, Move, Pencil, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  infinity: Infinity,
  zap: Zap,
  globe: Globe,
  move: Move,
  pencil: Pencil,
};

export function getExerciseIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Activity;
}
