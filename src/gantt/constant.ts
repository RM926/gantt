import { oneDayTimeStamp } from "./utils/date";

export const GanttClassName = "gantt";

export const GanttExpanderClassName = "gantt_expander";
export const GanttExpanderColumnClassName = "gantt_expander_column";
export const GanttExpanderColumnHeaderClassName =
  "gantt_expander_column_header";
export const GanttExpanderListClassName = "gantt_expander_column_list";
export const GanttExpanderListInnerClassName =
  "gantt_expander_column_list_inner";
export const GanttExpanderListCellClassName = "gantt_expander_list_cell";

export const GanttChartClassName = "gantt_chart";
export const GanttCalendarClassName = "gantt_calendar";

export const GanttCalenderHeaderClassName = "gantt_calendar_header";
export const GanttCalenderListClassName = "gantt_calendar_list";

export const GanttTimelineClassName = "gantt_timeline";
export const GanttTimelineInnerClassName = "gantt_timeline_inner";
export const GanttTimelineCellClassName = "gantt_timeline_cell";
export const GanttTimelineCellContentClassName = "gantt_timeline_cell_content";

export const GanttTimelineCellVisualContentClassName =
  "gantt_timeline_cell_visual_content";

export const GanttTimelineCellLeftRangeClassName =
  "gantt_timeline_cell_left_range";

export const GanttTimelineCellRightRangeClassName =
  "gantt_timeline_cell_right_range";

export const GanttTimelineCellLeftDragClassName =
  "gantt_timeline_cell_left_drag";
export const GanttTimelineCellRightDragClassName =
  "gantt_timeline_cell_right_drag";

export const BasicStyles = {
  cell: {
    height: 40,
    width: 50,
  },
  header: {
    height: 50,
  },
};

export const BasicCellGap = oneDayTimeStamp;
