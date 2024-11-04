import {
  appendChild,
  appendClassName,
  createElement,
  getIntersectRange,
  updateElementStyles,
} from "../../../../utils";
import TimelineCell from "../index";
import { GanttTimelineCellVisualContentClassName } from "../../../../constant";
import MousemoveOffset from "../../../../utils/mousemove_offset";
import { MouseStatus } from "../../../../utils/mousemove";
import { TimelineCellLeftRange } from "./left_range";
import { TimelineCellRightRange } from "./right_range";

export type TimelineCellVisualContentConfig = {
  timelineCell?: TimelineCell;
};

class TimelineCellVisualContent {
  timelineCell?: TimelineCellVisualContentConfig["timelineCell"];
  element?: HTMLElement;
  mousemoveOffset?: MousemoveOffset;

  leftRange?: TimelineCellLeftRange;
  rightRange?: TimelineCellRightRange;

  constructor(config: TimelineCellVisualContentConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
    this.createSub();
    this.initMousemove();
    this.render(this);
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

  createSub() {
    const { leftRange, rightRange } =
      this.timelineCell?.ganttTimeline?.gantt?.enhance?.timeline ?? {};
    const LeftRange = leftRange ?? TimelineCellLeftRange;
    this.leftRange = new (LeftRange as any)({
      visualContent: this,
    });
    const RightRange = rightRange ?? TimelineCellRightRange;
    this.rightRange = new (RightRange as any)({
      visualContent: this,
    });
  }

  updateSub() {
    this.leftRange?.update();
    this.rightRange?.update();
  }

  initMousemove() {
    const { height: cellHeight, width: cellWidth } =
      this.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const bottomRange =
      (this.timelineCell?.ganttTimeline?.gantt?.getMergeTimelinesRowCount() ??
        0) * cellHeight;

    const _that = this;
    this.mousemoveOffset = new MousemoveOffset({
      target: this.element,
      container: _that.timelineCell?.ganttTimeline?.container!,
      girdContainer: _that.timelineCell?.ganttTimeline?.innerContainer,
      moveStep: [cellWidth, cellHeight],
      range: [0, bottomRange],
      offsetRange: true,
      mouseStatusChange(status) {
        const moving =
          status === MouseStatus.DOWN || status === MouseStatus.MOVE;
        if (!_that.timelineCell) return;
        _that.timelineCell.moving = moving;
        _that.timelineCell.ganttTimeline?.scrollOverflow?.setScrollLock(
          !moving
        );
        if (!moving) {
          // _that.gantt
          if (_that.timelineCell?.mergeTimeline)
            _that.timelineCell?.ganttTimeline?.changeCell(
              _that.timelineCell.mergeTimeline
            );
        }
      },
      moveStepChange(payload) {
        const { type, changeStep } = payload;
        if (type === "x") {
          if (!_that.timelineCell) return;
          const { endTime, startTime, cellFinishCount, cellBeginCount } =
            _that.timelineCell.mergeTimeline;
          const cellGap = _that.timelineCell.ganttTimeline?.gantt?.cellGap!;
          const newTimeline = {
            ..._that.timelineCell.mergeTimeline,
            startTime: startTime + changeStep * cellGap,
            endTime: endTime + changeStep * cellGap,
            cellFinishCount: cellFinishCount + changeStep,
            cellBeginCount: cellBeginCount + changeStep,
          };
          _that.timelineCell.update({
            mergeTimeline: newTimeline,
          });
        } else if (type === "y") {
          if (!_that.timelineCell) return;
          const { cellBottomCount, cellTopCount } =
            _that.timelineCell.mergeTimeline;
          const newTimeline = {
            ..._that.timelineCell.mergeTimeline,
            cellBottomCount: cellBottomCount + changeStep,
            cellTopCount: cellTopCount + changeStep,
          };
          _that.timelineCell.update({
            mergeTimeline: newTimeline,
          });
        }
      },
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

    const { height: cellHeight } =
      this.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const bottomRange =
      (this.timelineCell?.ganttTimeline?.gantt?.getMergeTimelinesRowCount() ??
        0) * cellHeight;
    this.mousemoveOffset?.mousemove?.updateConfig({
      range: [0, bottomRange],
    });
  }

  render(it: TimelineCellVisualContent) {}

  updateRender(it: TimelineCellVisualContent) {}
}

export default TimelineCellVisualContent;
