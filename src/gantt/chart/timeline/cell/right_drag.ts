import TimelineCell from "./index";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils";
import { GanttTimelineCellRightDragClassName } from "../../../constant";
import Mousemove, { MouseStatus } from "../../../utils/mousemove";
import MousemoveOffset from "../../../utils/mousemove_offset";

export type TimelineCellRightDragConfig = {
  timelineCell: TimelineCell;
};
class TimelineCellRightDrag {
  element?: HTMLElement;
  mousemoveOffset?: MousemoveOffset;

  timelineCell?: TimelineCellRightDragConfig["timelineCell"];

  constructor(config: TimelineCellRightDragConfig) {
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
      right: `0px`,
      height: `100%`,
      display: "none",
    };
    updateElementStyles(this.element, styles);
    appendClassName(this.element, [GanttTimelineCellRightDragClassName]);
    appendChild(this.timelineCell?.cellElement!, this.element);
  }

  initMousemoveOffset() {
    const { width: cellWidth } =
      this?.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const _that = this;
    this.mousemoveOffset = new MousemoveOffset({
      target: this.element,
      container: _that.timelineCell?.ganttTimeline?.container,
      girdContainer: _that.timelineCell?.ganttTimeline?.innerContainer,
      moveStep: _that.getMousemoveStep(_that),
      range: _that.getMousemoveRange(),
      offsetRange: false,
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
          const { endTime, cellFinishCount } = _that.timelineCell.mergeTimeline;
          const cellGap = _that.timelineCell.ganttTimeline?.gantt?.cellGap!;

          // moveStepX
          const [moveStepX] = _that.getMousemoveStep(_that);
          const timeStep = (cellGap / cellWidth) * moveStepX;
          const cellCountStep = (changeStep / cellWidth) * moveStepX;

          const newTimeline = {
            ..._that.timelineCell.mergeTimeline,
            cellFinishCount: cellFinishCount + cellCountStep,
            endTime: endTime + changeStep * timeStep,
          };
          _that.timelineCell.update({
            mergeTimeline: newTimeline,
          });
        }
      },
    });
  }

  getMousemoveRange() {
    if (!this?.timelineCell) return;
    const { width: cellWidth } =
      this.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const leftRange =
      ((this.timelineCell?.mergeTimeline?.cellBeginCount ?? 0) + 1) * cellWidth;
    return [, , leftRange];
  }

  getMousemoveStep(it: TimelineCellRightDrag) {
    const { width: cellWidth } =
      this?.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    return [cellWidth];
    return [1];
  }

  update() {
    if (!this.timelineCell) return;
    const { mergeTimeline, ganttTimeline } = this.timelineCell;
    const { cellFinishCount } = mergeTimeline;
    const [, , , r] = ganttTimeline?.containerRange!;

    const [, offsetRight] = [, r - cellFinishCount];
    const styles = {
      display: offsetRight < 0 ? "none" : "block",
    };

    this.mousemoveOffset?.mousemove?.updateConfig({
      range: this.getMousemoveRange(),
    });

    updateElementStyles(this.element!, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellRightDrag) {}
}

export default TimelineCellRightDrag;
