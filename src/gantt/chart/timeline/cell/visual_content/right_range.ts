import TimelineCell from "./index";
import { GanttTimelineCellRightRangeClassName } from "../../../../constant";
import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../../utils";
import TimelineCellVisualContent from "./index";

export type TimelineCellRightRangeConfig = {
  visualContent?: TimelineCellVisualContent;
};

export class TimelineCellRightRange {
  element?: HTMLElement;
  visualContent?: TimelineCellRightRangeConfig["visualContent"];
  constructor(config: TimelineCellRightRangeConfig) {
    const { visualContent } = config;
    if (visualContent) this.visualContent = visualContent;
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
    appendChild(this.visualContent?.element!, this.element);
  }

  update() {
    if (!this.visualContent) return;
    const { ganttTimeline, mergeTimeline } = this.visualContent?.timelineCell!;
    const { cellFinishCount } = mergeTimeline;
    const [, , , r] = ganttTimeline?.containerRange!;

    const [, offsetRight] = [, r - cellFinishCount];

    const styles = {
      display: -offsetRight > 0 ? "block" : "none",
    };

    updateElementStyles(this.element!, styles);
    this.updateRender(this);
  }

  updateRender(it: TimelineCellRightRange) {}
}
