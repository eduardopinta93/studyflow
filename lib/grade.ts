export interface CourseGrade {
  letter: 'A' | 'B' | 'C' | 'D' | 'F';
  percent: number;
  earned: number;
  possible: number;
}

export const GRADE_STYLES: Record<string, string> = {
  A: 'text-emerald-700 dark:text-emerald-400',
  B: 'text-blue-700 dark:text-blue-400',
  C: 'text-amber-700 dark:text-amber-400',
  D: 'text-orange-700 dark:text-orange-400',
  F: 'text-red-700 dark:text-red-400',
};

export function courseGrade(
  assignments: { completed: boolean; points: number }[]
): CourseGrade | null {
  if (assignments.length === 0) return null;
  const possible = assignments.reduce((sum, a) => sum + a.points, 0);
  if (possible <= 0) return null;
  const earned = assignments.reduce((sum, a) => sum + (a.completed ? a.points : 0), 0);
  const percent = Math.round((earned / possible) * 100);
  const letter: CourseGrade['letter'] =
    percent >= 90 ? 'A' : percent >= 80 ? 'B' : percent >= 70 ? 'C' : percent >= 60 ? 'D' : 'F';
  return { letter, percent, earned, possible };
}
