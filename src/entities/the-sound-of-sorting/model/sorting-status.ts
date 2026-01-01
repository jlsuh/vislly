const SortingStatus = {
  Finished: 0,
  Idle: 1,
  ReadyToResumeSorting: 2,
  ReadyToResumeVerifying: 3,
  Sorting: 4,
  Verifying: 5,
} as const;

type SortingStatus = (typeof SortingStatus)[keyof typeof SortingStatus];

export { SortingStatus };
