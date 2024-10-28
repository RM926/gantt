import TimelineCell from "./index";
import {
  appendChild,
  appendClassName,
  createElement,
  ReturnMergeTimeline,
  updateElementStyles,
} from "../../../utils";
import { GanttTimelineCellRightDragClassName } from "../../../constant";
import MouseMoveStep from "../../../utils/mouse_move_step";
export type TimelineCellRightDragConfig = {
  timelineCell: TimelineCell;
};
class TimelineCellRightDrag {
  element?: HTMLElement;
  mouseMoveStep?: MouseMoveStep;

  timelineCell?: TimelineCellRightDragConfig["timelineCell"];

  constructor(config: TimelineCellRightDragConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
    this.initMouseMoveStep();
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
    appendClassName(this.element, [GanttTimelineCellRightDragClassName]);
    appendChild(this.timelineCell?.cellElement!, this.element);
  }

  initMouseMoveStep() {
    const { width: cellWidth } =
      this.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const _that = this;
    this.mouseMoveStep = new MouseMoveStep({
      targetElement: this.element,
      stepOffsetRate: [0.5],
      moveStep: [cellWidth],
      moveStatusChange(moving) {
        if (!_that.timelineCell) return;
        _that.timelineCell.leftDragging = moving;
        _that.timelineCell.ganttTimeline?.moveOverflowScroll?.setScrollLock(
          !moving
        );
        if (!moving) {
          if (_that.timelineCell?.mergeTimeline)
            _that.timelineCell?.ganttTimeline?.changeCell(
              _that.timelineCell.mergeTimeline
            );
        }
      },
      moveStepCallback(payload) {
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

  /** 更新检测 */
  updateDetect(current: ReturnMergeTimeline, old: ReturnMergeTimeline) {
    const { cellBeginCount, cellFinishCount } = current;
    return cellFinishCount - cellBeginCount > 0;
  }

  update() {
    // if (!this.timelineCell) return;
    // const { mergeTimeline, ganttTimeline } = this.timelineCell;
    // const { cellBeginCount, cellFinishCount } = mergeTimeline;
    // const [, , l, r] = ganttTimeline?.containerRange!;
    // const { width: cellWidth } =
    //   this.timelineCell.ganttTimeline?.gantt?.styles?.cell!;
    // const [offsetLeft] = [l - cellBeginCount, r - cellFinishCount];
    // const styles = {
    //   display: offsetLeft > 0 ? "none" : "block",
    // };
    // updateElementStyles(this.element!, styles);
    // this.updateRender(this);
  }

  updateRender(it: TimelineCellRightDrag) {}
}

export default TimelineCellRightDrag;
