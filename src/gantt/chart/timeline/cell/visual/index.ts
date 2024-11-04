import {
  appendChild,
  appendClassName,
  createElement,
  getIntersectRange,
  updateElementStyles,
} from "../../../../utils";
import TimelineCell from "../index";
import { GanttTimelineCellVisualClassName } from "../../../../constant";
import { TimelineCellLeftRange } from "./left_range";
import { TimelineCellRightRange } from "./right_range";
import TimelineCellVisualContent from "./content";

export type TimelineCellVisualConfig = {
  timelineCell?: TimelineCell;
};

class TimelineCellVisual {
  timelineCell?: TimelineCellVisualConfig["timelineCell"];
  element?: HTMLElement;

  leftRange?: TimelineCellLeftRange;
  rightRange?: TimelineCellRightRange;
  content?: TimelineCellVisualContent;

  constructor(config: TimelineCellVisualConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
    this.render(this);
    this.createSub();
  }

  create() {
    this.element = createElement("div");
    const styles = {
      position: "absolute",
      height: "100%",
    };
    appendClassName(this.element, [GanttTimelineCellVisualClassName]);
    updateElementStyles(this.element, styles);
    console.log(this.timelineCell?.cellElement, "eeee");
    appendChild(this.timelineCell?.cellElement!, this.element);
  }

  createSub() {
    const { leftRange, rightRange, visualContent } =
      this.timelineCell?.ganttTimeline?.gantt?.enhance?.timeline ?? {};
    // const LeftRange = leftRange ?? TimelineCellLeftRange;
    // this.leftRange = new (LeftRange as any)({
    //   visualCell: this,
    // });
    // const RightRange = rightRange ?? TimelineCellRightRange;
    // this.rightRange = new (RightRange as any)({
    //   visualCell: this,
    // });
    const VisualContent = visualContent ?? TimelineCellVisualContent;
    this.content = new (VisualContent as any)({
      visualCell: this,
    });
  }

  update() {
    if (!this.timelineCell) return;
    const { mergeTimeline, ganttTimeline } = this.timelineCell;
    const { cellBeginCount, cellFinishCount } = mergeTimeline;
    const [, , l, r] = ganttTimeline?.containerRange!;
    const { width: cellWidth } =
      this.timelineCell.ganttTimeline?.gantt?.styles?.cell!;

    const [offsetLeft] = [l - cellBeginCount];
    const intersectRange = getIntersectRange(
      [cellBeginCount, cellFinishCount],
      [l, r]
    );
    // console.log(
    //   "IntersectRange",
    //   getIntersectRange([cellBeginCount, cellFinishCount], [l, r])
    // );
    // return;
    // todo 触发4次??
    if (intersectRange) {
      const [LR, RR] = intersectRange;
      const styles = {
        left: `${offsetLeft >= 0 ? offsetLeft * cellWidth : 0}px`,
        width: `${Math.min(Math.abs(RR - LR), r - l) * cellWidth}px`,
      };
      updateElementStyles(this.element!, styles);
    }
    this.updateRender(this);
    this.updateSub();
  }

  updateSub() {
    this.leftRange?.update();
    this.rightRange?.update();
    this.content?.update();
  }

  render(it: TimelineCellVisual) {}

  updateRender(it: TimelineCellVisual) {}
}

export default TimelineCellVisual;
