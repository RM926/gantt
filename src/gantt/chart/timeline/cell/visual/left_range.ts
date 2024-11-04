import TimelineCell from "../index";
import { GanttTimelineCellLeftRangeClassName } from "../../../../constant";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../../utils";
import TimelineCellVisual from "./index";

export type TimelineCellLeftRangeConfig = {
  visualCell?: TimelineCellVisual;
};

export class TimelineCellLeftRange {
  element?: HTMLElement;
  visualCell?: TimelineCellLeftRangeConfig["visualCell"];
  constructor(config: TimelineCellLeftRangeConfig) {
    const { visualCell } = config;
    if (visualCell) this.visualCell = visualCell;
    this.create();
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
    appendClassName(this.element, [GanttTimelineCellLeftRangeClassName]);
    if (this.visualCell?.element) {
      appendChild(this.visualCell.element, this.element);
    }
  }

  update() {
    if (!this.visualCell || !this.element) return;
    const { mergeTimeline, ganttTimeline } = this.visualCell?.timelineCell!;
    const { cellBeginCount } = mergeTimeline;
    const [, , l] = ganttTimeline?.containerRange!;

    const [offsetLeft] = [l - cellBeginCount];
    const styles = {
      display: offsetLeft > 0 ? "block" : "none",
    };

    updateElementStyles(this.element, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellLeftRange) {}
}
