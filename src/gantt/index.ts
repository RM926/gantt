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
import MoveOverflowScroll from "./utils/move_overflow_scroll";
import { getTimestampLineByTimeRange } from "./utils/handle";
import {
  getTimeRangeTime,
  getTimestampLines,
  ReturnMergeTimeline,
  updateGanttDataSource,
} from "./utils/handle";
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
  styles?: Partial<typeof BasicStyles>;
  enhance?: Partial<{
    expanderLabel: {
      header: ExpanderHeader;
      cell: ExpanderListCell;
    };
    timeline: {
      cell: TimelineCell;
      cellContent: TimelineCellContent;
      leftRange: TimelineCellLeftRange;
      rightRange: TimelineCellRightRange;
    };
    calender: {
      header: CalenderHeader;
      cell: CalenderListCell;
    };
  }>;
};

export class Gantt {
  container: GanttConfig["container"];
  moveOverflowScroll?: MoveOverflowScroll;

  dataSource?: GanttConfig["dataSource"];
  mergeTimelineSourceData?: MergeTimelineDataSource[];

  timestampLine: TimestampLine[] = [];
  cellGap = BasicCellGap;
  timeRange: string[] = [];
  styles = BasicStyles;
  enhance?: GanttConfig["enhance"];

  ganttColumns?: Column[];
  ganttCalender?: Calender;
  ganttTimeline?: GanttTimeline;

  constructor(config: GanttConfig) {
    const { container, enhance, ...otherConfig } = config;
    if (container) this.container = container;
    if (enhance) this.enhance = enhance;
    const { expanderElement, ganttCalenderElement, ganttTimelineElement } =
      this.draw();
    this.initData(otherConfig);
    return
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
    const ganttContainer = document.createElement("div");
    const randomClass = getRandomClass(GanttClassName);
    ganttContainer.classList.add(GanttClassName, randomClass);
    const htmlString = `
      <div class='${GanttExpanderClassName}'></div>
      <div class='${GanttChartClassName}'>
        <div class='${GanttCalendarClassName}'></div>
        <div class='${GanttTimelineClassName}'></div>
      </div>
    `;
    ganttContainer.innerHTML = htmlString;
    this.container!.appendChild(ganttContainer);

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
    const { dataSource, cellGap, timeRange } = config;
    if (dataSource) this.dataSource = dataSource;
    if (cellGap) this.cellGap = cellGap;
    if (timeRange) this.timeRange = timeRange;
    this.timestampLine = getTimestampLines(
      getTimestampLineByTimeRange({
        timeRange: this.timeRange?.length
          ? this.timeRange
          : getTimeRangeTime({ dataSource: this.dataSource! }),
      })
    );

    const currentBeginTime = this.timestampLine[0].value;
    if (this.dataSource) {
      this.mergeTimelineSourceData = getMergeTimelinesSourceData({
        dataSource: this.dataSource,
        cellGap: this.cellGap,
        timestampLine: this.timestampLine.map((t) => t.value),
      });
    }

    console.log(
      this.timestampLine,
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

  update(config: Omit<GanttConfig, "container">) {
    this.initData(config);
    // todo
  }

  updateCell(mergeTimeline: ReturnMergeTimeline) {
    this.initData({
      dataSource: updateGanttDataSource({
        dataSource: this.dataSource!,
        mergeTimelinesSourceData: this.mergeTimelineSourceData!,
        returnMergeTimeline: mergeTimeline,
      }),
    });
    this.ganttTimeline?.updateCellToContainer();
    this.ganttTimeline?.updateInnerContainer();
    this.ganttColumns?.forEach((c) => {
      c.list?.updateInnerContainer();
      c.list?.updateCellToContainer();
    });
  }

  getMergeTimelinesRowCount() {
    if (!this?.mergeTimelineSourceData) return 0;
    return this.mergeTimelineSourceData.reduce((pre, t) => {
      /** 无论有没有数据,一行至少占一行(空白数据情况),容器row占位计算撑大竖直高度 */
      const c = pre + Math.max(t.mergeTimelines?.length, 1);
      return c;
    }, 0);
  }
}

export default Gantt;
