import {
  appendChild,
  appendClassName,
  createElement,
  getIntersectRange,
  updateElementStyles,
} from "../../../utils";
import TimelineCell from "./index";
import { GanttTimelineCellVisualContentClassName } from "../../../constant";

export type TimelineCellVisualContentConfig = {
  timelineCell?: TimelineCell;
};

class TimelineCellVisualContent {
  timelineCell?: TimelineCellVisualContentConfig["timelineCell"];
  element?: HTMLElement;

  constructor(config: TimelineCellVisualContentConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
  }

  create() {
    this.element = createElement("div");
    const styles = {
      position: "absolute",
      height: "100%",
    };
    appendClassName(this.element, [GanttTimelineCellVisualContentClassName]);
    updateElementStyles(this.element, styles);
    appendChild(this.timelineCell?.cellElement!, this.element);
  }

  update() {
    if (!this.timelineCell) return;
    const { mergeTimeline, ganttTimeline } = this.timelineCell;
    const { cellBeginCount, cellFinishCount } = mergeTimeline;
    const [, , l, r] = ganttTimeline?.containerRange!;
    const { width: cellWidth } =
      this.timelineCell.ganttTimeline?.gantt?.styles?.cell!;

    const [offsetLeft] = [l - cellBeginCount];
    // console.log(cellBeginCount, cellFinishCount, [l, r]);
    const [LR, RR] = getIntersectRange(
      [cellBeginCount, cellFinishCount],
      [l, r]
    ) ?? [0, 0];
    // console.log(
    //   "IntersectRange",
    //   getIntersectRange([cellBeginCount, cellFinishCount], [l, r])
    // );
    return;
    const styles = {
      left: `${offsetLeft * cellWidth}px`,
      // width: "50px",
      display: "flex",
      width: `${Math.abs(RR - LR) * cellWidth}px`,
      background: "blue",
    };

    updateElementStyles(this.element!, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellVisualContent) {}
}

export default TimelineCellVisualContent;
