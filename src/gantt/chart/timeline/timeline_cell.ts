import GanttTimeline from "./index";
import { ReturnMergeTimeline } from "../../utils/handle";
import MouseMoveStep from "../../utils/mouse_move_step";
import { GanttTimelineCellClassName } from "../../constant";

export type TimelineCellConfig = {
  mergeTimeline: ReturnMergeTimeline;
  cellGap?: number;
  ganttTimeline: GanttTimeline;
};

class TimelineCell {
  mergeTimeline: TimelineCellConfig["mergeTimeline"];
  cellElement?: HTMLElement;
  mouseMoveStep?: MouseMoveStep;

  moving = false;

  ganttTimeline?: TimelineCellConfig["ganttTimeline"];

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
    const { height: cellHeight, width: cellWidth } =
      this.ganttTimeline?.gantt?.styles?.cell!;

    const _that = this;
    // this.createLeftRangeElement();
    // this.createRightRangeElement();

    this.mouseMoveStep = new MouseMoveStep({
      targetElement: this.cellElement,
      stepOffsetRate: [0.5, 0.5],
      moveStep: [cellWidth, cellHeight],
      moveStatusChange(moving) {
        _that.moving = moving;
        _that.ganttTimeline?.moveOverflowScroll?.setScrollLock(!moving);
        if (!moving) {
          // _that.gantt
          if (_that.mergeTimeline)
            _that.ganttTimeline?.changeCell(_that.mergeTimeline);
        }
      },
      moveStepCallback(payload) {
        const { type, changeStep } = payload;
        if (type === "x") {
          const { endTime, startTime, cellFinishCount, cellBeginCount } =
            _that.mergeTimeline;
          const cellGap = _that.ganttTimeline?.gantt?.cellGap!;
          const newTimeline = {
            ..._that.mergeTimeline,
            startTime: startTime + changeStep * cellGap,
            endTime: endTime + changeStep * cellGap,
            cellFinishCount: cellFinishCount + changeStep,
            cellBeginCount: cellBeginCount + changeStep,
          };
          _that.update({
            mergeTimeline: newTimeline,
          });
        } else if (type === "y") {
          const { cellBottomCount, cellTopCount } = _that.mergeTimeline;
          const newTimeline = {
            ..._that.mergeTimeline,
            cellBottomCount: cellBottomCount + changeStep,
            cellTopCount: cellTopCount + changeStep,
          };
          _that.update({
            mergeTimeline: newTimeline,
          });
        }
      },
    });
    this.ganttTimeline?.innerContainer?.appendChild(this.cellElement);
  }

  // createLeftRangeElement() {
  //   const leftRangeElement = document.createElement("div");
  //   const styles = {
  //     position: "absolute",
  //     top: "0px",
  //     left: `0px`,
  //     width: `30px`,
  //     height: `100%`,
  //     display: "none",
  //     background: "green",
  //   };

  //   Object.entries(styles).forEach((entry) => {
  //     const [key, value] = entry as unknown as [number, string];
  //     leftRangeElement.style[key] = value;
  //   });

  //   this.leftRangeElement = leftRangeElement;
  //   this.cellElement?.appendChild(this.leftRangeElement);
  // }

  // createRightRangeElement() {
  //   const rightRangeElement = document.createElement("div");
  //   const styles = {
  //     position: "absolute",
  //     top: "0px",
  //     right: `0px`,
  //     width: `30px`,
  //     height: `100%`,
  //     display: "none",
  //     background: "green",
  //   };

  //   Object.entries(styles).forEach((entry) => {
  //     const [key, value] = entry as unknown as [number, string];
  //     rightRangeElement.style[key] = value;
  //   });

  //   this.rightRangeElement = rightRangeElement;
  //   this.cellElement?.appendChild(this.rightRangeElement);
  // }

  // updateRangeElement() {
  //   const { cellBeginCount, cellFinishCount } = this.mergeTimeline;
  //   const [t, b, l, r] = this.ganttTimeline?.containerRange!;
  //   const { width: cellWidth } = this.cellStyle;

  //   const [offsetLeft, offsetRight] = [l - cellBeginCount, r - cellFinishCount];

  //   this.leftRangeElement!.style.display = offsetLeft > 0 ? "block" : "none";
  //   this.leftRangeElement!.style.left = offsetLeft * cellWidth + "px";
  //   this.rightRangeElement!.style.display = -offsetRight > 0 ? "block" : "none";
  //   this.rightRangeElement!.style.right =
  //     Math.abs(offsetRight * cellWidth) + "px";
  // }

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

    Object.entries(styles).forEach((entry) => {
      const [key, value] = entry as unknown as [number, string];
      this.cellElement!.style[key] = value;
    });
  }

  update(payload?: { mergeTimeline?: ReturnMergeTimeline }) {
    const { mergeTimeline } = payload ?? {};
    if (mergeTimeline) this.mergeTimeline = mergeTimeline;
    // this.updateRangeElement();
    this.updateCellElement();
    this.updateRender(this);
  }

  render(it: TimelineCell) {}

  updateRender(it: TimelineCell) {}

  remove() {
    this.cellElement?.remove();
    this.mouseMoveStep?.destroyed();
  }
}

export default TimelineCell;
