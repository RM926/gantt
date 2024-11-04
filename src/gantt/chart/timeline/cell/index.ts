import GanttTimeline from "../index";
import { ReturnMergeTimeline } from "../../../utils/merge";
import { GanttTimelineCellClassName } from "../../../constant";
import { TimelineCellContent } from "./content";
import { updateElementStyles } from "../../../utils/document";
import TimelineCellLeftDrag from "./left_drag";
import TimelineCellRightDrag from "./right_drag";
import TimelineCellVisualContent from "./visual_content";

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

  visualContent?: TimelineCellVisualContent;

  constructor(config: TimelineCellConfig) {
    const { mergeTimeline, ganttTimeline } = config;
    this.mergeTimeline = mergeTimeline;
    if (ganttTimeline) this.ganttTimeline = ganttTimeline;
    this.createCell();
    this.render(this);
  }

  createCell() {
    this.cellElement = document.createElement("div");
    this.cellElement.classList.add(GanttTimelineCellClassName);
    this.updateCellElement();
    this.createSub();

    this.ganttTimeline?.innerContainer?.appendChild(this.cellElement);
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
    this.updateRender(this);
  }

  updateDetect() {}

  createSub() {
    const {
      cellContent,
      visualContent,
      leftDrag,
      rightDrag,
    } = this.ganttTimeline?.gantt?.enhance?.timeline ?? {};
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
    const VisualContent = visualContent ?? TimelineCellVisualContent;
    this.visualContent = new (VisualContent as any)({
      timelineCell: this,
    });
  }

  updateSub(it: TimelineCell) {
    this.content?.update();
    this.leftDrag?.update();
    this.rightDrag?.update();
    this.visualContent?.update();
  }

  render(it: TimelineCell) {}

  updateRender(it: TimelineCell) {}

  hiddenElement() {
    if (!this?.cellElement) return;
    const hiddenStyles = {
      position: "fixed",
      left: "-999999px",
    };
    updateElementStyles(this.cellElement, hiddenStyles);
  }

  remove() {
    this.cellElement?.remove();
  }
}

export default TimelineCell;
