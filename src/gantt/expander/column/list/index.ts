import {
  ContainTypeEnum,
  getContainType,
} from "../../../../gantt/utils/contain";
import { Gantt } from "../../../../gantt/index";
import ExpanderListCell from "./cell";
import Column from "..";
import { MergeTimelineDataSource } from "../../../index.d";
import {
  appendClassName,
  createElement,
  updateElementStyles,
} from "../../../utils";
import { GanttExpanderListInnerClassName } from "../../../constant";

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

  cellReuses?: ExpanderListCell[] = [];
  listCellMap = new Map<string | number, ExpanderListCell>();
  updateCollectCellId?: (number | string)[];
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

  drawInnerContainer() {
    /**  绘制滚动内层区域 */
    this.innerContainer = createElement("div");
    appendClassName(this.innerContainer, [GanttExpanderListInnerClassName]);
    this.updateInnerContainer();
    this.container?.appendChild(this.innerContainer);
  }

  onContainerScroll = (e?: Event) => {
    this.containerRange = this.getContainerRange();
    this.update();
    this.scrollCallback?.(e);
  };

  registerEvent() {
    this.container?.addEventListener("scroll", this.onContainerScroll);
  }

  updateInnerContainer() {
    if (!this.innerContainer) return;
    const { height: cellHeight } = this.gantt!.styles?.cell!;

    const styles = {
      position: "relative",
      height: `${cellHeight * this.gantt!.getMergeTimelinesRowCount()}px`,
      boxSizing: "border-box",
    };
    updateElementStyles(this.innerContainer, styles);
    this.containerRange = this.getContainerRange();
  }

  renderExpanderCell(mergeTimelineDataSource: MergeTimelineDataSource) {
    const { id } = mergeTimelineDataSource;

    const oldExpanderCell = this.listCellMap.get(id);
    if (oldExpanderCell) {
      oldExpanderCell.update({
        mergeTimelineDataSource,
      });
    } else {
      let expanderCell = this.cellReuses?.shift();
      if (expanderCell) {
        expanderCell.update({ mergeTimelineDataSource });
        this.listCellMap.set(id, expanderCell);
      } else {
        expanderCell = this.column?.createCell({
          mergeTimelineDataSource,
          expanderList: this,
        });
        this.listCellMap.set(id, expanderCell!);
        this.innerContainer?.appendChild(expanderCell?.cellElement!);
        expanderCell?.update();
      }
    }
  }

  updateCellToContainer() {
    // 添加
    this.updateCollectCellId = [];
    for (const d of this.getContainMergeDataSource()) {
      if (!d) return;
      this.renderExpanderCell(d);
      this.updateCollectCellId?.push(d.id);
    }
  }

  removeCellInContainer() {
    const [t, b] = this.containerRange;
    this.listCellMap.forEach((cell) => {
      const { top, bottom, id } = cell.mergeTimelineDataSource!;
      if (
        getContainType({
          contain: [t, b],
          contained: [top, bottom],
        }) === ContainTypeEnum.NONE ||
        !this.updateCollectCellId?.includes(id)
      ) {
        cell?.hiddenElement();
        this.cellReuses?.push(cell);
        this.listCellMap.delete(id);
      }
    });
  }

  getContainMergeDataSource() {
    const { mergeSourceDataIdCols, mergeSourceDataMap } = this.gantt!;
    const containRange = this.getContainerRange();
    const [t, b] = containRange;
    return Array.from(
      new Set(
        mergeSourceDataIdCols
          ?.slice(Math.floor(t), Math.ceil(b) + 1)
          .filter((id) => !!id)
      )
    )?.map((id) => {
      return mergeSourceDataMap?.get(id);
    });
  }

  update(payload?: { updateInner: boolean }) {
    const { updateInner = true } = payload ?? {};
    if (updateInner) this.updateInnerContainer();
    this.updateCellToContainer();
    this.removeCellInContainer();
  }

  getContainerRange(): number[] {
    if (!this.container) return [];
    const { scrollTop = 0 } = this.container;
    const { height: cellHeight } = this.gantt!.styles?.cell!;
    const { height } = this.container!.getBoundingClientRect() ?? {};

    return [scrollTop / cellHeight, (scrollTop + height) / cellHeight];
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
