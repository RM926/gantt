import { appendClassName, createElement } from "../../utils";
import { MergeTimelineDataSource } from "../../../gantt/index.d";
import Gantt from "../../index";
import { ContainTypeEnum, getContainType } from "../../utils/contain";
import { ReturnMergeTimeline, updateGanttDataSource } from "../../utils/merge";
import TimelineCell, { TimelineCellConfig } from "./cell";
import { GanttTimelineInnerClassName } from "../../constant";
import ScrollOverflow from "../../utils/scroll_overflow";
import ResizeObserverDom from "../../utils/resize-observer-dom";
import { throttle } from "lodash";

type GanttTimelineConfig = {
  container?: HTMLElement;
  gantt: Gantt;
  enhance?: {
    cell?: TimelineCell;
  };

  // event
  scrollCallback?: (e?: Event) => void;
};

class GanttTimeline {
  container?: GanttTimelineConfig["container"];
  innerContainer?: HTMLElement;

  gantt?: Gantt;
  scrollOverflow?: ScrollOverflow;
  enhance?: GanttTimelineConfig["enhance"];

  cellReuses?: TimelineCell[] = [];

  timelineCellMap = new Map<string, TimelineCell>();
  /** 收集本次检测更新的id,方便清除timelineCellMap的缓存数据 */
  updateCollectCellId?: (number | string)[];

  //  [t, b, l, r]
  containerRange: number[] = [];

  scrollCallback?: GanttTimelineConfig["scrollCallback"];

  constructor(config: GanttTimelineConfig) {
    this.initConfig(config);
    this.init();
  }

  initConfig(config: GanttTimelineConfig) {
    const { container, gantt, scrollCallback, enhance } = config;
    if (container) this.container = container;
    if (gantt) this.gantt = gantt;
    if (enhance) this.enhance = enhance;
    if (scrollCallback) this.scrollCallback = scrollCallback;
  }

  init() {
    this.drawInnerContainer();
    this.registerEvent();
    this.onContainerScroll();
    const _that = this;
    this.scrollOverflow = new ScrollOverflow({
      container: _that.container!,
    });
    new ResizeObserverDom(_that.container!).observerSize(() => {
      _that.update();
    });
    this.scrollOverflow.setScrollLock(true);
  }

  drawInnerContainer() {
    /**  绘制滚动内层区域 */
    this.innerContainer = createElement("div");
    appendClassName(this.innerContainer, [GanttTimelineInnerClassName]);
    this.updateInnerContainer();
    this.container?.appendChild(this.innerContainer);
  }

  updateInnerContainer() {
    const { height: cellHeight, width: cellWidth } = this.gantt!.styles?.cell!;
    const styles = {
      position: "relative",
      width: `${cellWidth * this.gantt!.timestampLine?.length}px`,
      height: `${cellHeight * this.gantt!.getMergeTimelinesRowCount()}px`,
      boxSizing: "border-box",
      backgroundSize: `${cellWidth}px ${cellHeight}px`,
    };
    Object.entries(styles).forEach((entry) => {
      const [key, value] = entry as unknown as [number, string];
      this.innerContainer!.style[key] = value;
    });
    this.containerRange = this.getContainerRange();
  }

  onContainerScroll = (e?: Event) => {
    this.containerRange = this.getContainerRange();
    this.update({ updateInner: false });
    this.scrollCallback?.(e);
  };

  registerEvent() {
    this.container?.addEventListener("scroll", this.onContainerScroll);
  }

  changeCell(mergeTimeline: ReturnMergeTimeline) {
    const { dataSource, mergeTimelineSourceData } = this.gantt!;
    this.gantt?.update({
      dataSource: updateGanttDataSource({
        dataSource: dataSource!,
        mergeTimelinesSourceData: mergeTimelineSourceData!,
        returnMergeTimeline: mergeTimeline,
      }),
    });
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

  removeCellInContainer() {
    this.timelineCellMap.forEach((cell) => {
      if (
        (!this.judgeContain(cell.mergeTimeline, this.containerRange) ||
          !this.updateCollectCellId?.includes(cell.mergeTimeline.id)) &&
        !cell.moving &&
        !cell.leftDragging &&
        !cell.rightDragging
      ) {
        cell?.hiddenElement();
        this.cellReuses?.push(cell);
        this.timelineCellMap.delete(cell.mergeTimeline.id);
      } else {
        cell.updateSub(cell);
      }
    });
  }

  renderTimeline(mergeTimeline: ReturnMergeTimeline) {
    const { id } = mergeTimeline;

    const oldCell = this.timelineCellMap.get(id);
    if (oldCell) {
      if (!oldCell.moving && !oldCell.leftDragging && !oldCell.rightDragging) {
        oldCell.update({ mergeTimeline });
        return;
      } else {
        oldCell.updateSub(oldCell);
      }
    } else {
      let cell = this.cellReuses?.shift();
      if (cell) {
        cell.update({ mergeTimeline });
        this.timelineCellMap.set(id, cell);
      } else {
        cell = this.createCell({
          mergeTimeline,
          ganttTimeline: this,
        });
        this.timelineCellMap.set(id, cell);
        cell.update();
      }
    }
  }

  updateCellToContainer() {
    const [, b] = this.containerRange;
    this.updateCollectCellId = [];
    const _that = this;
    function renderLoop(mergeTimelineDataSource: MergeTimelineDataSource[]) {
      for (const d of mergeTimelineDataSource) {
        const { mergeTimelines, children, top } = d;
        // console.log(mergeTimelines, "mergeTimelines");
        mergeTimelines.forEach((mergeTimeline) => {
          mergeTimeline.forEach((m) => {
            // console.log(m, "m");
            if (_that.judgeContain(m, _that.containerRange)) {
              _that.updateCollectCellId?.push(m.id);
              _that.renderTimeline(m);
            }
            if (top > b) return;
          });
        });

        if (children?.length) {
          renderLoop(children as MergeTimelineDataSource[]);
        }
      }
    }

    renderLoop(this.gantt?.mergeTimelineSourceData ?? []);
  }

  update(payload?: { updateInner?: boolean }) {
    const { updateInner = true } = payload ?? {};
    if (updateInner) this.updateInnerContainer();
    // 内层函数为一个CellGap更新一次，所以如果超出屏幕进行滚动,需要与屏幕滚动高度贴合的数据要在上层手动更新
    this.updateCellToContainer();
    this.removeCellInContainer();
  }

  getContainerRange(): number[] {
    if (!this.container) return [];
    const { scrollLeft = 0, scrollTop = 0 } = this.container;
    const { height: cellHeight, width: cellWidth } = this.gantt!.styles?.cell!;
    const { width, height } = this.container!.getBoundingClientRect() ?? {};

    return [
      scrollTop / cellHeight,
      (scrollTop + height) / cellHeight,
      scrollLeft / cellWidth,
      (scrollLeft + width) / cellWidth,
    ];
  }

  /**
   *
   * @param mergeTimeline
   * @param containRange 上下左右数据
   */
  judgeContain(mergeTimeline: ReturnMergeTimeline, containRange: number[]) {
    const { cellBeginCount, cellFinishCount, cellTopCount, cellBottomCount } =
      mergeTimeline;
    const [t, b, l, r] = containRange;
    return !(
      getContainType({
        contain: [t, b],
        contained: [cellTopCount, cellBottomCount],
      }) === ContainTypeEnum.NONE ||
      getContainType({
        contain: [l, r],
        contained: [cellBeginCount, cellFinishCount],
      }) === ContainTypeEnum.NONE
    );
  }

  createCell(config: TimelineCellConfig): TimelineCell {
    const c = this.enhance?.cell || TimelineCell;
    return new (c as any)(config);
  }
}

export default GanttTimeline;
