import { MergeTimelineDataSource } from "../../../index.d";
import ExpanderList from ".";
import { GanttExpanderListCellClassName } from "../../../constant";
import { updateElementStyles } from "@/gantt/utils";

export type ExpanderListCellConfig = {
  mergeTimelineDataSource: MergeTimelineDataSource;
  expanderList?: ExpanderList;
};

class ExpanderListCell {
  mergeTimelineDataSource?: ExpanderListCellConfig["mergeTimelineDataSource"];
  expanderList: ExpanderListCellConfig["expanderList"];

  cellElement?: HTMLElement;

  constructor(config: ExpanderListCellConfig) {
    const { mergeTimelineDataSource, expanderList } = config;
    if (mergeTimelineDataSource)
      this.mergeTimelineDataSource = mergeTimelineDataSource;
    if (expanderList) this.expanderList = expanderList;
    this.createContainer(this);
  }

  createContainer(it: ExpanderListCell) {
    this.cellElement = document.createElement("div");
    this.cellElement.classList.add(GanttExpanderListCellClassName);
    this.updateContainer();
    this.render(this);
  }

  updateContainer() {
    const { top, mergeTimelines } = this.mergeTimelineDataSource!;
    const { height: cellHeight } = this.expanderList?.gantt?.styles?.cell!;
    const styles = {
      boxSizing: "border-box",
      position: "absolute",
      width: "100%",
      height: `${Math.max(mergeTimelines?.length, 1) * cellHeight}px`,
      top: `${top * cellHeight}px`,
    };
    if (this.cellElement) {
      updateElementStyles(this.cellElement, styles);
    }
  }

  update(payload?: { mergeTimelineDataSource?: MergeTimelineDataSource }) {
    const { mergeTimelineDataSource } = payload ?? {};
    if (mergeTimelineDataSource)
      this.mergeTimelineDataSource = mergeTimelineDataSource;
    this.updateContainer();
    this.updateRender(this);
  }

  hiddenElement() {
    if (!this?.cellElement) return;
    const hiddenStyles = {
      position: "fixed",
      top: "-999999px",
      width: "0px",
      height: "0px",
    };
    updateElementStyles(this.cellElement, hiddenStyles);
  }

  render(it: ExpanderListCell) {}

  updateRender(it: ExpanderListCell) {
    const div = document.createElement("div");
    const { title, expandable, expand } = this.mergeTimelineDataSource!;
    div.innerHTML = `${title} ${expandable ? "open:" + expand : ""}`;
    this.cellElement?.append(div);
  }

  remove() {
    this.cellElement?.remove();
  }
}

export default ExpanderListCell;
