import { oneDayTimeStamp } from "./utils/date";

export const GanttClassName = "gantt";

export const GanttExpanderClassName = "gantt_expander";
export const GanttExpanderColumnClassName = "gantt_expander_column";
export const GanttExpanderColumnHeaderClassName =
  "gantt_expander_column_header";
export const GanttExpanderListClassName = "gantt_expander_column_list";
export const GanttExpanderListCellClassName="gantt_expander_list_cell"

export const GanttChartClassName = "gantt_chart";
export const GanttCalendarClassName = "gantt_calendar";

export const GanttCalenderHeaderClassName = "gantt_calendar_header";
export const GanttCalenderListClassName = "gantt_calendar_list";

export const GanttTimelineClassName = "gantt_timeline";
export const GanttTimelineCellClassName = "gantt_timeline_cell"

export const BasicStyles = {
  cell: {
    height: 50,
    width: 150,
  },
  header: {
    height: 50,
  },
};

export const BasicCellGap = oneDayTimeStamp;