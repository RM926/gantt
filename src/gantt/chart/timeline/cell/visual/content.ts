import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../../utils";
import { GanttTimelineCellVisualContentClassName } from "../../../../constant";
import MousemoveOffset from "../../../../utils/mousemove_offset";
import { MouseStatus } from "../../../../utils/mousemove";
import { TimelineCellLeftRange } from "./left_range";
import { TimelineCellRightRange } from "./right_range";
import TimelineCellVisual from "./index";

export type TimelineCellVisualContentConfig = {
  visualCell?: TimelineCellVisual;
};

class TimelineCellVisualContent {
  visualCell?: TimelineCellVisualContentConfig["visualCell"];
  element?: HTMLElement;
  mousemoveOffset?: MousemoveOffset;

  constructor(config: TimelineCellVisualContentConfig) {
    const { visualCell } = config;
    if (visualCell) this.visualCell = visualCell;
    this.create();
    this.initMousemove();
    // this.render(this);
  }

  create() {
    this.element = createElement("div");
    const styles = {
      position: "absolute",
      height: "100%",
      width: "100%",
    };
    appendClassName(this.element, [GanttTimelineCellVisualContentClassName]);
    updateElementStyles(this.element, styles);
    if (this.visualCell?.element) {
      appendChild(this.visualCell?.element, this.element);
    }
  }

  initMousemove() {
    const { height: cellHeight, width: cellWidth } =
      this.visualCell?.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const bottomRange =
      (this.visualCell?.timelineCell?.ganttTimeline?.gantt?.getMergeTimelinesRowCount() ??
        0) * cellHeight;

    const _that = this;
    const _thatTimelineCell = _that.visualCell?.timelineCell;
    this.mousemoveOffset = new MousemoveOffset({
      target: this.element,
      container: _thatTimelineCell?.ganttTimeline?.container!,
      girdContainer: _thatTimelineCell?.ganttTimeline?.innerContainer,
      moveStep: [cellWidth, cellHeight],
      range: [0, bottomRange],
      offsetRange: true,
      mouseStatusChange(status) {
        const moving =
          status === MouseStatus.DOWN || status === MouseStatus.MOVE;
        if (!_thatTimelineCell) return;
        _thatTimelineCell.moving = moving;
        _thatTimelineCell.ganttTimeline?.scrollOverflow?.setScrollLock(!moving);
        if (!moving) {
          // _that.gantt
          if (_thatTimelineCell?.mergeTimeline)
            _thatTimelineCell?.ganttTimeline?.changeCell(
              _thatTimelineCell.mergeTimeline
            );
        }
      },
      moveStepChange(payload) {
        const { type, changeStep } = payload;
        if (type === "x") {
          if (!_thatTimelineCell) return;
          const { endTime, startTime, cellFinishCount, cellBeginCount } =
            _thatTimelineCell.mergeTimeline;
          const cellGap = _thatTimelineCell.ganttTimeline?.gantt?.cellGap!;
          const newTimeline = {
            ..._thatTimelineCell.mergeTimeline,
            startTime: startTime + changeStep * cellGap,
            endTime: endTime + changeStep * cellGap,
            cellFinishCount: cellFinishCount + changeStep,
            cellBeginCount: cellBeginCount + changeStep,
          };
          _thatTimelineCell.update({
            mergeTimeline: newTimeline,
          });
        } else if (type === "y") {
          if (!_thatTimelineCell) return;
          const { cellBottomCount, cellTopCount } =
            _thatTimelineCell.mergeTimeline;
          const newTimeline = {
            ..._thatTimelineCell.mergeTimeline,
            cellBottomCount: cellBottomCount + changeStep,
            cellTopCount: cellTopCount + changeStep,
          };
          _thatTimelineCell.update({
            mergeTimeline: newTimeline,
          });
        }
      },
    });
  }

  update() {
    if (!this.visualCell?.timelineCell) return;
    const { height: cellHeight } =
      this.visualCell.timelineCell!.ganttTimeline?.gantt?.styles?.cell!;
    const bottomRange =
      (this.visualCell.timelineCell?.ganttTimeline?.gantt?.getMergeTimelinesRowCount() ??
        0) * cellHeight;
    this.mousemoveOffset?.mousemove?.updateConfig({
      range: [0, bottomRange],
    });
    this.updateRender(this);
  }

  render(it: TimelineCellVisualContent) {}

  updateRender(it: TimelineCellVisualContent) {}
}

export default TimelineCellVisualContent;
