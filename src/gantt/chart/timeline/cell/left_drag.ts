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

  private create() {
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

  private initMousemoveOffset() {
    const _that = this;
    this.mousemoveOffset = new MousemoveOffset({
      target: _that.element,
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
          const { startTime, cellBeginCount } =
            _that.timelineCell.mergeTimeline;
          const cellGap = _that.timelineCell.ganttTimeline?.gantt?.cellGap!;
          const { width: cellWidth } = _that.getStylesCell();
          // moveStepX
          const [moveStepX] = _that.getMousemoveStep(_that);
          const timeStep = (cellGap / cellWidth) * moveStepX;
          const cellCountStep = (changeStep / cellWidth) * moveStepX;

          const newTimeline = {
            ..._that.timelineCell.mergeTimeline,
            startTime: startTime + changeStep * timeStep,
            cellBeginCount: cellBeginCount + cellCountStep,
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
    const { width: cellWidth } = this.getStylesCell();
    const rightRange =
      ((this.timelineCell?.mergeTimeline?.cellFinishCount ?? 0) - 1) *
      cellWidth;
    return [, , , rightRange];
  }

  getMousemoveStep(it: TimelineCellLeftDrag) {
    const { width: cellWidth } = this.getStylesCell();
    return [cellWidth];
    return [1];
  }

  update() {
    if (!this.timelineCell) return;
    const { mergeTimeline, ganttTimeline } = this.timelineCell;
    const { cellBeginCount, cellFinishCount } = mergeTimeline;
    const [, , l, r] = ganttTimeline?.containerRange!;

    const [offsetLeft] = [l - cellBeginCount, r - cellFinishCount];
    const styles = {
      display: offsetLeft > 0 ? "none" : "block",
    };

    this.mousemoveOffset?.mousemove?.updateConfig({
      range: this.getMousemoveRange(),
      moveStep: this.getMousemoveStep(this),
    });

    updateElementStyles(this.element!, styles);
    this.updateRender(this);
  }

  getStylesCell() {
    return this?.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
  }

  updateRender(it: TimelineCellLeftDrag) {}
}

export default TimelineCellLeftDrag;
