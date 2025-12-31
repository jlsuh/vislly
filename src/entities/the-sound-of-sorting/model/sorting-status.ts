const SortingStatus = {
  Finished: 'finished',
  Idle: 'idle',
  ReadyToResumeSorting: 'ready_to_resume_sorting',
  ReadyToResumeSweeping: 'ready_to_resume_sweeping',
  Sorting: 'sorting',
  Sweeping: 'sweeping',
} as const;

type SortingStatus = (typeof SortingStatus)[keyof typeof SortingStatus];

export { SortingStatus };
