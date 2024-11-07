import { MergeTimelineDataSource, TimestampLine } from "../../../index.d";
import CalenderList from "./index";
import { updateElementStyles } from "../../../utils";

export type CalenderListCellConfig = {
  timestamp: TimestampLine;
  calenderList?: CalenderList;
};

class CalenderListCell {
  timestamp?: CalenderListCellConfig["timestamp"];
  calenderList: CalenderListCellConfig["calenderList"];

  cellElement?: HTMLElement;

  constructor(config: CalenderListCellConfig) {
    const { timestamp, calenderList } = config;
    if (calenderList) this.calenderList = calenderList;
    if (timestamp) this.timestamp = timestamp;
    this.createContainer(this);
  }

  createContainer(it: CalenderListCell) {
    this.cellElement = document.createElement("div");
    this.updateContainer();
    this.render(this);
  }

  updateContainer() {
    const { width: cellWidth } = this.calenderList?.gantt?.styles?.cell!;
    const { left } = this.timestamp!;
    const styles = {
      position: "absolute",
      width: `${cellWidth}px`,
      height: "100%",
      left: `${left * cellWidth}px`,
    };

    Object.entries(styles).forEach((entry) => {
      const [key, value] = entry as unknown as [number, string];
      this.cellElement!.style[key] = value;
    });
  }

  update(payload?: { timestamp?: TimestampLine }) {
    const { timestamp } = payload ?? {};
    if (timestamp) this.timestamp = timestamp;
    this.updateContainer();
    this.updateRender(this);
  }

  updateRender(it: CalenderListCell) {
    if (!this?.cellElement) return;
    this.cellElement.innerHTML = JSON.stringify(this.timestamp?.value);
  }

  render(it: CalenderListCell) {}

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

export default CalenderListCell;
