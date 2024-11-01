import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils/document";
import TimelineCell from "./index";
import { GanttTimelineCellContentClassName } from "../../../constant";
import { MouseStatus } from "../../../utils/mousemove";
import MousemoveOffset from "../../../utils/mousemove_offset";

export type TimelineCellContentConfig = {
  timelineCell: TimelineCell;
};

export class TimelineCellContent {
  timelineCell?: TimelineCellContentConfig["timelineCell"];
  element?: HTMLElement;
  mousemoveOffset?: MousemoveOffset;

  constructor(config: TimelineCellContentConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
    this.initMousemove();
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
    this.updateRender(this);
    const { height: cellHeight } =
      this.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const bottomRange =
      (this.timelineCell?.ganttTimeline?.gantt?.getMergeTimelinesRowCount() ??
        0) * cellHeight;
    this.mousemoveOffset?.mousemove?.updateConfig({
      range: [0, bottomRange],
    });
  }

  render(it: TimelineCellContent) {}

  updateRender(it: TimelineCellContent) {}
}
