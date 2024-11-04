import TimelineCell from "./index";
import { GanttTimelineCellRightRangeClassName } from "../../../../constant";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../../utils";
import TimelineCellVisualContent from "./index";
import TimelineCellVisual from "./index";

export type TimelineCellRightRangeConfig = {
  visualCell?: TimelineCellVisual;
};

export class TimelineCellRightRange {
  element?: HTMLElement;
  visualCell?: TimelineCellRightRangeConfig["visualCell"];
  constructor(config: TimelineCellRightRangeConfig) {
    const { visualCell } = config;
    if (visualCell) this.visualCell = visualCell;
    this.create();
  }

  create() {
    this.element = createElement("div");
    const styles = {
      position: "absolute",
      top: "0px",
      right: `0px`,
      display: "none",
    };
    updateElementStyles(this.element, styles);
    appendClassName(this.element, [GanttTimelineCellRightRangeClassName]);
    if (this.visualCell?.element) {
      appendChild(this.visualCell.element, this.element);
    }
  }

  update() {
    if (!this.visualCell || !this.element) return;
    const { ganttTimeline, mergeTimeline } = this.visualCell?.timelineCell!;
    const { cellFinishCount } = mergeTimeline;
    const [, , , r] = ganttTimeline?.containerRange!;

    const [, offsetRight] = [, r - cellFinishCount];

    const styles = {
      display: -offsetRight > 0 ? "block" : "none",
    };

    updateElementStyles(this.element, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellRightRange) {}
}
