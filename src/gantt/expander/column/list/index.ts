import {
  ContainTypeEnum,
  getContainType,
} from "../../../../gantt/utils/contain";
import { Gantt } from "../../../../gantt/index";
import ExpanderListCell from "./cell";
import Column from "..";
import { MergeTimelineDataSource } from "@/gantt";

type ListConfig = {
  container: HTMLElement;
  gantt?: Gantt;
  column?: Column;
  // event
  scrollCallback?: (e?: Event) => void;
};

class ExpanderList {
  gantt?: Gantt;
  column?: ListConfig["column"];
  container?: ListConfig["container"];
  innerContainer?: HTMLElement;

  listCellMap = new Map<string | number, ExpanderListCell>();
  //  [t, b, l, r]
  containerRange: number[] = [0, 0, 0, 0];

  scrollCallback: ListConfig["scrollCallback"];

  constructor(config: ListConfig) {
    const { container, gantt, column, scrollCallback } = config;
    if (container) this.container = container;
    if (gantt) this.gantt = gantt;
    if (scrollCallback) this.scrollCallback = scrollCallback;
    if (column) this.column = column;
    this.drawInnerContainer();
    this.registerEvent();
    this.onContainerScroll();
  }

  removeCellInContainer() {
    const [t, b] = this.containerRange;
    this.listCellMap.forEach((cell) => {
      const { top, bottom, id } = cell.mergeTimelineDataSource!;
      if (
        getContainType({
          contain: [t, b],
          contained: [top, bottom],
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
    const { height: cellHeight, width: cellWidth } = this.gantt!.styles?.cell;

    const styles = {
      position: "relative",
      width: `${cellWidth}px`,
      height: `${cellHeight * this.gantt!.getMergeTimelinesRowCount()}px`,
      boxSizing: "border-box",
    };
    Object.entries(styles).forEach((entry) => {
      const [key, value] = entry as unknown as [number, string];
      this.innerContainer!.style[key] = value;
    });
  }

  renderExpanderCell(mergeTimelineDataSource: MergeTimelineDataSource) {
    const { id } = mergeTimelineDataSource;

    const oldExpanderCell = this.listCellMap.get(id);
    if (oldExpanderCell) {
      oldExpanderCell.update({
        mergeTimelineDataSource,
      });
      return;
    }
    const expanderCell = this.column?.createCell({
      mergeTimelineDataSource,
      expanderList: this,
    });
    this.listCellMap.set(id, expanderCell);
    this.innerContainer?.appendChild(expanderCell.cellElement!);
    expanderCell.update();
  }

  updateCellToContainer() {
    // 添加
    const _that = this;
    const [t, b] = this.containerRange;
    function renderLoop(mergeTimelineDataSource: MergeTimelineDataSource[]) {
      for (const d of mergeTimelineDataSource) {
        const { top, bottom, children } = d;
        if (
          getContainType({
            contain: [t, b],
            contained: [top, bottom],
          }) !== ContainTypeEnum.NONE
        ) {
          // console.log(t, b);
          _that.renderExpanderCell(d);
        }
        // todo 跳出循环条件
        if (top > b) return;

        if (children?.length) {
          renderLoop(children as MergeTimelineDataSource);
        }
      }
    }

    renderLoop(this.gantt?.mergeTimelineSourceData!);
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

export default ExpanderList;
