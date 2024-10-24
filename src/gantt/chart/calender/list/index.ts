import {
  ContainTypeEnum,
  getContainType,
} from "../../../../gantt/utils/contain";
import { Gantt } from "../../../../gantt/index";
import CalenderListCell, { CalenderListCellConfig } from "./cell";
import Calender from "..";

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

  listCellMap = new Map<number | string, CalenderListCell>();
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
        }) === ContainTypeEnum.NONE
      ) {
        cell.remove();
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
    const { scrollLeft = 0, scrollTop = 0 } = (e?.target ?? {}) as any;

    const { height: cellHeight, width: cellWidth } = this.gantt!.styles?.cell;
    const { width, height } = this.container!.getBoundingClientRect() ?? {};

    this.containerRange = [
      scrollTop / cellHeight,
      (scrollTop + height) / cellHeight,
      scrollLeft / cellWidth,
      (scrollLeft + width) / cellWidth,
    ];

    // 清除缓存的cell
    this.removeCellInContainer();
    this.updateCellToContainer();
    this.scrollCallback?.(e);
  };

  registerEvent() {
    this.container?.addEventListener("scroll", this.onContainerScroll);
  }

  updateInnerContainer() {
    if (!this.innerContainer) return;
    const { width: cellWidth } = this.gantt!.styles?.cell;

    const styles = {
      position: "relative",
      height: "100%",
      width: `${cellWidth * this.gantt!.timestampLine?.length || 0}px`,
      boxSizing: "border-box",
    };
    Object.entries(styles).forEach((entry) => {
      const [key, value] = entry as unknown as [number, string];
      this.innerContainer!.style[key] = value;
    });
  }

  updateCellToContainer() {
    // 添加
    const [, , l, r] = this.containerRange;
    if (this?.gantt?.timestampLine) {
      for (let i = 0; i < this.gantt?.timestampLine?.length; i++) {
        const { left, right, id } = this.gantt?.timestampLine[i];
        
        if (
          getContainType({
            contain: [l, r],
            contained: [left, right],
          }) !== ContainTypeEnum.NONE
        ) {
          const oldExpanderCell = this.listCellMap.get(id);
          if (oldExpanderCell) {
            oldExpanderCell.update({
              timestamp: this.gantt?.timestampLine[i],
            });
            continue;
          }
          const calenderCell = this.calender?.createCell({
            timestamp: this.gantt?.timestampLine[i],
            calenderList: this,
          })!;

          this.listCellMap.set(id, calenderCell);
          this.innerContainer?.appendChild(calenderCell.cellElement!);
          calenderCell.update();
        }
        if (i >= r) return;
      }
    }
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
