export type ProRosterSortKey = 'name' | 'team' | 'status';

export interface ProRosterRow {
  readonly id: string;
  readonly displayName: string;
  readonly teamName: string;
  readonly playerType: 'professional' | 'student' | undefined;
  readonly active: boolean;
  readonly status: 'active' | 'inactive' | string;
}

export const sortProsForDisplay = (
  rows: readonly ProRosterRow[],
  key: ProRosterSortKey,
  direction: 'asc' | 'desc' = 'asc'
): readonly ProRosterRow[] => {
  const sorted = [...rows].sort((left, right) => {
    let comparison = 0;

    switch (key) {
      case 'name':
        comparison = left.displayName.localeCompare(right.displayName);
        break;
      case 'team':
        comparison =
          left.teamName.localeCompare(right.teamName) ||
          left.displayName.localeCompare(right.displayName);
        break;
      case 'status':
        comparison =
          String(left.status).localeCompare(String(right.status)) ||
          left.displayName.localeCompare(right.displayName);
        break;
      default:
        comparison = 0;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
};
