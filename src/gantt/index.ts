import {
  BasicCellGap,
  BasicStyles,
  GanttCalendarClassName,
  GanttChartClassName,
  GanttClassName,
  GanttExpanderClassName,
  GanttTimelineClassName,
} from "./constant";
import {
  GanttSourceData,
  MergeTimelineDataSource,
  TimestampLine,
} from "./index.d";
import "./index.css";
import "./index.line.css";
import { getTimestampLineByTimeRange } from "./utils/merge";
import { getTimeRangeTime, getTimestampLines } from "./utils/merge";
import Column from "./expander/column";
import { getRandomClass } from "./utils/document";
import GanttTimeline from "./chart/timeline";
import Calender from "./chart/calender";
import ExpanderHeader from "./expander/column/header";
import ExpanderListCell from "./expander/column/list/cell";
import TimelineCell from "./chart/timeline/cell";
import CalenderHeader from "./chart/calender/header";
import CalenderListCell from "./chart/calender/list/cell";
import { TimelineCellContent } from "./chart/timeline/cell/content";
import { TimelineCellLeftRange } from "./chart/timeline/cell/left_range";
import { TimelineCellRightRange } from "./chart/timeline/cell/right_range";
import { getMergeTimelinesSourceData } from "./utils/tree";
import TimelineCellLeftDrag from "./chart/timeline/cell/left_drag";
import TimelineCellRightDrag from "./chart/timeline/cell/right_drag";

export enum ScrollControlSource {
  EXPANDER,
  TIMELINE,
  CALENDER,
}

export type GanttConfig = {
  container?: HTMLElement;
  dataSource?: GanttSourceData[];
  cellGap?: number;
  timeRange?: string[];
  expandIds?: (string | number)[];
  styles?: Partial<typeof BasicStyles>;
  enhance?: Partial<{
    expanderLabel: Partial<{
      header?: ExpanderHeader;
      cell?: ExpanderListCell;
    }>;
    timeline: Partial<{
      cell: TimelineCell;
      cellContent: TimelineCellContent;
      leftRange: TimelineCellLeftRange;
      rightRange: TimelineCellRightRange;
      leftDrag: TimelineCellLeftDrag;
      rightDrag: TimelineCellRightDrag;
    }>;
    calender: Partial<{
      header: CalenderHeader;
      cell: CalenderListCell;
    }>;
  }>;
};

export class Gantt {
  container: GanttConfig["container"];

  dataSource?: GanttConfig["dataSource"];
  mergeTimelineSourceData?: MergeTimelineDataSource[];

  timestampLine: TimestampLine[] = [];
  cellGap = BasicCellGap;
  timeRange: string[] = [];
  styles: GanttConfig["styles"] = BasicStyles;
  enhance?: GanttConfig["enhance"];

  expandIds?: (string | number)[];

  ganttColumns?: Column[];
  ganttCalender?: Calender;
  ganttTimeline?: GanttTimeline;

  constructor(config: GanttConfig) {
    const { container, enhance, ...otherConfig } = config;
    if (container) this.container = container;
    if (enhance) this.enhance = enhance;
    const { expanderElement, ganttCalenderElement, ganttTimelineElement } =
      this.draw()!;
    this.initData(otherConfig);
    // return;
    const _that = this;
    // expander
    this.ganttColumns = [
      new Column({
        container: expanderElement as HTMLElement,
        gantt: this,
        enhance: this.enhance?.expanderLabel,
        listScrollCallback(e: any) {
          _that.scrollControl({
            source: ScrollControlSource.EXPANDER,
            eventTarge: e?.target,
            position: { y: e?.target?.scrollTop || 0 },
          });
        },
      }),
      // new Column({
      //   container: expanderElement as HTMLElement,
      //   gantt: this,
      //   listScrollCallback(e: any) {
      //     _that.scrollControl({
      //       source: ScrollControlSource.EXPANDER,
      //       eventTarge: e?.target,
      //       position: { y: e?.target?.scrollTop || 0 },
      //     });
      //   },
      // }),
    ];

    // calender
    this.ganttCalender = new Calender({
      container: ganttCalenderElement as HTMLElement,
      gantt: this,
      enhance: this.enhance?.calender,
      listScrollCallback(e: any) {
        _that.scrollControl({
          source: ScrollControlSource.CALENDER,
          position: { x: e?.target?.scrollLeft || 0 },
        });
      },
    });

    // timeline
    this.ganttTimeline = new GanttTimeline({
      container: ganttTimelineElement as HTMLElement,
      gantt: this,
      enhance: this.enhance?.timeline,
      scrollCallback(e: any) {
        _that.scrollControl({
          source: ScrollControlSource.TIMELINE,
          position: {
            y: e?.target?.scrollTop || 0,
            x: e?.target?.scrollLeft || 0,
          },
        });
      },
    });
  }

  draw() {
    if (!this.container) return;
    const randomClass = getRandomClass(GanttClassName);
    this.container!.classList.add(GanttClassName, randomClass);
    const htmlString = `
      <div class='${GanttExpanderClassName}'></div>
      <div class='${GanttChartClassName}'>
        <div class='${GanttCalendarClassName}'></div>
        <div class='${GanttTimelineClassName}'></div>
      </div>
    `;
    this.container.innerHTML = htmlString;

    const [
      expanderElement,
      chartElement,
      ganttCalenderElement,
      ganttTimelineElement,
    ] = [
      GanttExpanderClassName,
      GanttChartClassName,
      GanttCalendarClassName,
      GanttTimelineClassName,
    ].map((className) => {
      return document.querySelector(`.${randomClass} .${className}`);
    });

    return {
      expanderElement,
      chartElement,
      ganttCalenderElement,
      ganttTimelineElement,
    };
  }

  initData(config: Omit<GanttConfig, "container">) {
    const { dataSource, cellGap, styles, timeRange, expandIds } = config;
    if (dataSource) this.dataSource = dataSource;
    if (cellGap) this.cellGap = cellGap;
    if (styles) this.styles = { ...this.styles, ...styles };
    if (timeRange) this.timeRange = timeRange;
    if (expandIds) this.expandIds = expandIds;
    this.timestampLine = getTimestampLines(
      getTimestampLineByTimeRange({
        timeRange: this.timeRange?.length
          ? this.timeRange
          : getTimeRangeTime({
              dataSource: this.dataSource!,
              expandIds: this.expandIds,
            }),
      })
    );

    if (this.dataSource) {
      this.mergeTimelineSourceData = getMergeTimelinesSourceData({
        dataSource: this.dataSource,
        cellGap: this.cellGap,
        timestampLine: this.timestampLine.map((t) => t.value),
        expandIds: this.expandIds,
      });
    }

    console.log(
      this.dataSource,
      this.mergeTimelineSourceData,
      "mergeTimelinesSourceData"
    );
  }

  scrollControl(payload: {
    source: ScrollControlSource;
    position?: { x?: number; y?: number };
    eventTarge?: HTMLElement;
  }) {
    const { source, position, eventTarge } = payload;
    if (source === ScrollControlSource.TIMELINE) {
      this.ganttColumns?.forEach((c) => {
        c?.list?.scrollTo(position);
      });
      this.ganttCalender?.list?.scrollTo(position);
    } else if (source === ScrollControlSource.EXPANDER) {
      this.ganttColumns?.forEach((c) => {
        if (eventTarge !== c.list?.innerContainer) c?.list?.scrollTo(position);
      });
      this.ganttTimeline?.scrollTo(position);
    } else if (source === ScrollControlSource.CALENDER) {
      this.ganttTimeline?.scrollTo(position);
    }
  }

  update = (config: Omit<GanttConfig, "container">) => {
    this.initData(config);
    this.ganttCalender?.list?.updateInnerContainer();
    this.ganttCalender?.list?.update();
    this.ganttTimeline?.updateInnerContainer();
    this.ganttTimeline?.update();
    this.ganttColumns?.forEach((c) => {
      c.list?.updateInnerContainer();
      c.list?.update();
    });
  };

  getMergeTimelinesRowCount(
    mergeTimelineDataSource?: MergeTimelineDataSource,
    bottom = 0
  ): number {
    const last =
      mergeTimelineDataSource ?? this.mergeTimelineSourceData?.slice(-1)[0];
    const currentBottom = Math.max(bottom, last?.bottom || 0);
    if (last?.children?.length) {
      return this.getMergeTimelinesRowCount(
        last.children?.slice(-1)[0],
        currentBottom
      );
    }
    return currentBottom;
  }
}

export default Gantt;
