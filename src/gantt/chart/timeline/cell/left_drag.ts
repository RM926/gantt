import TimelineCell from "./index";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils";
import { GanttTimelineCellLeftDragClassName } from "../../../constant";
import { MouseStatus } from "../../../utils/mousemove";
import MousemoveOffset from "../../../utils/mousemove_offset";
export type TimelineCellLeftDragConfig = {
  timelineCell: TimelineCell;
};
class TimelineCellLeftDrag {
  element?: HTMLElement;
  mousemoveOffset?: MousemoveOffset;

  timelineCell?: TimelineCellLeftDragConfig["timelineCell"];

  constructor(config: TimelineCellLeftDragConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
    this.initMousemoveOffset();
  }

  create() {
    this.element = createElement("div");
    const styles = {
      position: "absolute",
      top: "0px",
      left: `0px`,
      height: `100%`,
      display: "none",
    };
    updateElementStyles(this.element, styles);
    appendClassName(this.element, [GanttTimelineCellLeftDragClassName]);
    appendChild(this.timelineCell?.cellElement!, this.element);
  }

  initMousemoveOffset() {
    const { width: cellWidth } =
      this.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const rightRange =
      (this.timelineCell?.mergeTimeline?.cellFinishCount ?? 0) * cellWidth;
    const _that = this;
    this.mousemoveOffset = new MousemoveOffset({
      target: _that.element,
      container: _that.timelineCell?.ganttTimeline?.container,
      girdContainer: _that.timelineCell?.ganttTimeline?.innerContainer,
      moveStep: [cellWidth],
      offsetRange: true,
      range: [, , , rightRange],
      mouseStatusChange(status) {
        const moving =
          status === MouseStatus.DOWN || status === MouseStatus.MOVE;
        if (!_that.timelineCell) return;
        _that.timelineCell.leftDragging = moving;
        _that.timelineCell.ganttTimeline?.scrollOverflow?.setScrollLock(
          !moving
        );
        if (!moving) {
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
          const { startTime, cellBeginCount } =
            _that.timelineCell.mergeTimeline;
          const cellGap = _that.timelineCell.ganttTimeline?.gantt?.cellGap!;
          const newTimeline = {
            ..._that.timelineCell.mergeTimeline,
            startTime: startTime + changeStep * cellGap,
            cellBeginCount: cellBeginCount + changeStep,
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

    const [offsetLeft] = [l - cellBeginCount, r - cellFinishCount];
    const styles = {
      display: offsetLeft > 0 ? "none" : "block",
    };

    const rightRange =
      (this.timelineCell?.mergeTimeline?.cellFinishCount ?? 0) * cellWidth;

    this.mousemoveOffset?.mousemove?.updateConfig({
      range: [, , , rightRange],
    });

    updateElementStyles(this.element!, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellLeftDrag) {}
}

export default TimelineCellLeftDrag;
