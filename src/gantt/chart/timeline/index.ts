import Gantt, { GanttConfig } from "../../index";
import { ContainTypeEnum, getContainType } from "../../utils/contain";
import { ReturnMergeTimeline } from "../../utils/handle";
import MoveOverflowScroll, {
  MoveDirection,
  MoveScrollOverflowConfig,
} from "../../utils/move_overflow_scroll";
import TimelineCell, { TimelineCellConfig } from "./timeline_cell";

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
  moveOverflowScroll?: MoveOverflowScroll;
  enhance?: GanttTimelineConfig["enhance"];

  timelineCellMap = new Map<string, TimelineCell>();
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
    const { width, height } = (this.gantt?.styles?.cell ?? {}) as any;
    const _that = this;
    this.moveOverflowScroll = new MoveOverflowScroll({
      targetElement: _that.container!,
      scrollStep: [width, height],
      scrollStepChange: _that.scrollStepChange,
    });
    this.moveOverflowScroll.setScrollLock(true);
  }

  // 滚动出屏幕外处理逻辑
  scrollStepChange: MoveScrollOverflowConfig["scrollStepChange"] = (
    payload
  ) => {
    const { direction, changeStep } = payload;
    const movingCell = this.getMovingCell();
    if (movingCell) {
      if (
        direction === MoveDirection.RIGHT ||
        direction === MoveDirection.LEFT
      ) {
        const { endTime, startTime, cellFinishCount, cellBeginCount } =
          movingCell.mergeTimeline;
        const cellGap = this.gantt?.cellGap!;
        const newMergeTimeline = {
          ...movingCell.mergeTimeline,
          startTime: startTime + changeStep * cellGap,
          endTime: endTime + changeStep * cellGap,
          cellFinishCount: cellFinishCount + changeStep,
          cellBeginCount: cellBeginCount + changeStep,
        };
        movingCell.update({ mergeTimeline: newMergeTimeline });
      } else if (
        direction === MoveDirection.TOP ||
        direction === MoveDirection.BOTTOM
      ) {
        const { cellTopCount, cellBottomCount } = movingCell.mergeTimeline;
        const newMergeTimeline = {
          ...movingCell.mergeTimeline,
          cellTopCount: cellTopCount + changeStep,
          cellBottomCount: cellBottomCount + changeStep,
        };
        movingCell.update({ mergeTimeline: newMergeTimeline });
      }
    }
  };

  drawInnerContainer() {
    /**  绘制滚动内层区域 */
    this.innerContainer = document.createElement("div");
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
    };
    // console.log(styles, "styles");
    Object.entries(styles).forEach((entry) => {
      const [key, value] = entry as unknown as [number, string];
      this.innerContainer!.style[key] = value;
    });
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

  changeCell(mergeTimeline: ReturnMergeTimeline) {
    this.gantt?.updateCell(mergeTimeline);
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
        !this.judgeContain(cell.mergeTimeline, this.containerRange) &&
        !cell.moving
      ) {
        cell.cellElement?.remove();
        this.timelineCellMap.delete(cell.mergeTimeline.id);
      } else {
        cell.update();
      }
    });
  }

  updateCellToContainer() {
    // 添加
    const [t, b, l, r] = this.containerRange;
    if (this.gantt?.mergeTimelineSourceData) {
      for (let i = 0; i < this.gantt.mergeTimelineSourceData.length; i++) {
        const { top, bottom, mergeTimelines } =
          this.gantt.mergeTimelineSourceData[i];
        if (
          getContainType({
            contain: [t, b],
            contained: [top, bottom],
          }) !== ContainTypeEnum.NONE
        ) {
          mergeTimelines.forEach((mergeTimelineArr) => {
            mergeTimelineArr.forEach((mergeTimeline) => {
              const { id } = mergeTimeline;
              if (this.judgeContain(mergeTimeline, [t, b, l, r])) {
                const oldCell = this.timelineCellMap.get(id);
                if (oldCell) {
                  if (!oldCell.moving) {
                    oldCell.update({ mergeTimeline });
                  }
                } else {
                  const cell = this.createCell({
                    mergeTimeline,
                    ganttTimeline: this,
                  });
                  this.timelineCellMap.set(id, cell);
                  cell.update();
                }
              }
            });
          });
        }
        if (top >= b) break;
      }
    }
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

  getMovingCell(): TimelineCell | undefined {
    return [...this.timelineCellMap.values()].find((c) => c.moving);
  }

  createCell(config: TimelineCellConfig): TimelineCell {
    const c = this.enhance?.cell || TimelineCell;
    return new c(config);
  }
}

export default GanttTimeline;
