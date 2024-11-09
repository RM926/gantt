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
  timelines?: GanttSourceDataTimeline[];
  children?: GanttSourceData[];
};

type TimeRangeDate = string | number | Date;

type Styles = {
  cell?: {
    width?: number | "auto";
    height?: number;
  };
  header?: {
    width?: number;
    height?: number;
  };
};

export type MergeTimelineDataSource = Omit<GanttSourceData, "children"> & {
  path: (number | string)[];
  top: number;
  bottom: number;
  expand: boolean;
  expandable: boolean;
  mergeTimelines: ReturnMergeTimeline[][];
  children?: MergeTimelineDataSource[];
};

export type TimestampLine = {
  id: string | number;
  left: number;
  right: number;
  value: number;
};
