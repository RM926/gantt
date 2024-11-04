import TimelineCell from "../index";
import { GanttTimelineCellLeftRangeClassName } from "../../../../constant";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../../utils";
import TimelineCellVisualContent from ".";

export type TimelineCellLeftRangeConfig = {
  visualContent?: TimelineCellVisualContent;
};

export class TimelineCellLeftRange {
  element?: HTMLElement;
  visualContent?: TimelineCellLeftRangeConfig["visualContent"];
  constructor(config: TimelineCellLeftRangeConfig) {
    const { visualContent } = config;
    if (visualContent) this.visualContent = visualContent;
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
    appendChild(this.visualContent?.element!, this.element);
  }

  update() {
    if (!this.visualContent) return;
    const { mergeTimeline, ganttTimeline } = this.visualContent?.timelineCell!;
    const { cellBeginCount } = mergeTimeline;
    const [, , l] = ganttTimeline?.containerRange!;

    const [offsetLeft] = [l - cellBeginCount];
    const styles = {
      display: offsetLeft > 0 ? "block" : "none",
    };

    updateElementStyles(this.element!, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellLeftRange) {}
}
