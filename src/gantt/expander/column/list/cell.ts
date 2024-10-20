import { MergeTimelineDataSource } from "../../../index.d";
import ExpanderList from ".";
import { GanttExpanderListCellClassName } from "../../../constant";

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
    const { top, bottom } = this.mergeTimelineDataSource!;
    const { height: cellHeight, width: cellWidth } =
      this.expanderList?.gantt?.styles?.cell!;
    const styles = {
      boxSizing: "border-box",
      position: "absolute",
      height: `${(bottom - top) * cellHeight}px`,
      width: `${cellWidth}px`,
      top: `${top * cellHeight}px`,
    };

    Object.entries(styles).forEach((entry) => {
      const [key, value] = entry as unknown as [number, string];
      this.cellElement!.style[key] = value;
    });
  }

  update(payload?: { mergeTimelineDataSource?: MergeTimelineDataSource }) {
    const { mergeTimelineDataSource } = payload ?? {};
    if (mergeTimelineDataSource)
      this.mergeTimelineDataSource = mergeTimelineDataSource;
    this.updateContainer();
    this.updateRender(this);
  }

  updateRender(it: ExpanderListCell) {}

  render(it: ExpanderListCell) {
    const div = document.createElement("div");
    const { title } = this.mergeTimelineDataSource!;
    div.innerHTML = title;
    this.cellElement?.append(div);
  }

  remove() {
    this.cellElement?.remove();
  }
}

export default ExpanderListCell;
