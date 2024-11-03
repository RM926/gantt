import TimelineCell from ".";
import { GanttTimelineCellLeftRangeClassName } from "../../../constant";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils";

export type TimelineCellLeftRangeConfig = {
  timelineCell?: TimelineCell;
};

export class TimelineCellLeftRange {
  element?: HTMLElement;
  timelineCell?: TimelineCellLeftRangeConfig["timelineCell"];
  constructor(config: TimelineCellLeftRangeConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
  }

  create() {
    this.element = createElement("div");
    const styles = {
      position: "absolute",
      top: "0px",
      left: `0px`,
      height: `100%`,
      // display: "none",
    };
    updateElementStyles(this.element, styles);
    appendClassName(this.element, [GanttTimelineCellLeftRangeClassName]);
    appendChild(this.timelineCell?.cellElement!, this.element);
  }

  update() {
    if (!this.timelineCell) return;
    const { mergeTimeline, ganttTimeline } = this.timelineCell;
    const { cellBeginCount, cellFinishCount } = mergeTimeline;
    const [, , l, r] = ganttTimeline?.containerRange!;
    const { width: cellWidth } =
      this.timelineCell.ganttTimeline?.gantt?.styles?.cell!;

    const [offsetLeft] = [l - cellBeginCount, r - cellFinishCount];
    const styles = {
      display: offsetLeft > 0 ? "block" : "none",
      transform: `translateX(${offsetLeft * cellWidth}px)`,
    };

    updateElementStyles(this.element!, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellLeftRange) {}
}
