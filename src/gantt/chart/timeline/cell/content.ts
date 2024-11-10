import {
  appendChild,
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils/document";
import TimelineCell from "./index";
import { GanttTimelineCellContentClassName } from "../../../constant";

export type TimelineCellContentConfig = {
  timelineCell: TimelineCell;
};

export class TimelineCellContent {
  timelineCell?: TimelineCellContentConfig["timelineCell"];
  element?: HTMLElement;

  constructor(config: TimelineCellContentConfig) {
    const { timelineCell } = config;
    if (timelineCell) this.timelineCell = timelineCell;
    this.create();
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

  update() {
    this.updateRender(this);
  }

  render(it: TimelineCellContent) {}

  updateRender(it: TimelineCellContent) {}
}
