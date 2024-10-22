import TimelineCell from ".";
import { GanttTimelineCellRightRangeClassName } from "../../../constant";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils";

export type TimelineCellRightRangeConfig = {
  timelineCell?: TimelineCell;
};

export class TimelineCellRightRange {
  element?: HTMLElement;
  timelineCell?: TimelineCellRightRangeConfig["timelineCell"];
  constructor(config: TimelineCellRightRangeConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
  }

  create() {
    this.element = createElement("div");
    const styles = {
      position: "absolute",
      top: "0px",
      right: `0px`,
      display: "none",
    };
    updateElementStyles(this.element, styles);
    appendClassName(this.element, [GanttTimelineCellRightRangeClassName]);
    appendChild(this.timelineCell?.cellElement!, this.element);
  }

  update() {
    if (!this.timelineCell) return;
    const { ganttTimeline, mergeTimeline } = this.timelineCell;
    const { cellBeginCount, cellFinishCount } = mergeTimeline;
    const [, , l, r] = ganttTimeline?.containerRange!;
    const { width: cellWidth } =
      this.timelineCell?.ganttTimeline?.gantt?.styles?.cell!;

    const [, offsetRight] = [l - cellBeginCount, r - cellFinishCount];

    const styles = {
      display: -offsetRight > 0 ? "block" : "none",
      right: Math.abs(offsetRight * cellWidth) + "px",
    };

    updateElementStyles(this.element!, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellRightRange) {}
}
