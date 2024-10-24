export type GanttSourceDataTimeline = {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  [key: string]: any;
};

export type GanttSourceData = {
  id: string | number;
  title: string;
  timelines: GanttSourceDataTimeline[];
  children?: GanttSourceData[];
};

type TimeRangeDate = string | number | Date;

export type MergeTimelineDataSource = GanttSourceData & {
  top: number;
  bottom: number;
  mergeTimelines: ReturnMergeTimeline[][];
};

export type TimestampLine = {
  id: string | number;
  left: number;
  right: number;
  value: number;
};
