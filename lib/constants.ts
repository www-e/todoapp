export const COLUMNS = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
} as const;

export type ColumnType = keyof typeof COLUMNS;
export const COLUMN_IDS: ColumnType[] = Object.keys(COLUMNS) as ColumnType[];

export const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];
export const PRIORITY_VALUES = Object.values(PRIORITIES) as Array<Priority>;

export const PRIORITY_COLORS = {
  high: {
    bg: 'bg-[#f0d2d2]',
    text: 'text-[#d05555]',
  },
  medium: {
    bg: 'bg-[#f5e6d2]',
    text: 'text-[#de984c]',
  },
  low: {
    bg: 'bg-[#e6e6eb]',
    text: 'text-[#797f8c]',
  },
} as const;

export function getPriorityColor(priority: Priority) {
  return PRIORITY_COLORS[priority];
}

export function getColumnTitle(columnId: ColumnType): string {
  return COLUMNS[columnId];
}

export const COLUMN_CONFIG = COLUMN_IDS.map((id) => ({
  id,
  title: COLUMNS[id],
}));
