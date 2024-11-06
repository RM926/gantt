import GanttTimeline from "../index";
import { ReturnMergeTimeline } from "../../../utils/merge";
import { GanttTimelineCellClassName } from "../../../constant";
import { TimelineCellContent } from "./content";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils/document";
import TimelineCellLeftDrag from "./left_drag";
import TimelineCellRightDrag from "./right_drag";
import TimelineCellVisual from "./visual";

export type TimelineCellConfig = {
  mergeTimeline: ReturnMergeTimeline;
  cellGap?: number;
  ganttTimeline: GanttTimeline;
};

class TimelineCell {
  mergeTimeline: TimelineCellConfig["mergeTimeline"];
  cellElement?: HTMLElement;

  // 整体拖拽移动
  moving = false;

  leftDragging = false;
  rightDragging = false;

  ganttTimeline?: TimelineCellConfig["ganttTimeline"];

  content?: TimelineCellContent;
  leftDrag?: TimelineCellLeftDrag;
  rightDrag?: TimelineCellRightDrag;
  visual?: TimelineCellVisual;

  constructor(config: TimelineCellConfig) {
    const { mergeTimeline, ganttTimeline } = config;
    this.mergeTimeline = mergeTimeline;
    if (ganttTimeline) this.ganttTimeline = ganttTimeline;
    this.createCell();
    this.render(this);
  }

  createCell() {
    this.cellElement = createElement("div");
    appendClassName(this.cellElement, [GanttTimelineCellClassName]);
    this.updateCellElement();
    appendChild(this.ganttTimeline?.innerContainer!, this.cellElement);
    this.createSub();
  }

  createSub() {
    const { cellContent, leftDrag, rightDrag } =
      this.ganttTimeline?.gantt?.enhance?.timeline ?? {};
    const CellContent = cellContent ?? TimelineCellContent;
    this.content = new (CellContent as any)({
      timelineCell: this,
    });
    const LeftDrag = leftDrag ?? TimelineCellLeftDrag;
    this.leftDrag = new (LeftDrag as any)({
      timelineCell: this,
    });
    const RightDrag = rightDrag ?? TimelineCellRightDrag;
    this.rightDrag = new (RightDrag as any)({
      timelineCell: this,
    });

    this.visual = new TimelineCellVisual({
      timelineCell: this,
    });
  }

  updateCellElement() {
    const { cellBeginCount, cellFinishCount, cellTopCount } =
      this.mergeTimeline;
    const { height: cellHeight, width: cellWidth } =
      this.ganttTimeline?.gantt?.styles?.cell!;
    const styles = {
      position: "absolute",
      height: `${cellHeight}px`,
      width: `${(cellFinishCount - cellBeginCount) * cellWidth}px`,
      top: `${cellTopCount * cellHeight}px`,
      left: `${cellBeginCount * cellWidth}px`,
    };
    updateElementStyles(this.cellElement!, styles);
  }

  update(payload?: { mergeTimeline?: ReturnMergeTimeline }) {
    const { mergeTimeline } = payload ?? {};
    if (mergeTimeline) this.mergeTimeline = mergeTimeline;

    this.updateCellElement();
    this.updateSub(this);
  }

  updateDetect() {}

  updateSub(it: TimelineCell) {
    this.content?.update();
    this.leftDrag?.update();
    this.rightDrag?.update();
    this.visual?.update();
  }

  render(it: TimelineCell) {}

  updateRender(it: TimelineCell) {}

  hiddenElement() {
    if (!this?.cellElement) return;
    const hiddenStyles = {
      position: "fixed",
      left: "-999999px",
      width: "0px",
      height: "0px",
    };
    updateElementStyles(this.cellElement, hiddenStyles);
  }

  remove() {
    this.cellElement?.remove();
  }
}

export default TimelineCell;
