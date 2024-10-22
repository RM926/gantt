import MouseMoveStep from "../../../utils/mouse_move_step";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils/document";
import TimelineCell from ".";
import { GanttTimelineCellContentClassName } from "../../../constant";

export type TimelineCellContentConfig = {
  timelineCell: TimelineCell;
};

export class TimelineCellContent {
  timelineCell?: TimelineCellContentConfig["timelineCell"];
  element?: HTMLElement;
  mouseMoveStep?: MouseMoveStep;

  constructor(config: TimelineCellContentConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
    this.initMouseMoveStep();
    this.render(this);
  }

  create() {
    this.element = createElement("div");
    const styles = {
      position: "absolute",
      width: "100%",
      height: "100%",
    };
    appendClassName(this.element, [GanttTimelineCellContentClassName]);
    updateElementStyles(this.element, styles);
    appendChild(this.timelineCell?.cellElement!, this.element);
  }

  initMouseMoveStep() {
    const { height: cellHeight, width: cellWidth } =
      this.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const _that = this;
    this.mouseMoveStep = new MouseMoveStep({
      targetElement: this.element,
      stepOffsetRate: [0.5, 0.5],
      moveStep: [cellWidth, cellHeight],
      moveStatusChange(moving) {
        if (!_that.timelineCell) return;
        _that.timelineCell.moving = moving;
        _that.timelineCell.ganttTimeline?.moveOverflowScroll?.setScrollLock(
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
      moveStepCallback(payload) {
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
    this.updateRender(this);
  }

  render(it: TimelineCellContent) {}

  updateRender(it: TimelineCellContent) {}
}
