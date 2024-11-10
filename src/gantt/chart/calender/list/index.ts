import {
  ContainTypeEnum,
  getContainType,
} from "../../../../gantt/utils/contain";
import { Gantt } from "../../../../gantt/index";
import CalenderListCell from "./cell";
import Calender from "..";
import { updateElementStyles } from "../../../utils";
import type { TimestampLine } from "../../../../gantt/index.d";

type ListConfig = {
  container: HTMLElement;
  gantt?: Gantt;
  calender?: Calender;

  // event
  scrollCallback?: (e?: Event) => void;
};

class CalenderList {
  gantt?: Gantt;
  container?: ListConfig["container"];
  innerContainer?: HTMLElement;
  calender?: ListConfig["calender"];

  cellReuses?: CalenderListCell[] = [];
  listCellMap = new Map<number | string, CalenderListCell>();
  updateCollectCellId?: (number | string)[];

  //  [t, b, l, r]
  containerRange: number[] = [0, 0, 0, 0];

  scrollCallback: ListConfig["scrollCallback"];

  constructor(config: ListConfig) {
    const { container, gantt, scrollCallback, calender } = config;
    if (container) this.container = container;
    if (gantt) this.gantt = gantt;
    if (scrollCallback) this.scrollCallback = scrollCallback;
    if (calender) this.calender = calender;
    this.drawInnerContainer();
    this.registerEvent();
    this.onContainerScroll();
  }

  removeCellInContainer() {
    const [, , l, r] = this.containerRange;
    this.listCellMap.forEach((cell) => {
      const { left, right, id } = cell.timestamp!;
      if (
        getContainType({
          contain: [l, r],
          contained: [left, right],
        }) === ContainTypeEnum.NONE ||
        !this.updateCollectCellId?.includes(id)
      ) {
        cell?.hiddenElement();
        this.cellReuses?.push(cell);
        this.listCellMap.delete(id);
      }
    });
  }

  drawInnerContainer() {
    /**  绘制滚动内层区域 */
    this.innerContainer = document.createElement("div");
    this.updateInnerContainer();
    this.container?.appendChild(this.innerContainer);
  }

  onContainerScroll = (e?: Event) => {
    this.containerRange = this.getContainerRange();
    this.update({ updateInner: false });
    this.scrollCallback?.(e);
  };

  registerEvent() {
    this.container?.addEventListener("scroll", this.onContainerScroll);
  }

  updateInnerContainer() {
    if (!this.innerContainer) return;
    const { width: cellWidth } = this.gantt!.styles?.cell!;

    const styles = {
      position: "relative",
      height: "100%",
      width: `${cellWidth * this.gantt!.timestampLine?.length || 0}px`,
      boxSizing: "border-box",
    };
    updateElementStyles(this.innerContainer, styles);
    this.containerRange = this.getContainerRange();
  }

  update(payload?: { updateInner?: boolean }) {
    const { updateInner = true } = payload ?? {};
    if (updateInner) this.updateInnerContainer();
    this.updateCellToContainer();
    this.removeCellInContainer();
  }

  renderCell(timestampLine: TimestampLine) {
    const { id } = timestampLine;
    const oldExpanderCell = this.listCellMap.get(id);
    if (oldExpanderCell) {
      oldExpanderCell.update({
        timestamp: timestampLine,
      });
    } else {
      let calenderCell = this.cellReuses?.shift();
      if (calenderCell) {
        calenderCell.update({ timestamp: timestampLine });
        this.listCellMap.set(id, calenderCell);
      } else {
        calenderCell = this.calender?.createCell({
          timestamp: timestampLine,
          calenderList: this,
        })!;
        this.listCellMap.set(id, calenderCell);
        this.innerContainer?.appendChild(calenderCell.cellElement!);
        calenderCell.update();
      }
    }
  }

  updateCellToContainer() {
    const [, , l, r] = this.containerRange;
    this.updateCollectCellId = [];
    for (const t of this.getContainTimestampLine()) {
      this.updateCollectCellId?.push(t.id);
      this.renderCell(t);
    }
  }

  getContainTimestampLine() {
    const { timestampLine } = this.gantt!;
    const containRange = this.getContainerRange();
    const [, , l, r] = containRange;
    return timestampLine?.slice(Math.floor(l), Math.ceil(r) + 1);
  }

  getContainerRange(): number[] {
    if (!this.container) return [];
    const { scrollLeft = 0 } = this.container;

    const { width: cellWidth } = this.gantt!.styles?.cell!;
    const { width } = this.container!.getBoundingClientRect() ?? {};

    return [0, 0, scrollLeft / cellWidth, (scrollLeft + width) / cellWidth];
  }

  scrollTo(position?: { x?: number; y?: number }) {
    const { x, y } = position ?? {};
    if (typeof x !== "undefined") {
      this.container!.scrollLeft = x;
    }
    if (typeof y !== "undefined") {
      this.container!.scrollTop = y;
    }
  }
}

export default CalenderList;
