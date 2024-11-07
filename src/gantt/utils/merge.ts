import {
  GanttSourceData,
  GanttSourceDataTimeline,
  MergeTimelineDataSource,
} from "../index.d";
import {
  ContainTypeEnum,
  getIntersectRange,
  judgeContainType,
} from "./contain";
import { getStartTime, oneDayTimeStamp } from "./date";
import { getTreePathTarget } from "./tree";

export const updateGanttDataSource = (payload: {
  dataSource: GanttSourceData[];
  mergeTimelinesSourceData: MergeTimelineDataSource[];
  returnMergeTimeline: ReturnMergeTimeline;
}) => {
  const { dataSource, mergeTimelinesSourceData, returnMergeTimeline } = payload;

  const {
    cellTopCount,
    cellBottomCount,
    cellFinishCount,
    cellBeginCount,
    path,
    ...timeline
  } = returnMergeTimeline;

  let downMergeSourceRow: MergeTimelineDataSource;

  function findDownMergeSourceRow(
    mergeTimelineDataSource: MergeTimelineDataSource[]
  ) {
    for (const m of mergeTimelineDataSource) {
      // console.log(m, "tt");
      const { top, bottom, id } = m;
      const isContain = judgeContainType({
        contain: [top, bottom],
        contained: [cellTopCount, cellBottomCount],
        type: ContainTypeEnum.CONTAIN,
      });
      // console.log(m, isContain, top, bottom, cellTopCount, cellBottomCount);
      // todo 递归打断退出不生效，return 只是当前嵌套的调用栈
      if (isContain) downMergeSourceRow = m;
      if (m?.children?.length)
        findDownMergeSourceRow(m.children as MergeTimelineDataSource[]);
    }
  }

  findDownMergeSourceRow(mergeTimelinesSourceData);

  const draftDataSource = JSON.parse(
    JSON.stringify(dataSource)
  ) as GanttSourceData[];

  const downSourceRow = getTreePathTarget(
    draftDataSource,
    downMergeSourceRow?.path
  );

  const moveSourceRow = getTreePathTarget(draftDataSource, path);
  // 删除移动的timelines --> 添加
  if (moveSourceRow?.timelines) {
    moveSourceRow.timelines = moveSourceRow?.timelines?.filter(
      (t) => t.id !== returnMergeTimeline.id
    );
  }
  if (downSourceRow) {
    if (!downSourceRow?.timelines?.length) {
      downSourceRow.timelines = [timeline];
    } else {
      downSourceRow.timelines.push(timeline);
    }
  }
  // console.log(
  //   downSourceRow,
  //   moveSourceRow,
  //   draftDataSource,
  //   "downSourceRow,moveSourceRow"
  // );
  return draftDataSource;
};

export const getTimeRangeTime = (payload: {
  dataSource: GanttSourceData[];
  expandIds?: (string | number)[];
  result?: number[];
}) => {
  const { dataSource, expandIds = [], result = [] } = payload;
  for (const d of dataSource) {
    for (let t of d.timelines ?? []) {
      const { startTime, endTime } = t;
      if (!result?.length) {
        result[0] = startTime;
        result[1] = endTime;
      } else {
        result[0] = Math.min(result[0], startTime);
        result[1] = Math.max(result[1], endTime);
      }
    }
    if (!expandIds?.includes(d.id)) {
      continue;
    }
    if (d.children?.length) {
      getTimeRangeTime({
        dataSource: d.children,
        expandIds,
        result,
      });
    }
  }

  return result;
};

export const getTimestampLineByTimeRange = (payload: {
  timeRange: (number | Date | string)[];
  cellGap: number;
}) => {
  const { timeRange, cellGap } = payload;
  if (timeRange?.length < 2) return [];

  const [start, end] = timeRange;
  const startTimestamp = getStartTime(new Date(start));
  const endTimestamp = getStartTime(new Date(end));
  const result = [startTimestamp];
  let accumulate = startTimestamp;
  while (accumulate < endTimestamp) {
    accumulate = accumulate + cellGap;
    if (accumulate <= endTimestamp) {
      result.push(accumulate);
    }
  }
  return result;
};

export const getTimestampLines = (timestampLines: number[]) => {
  return timestampLines.map((t, i) => {
    return {
      id: t.toString(),
      left: i,
      right: i + 1,
      value: t,
    };
  });
};

export type ReturnMergeTimeline = GanttSourceDataTimeline & {
  path: (number | string)[];
  /** X方向 */
  cellBeginCount: number;
  cellFinishCount: number;
  /** Y方向 */
  cellTopCount: number;
  cellBottomCount: number;
};

/** 合并没有重叠日期到同一行 */
export const getMergeTimelines = (payload: {
  timelines?: GanttSourceDataTimeline[];
  timestampLine: number[];
  patchMergeTimelineCallback?: (mergeTimeline: ReturnMergeTimeline) => void;
  /** 上一行数据的垂直方向的行数 */
  verticalCurrentRowIdx: number;
  cellGap: number;
  path: (string | number)[];
}): ReturnMergeTimeline[][] => {
  const {
    timelines,
    timestampLine,
    verticalCurrentRowIdx,
    cellGap,
    path,
    patchMergeTimelineCallback,
  } = payload;
  const currentBeginTime = timestampLine[0];

  const mergeTimelinesArray: ReturnMergeTimeline[][] = [];

  /** 找到单个数据位于的行数 */
  function findFillDiskArrayIndex(params: {
    mergeTimelinesArray: ReturnMergeTimeline[][];
    begin: number;
    finish: number;
  }): number {
    const { mergeTimelinesArray: mergeTimelinesArray, begin, finish } = params;

    let diskIdx = -1;
    for (let row in mergeTimelinesArray) {
      const mergeTimelines = mergeTimelinesArray[row];
      const canFill = mergeTimelines.every((m) => {
        const { cellBeginCount, cellFinishCount } = m;
        return !getIntersectRange(
          [begin, finish],
          [cellBeginCount, cellFinishCount]
        );
      });
      if (canFill) {
        diskIdx = +row;
        return diskIdx;
      }
    }
    return diskIdx;
  }

  for (const t of timelines ?? []) {
    const { startTime, endTime, id } = t;
    const cellBeginCount = (startTime - currentBeginTime) / cellGap;
    const cellFinishCount = (endTime - startTime) / cellGap + cellBeginCount;
    const idx = findFillDiskArrayIndex({
      mergeTimelinesArray,
      begin: cellBeginCount,
      finish: cellFinishCount,
    });

    const topIdx =
      (idx === -1 ? mergeTimelinesArray?.length : idx) + verticalCurrentRowIdx;
    const newRow = {
      ...t,
      cellBeginCount,
      cellFinishCount,
      cellTopCount: topIdx,
      cellBottomCount: topIdx + 1,
      path,
    };
    patchMergeTimelineCallback?.(newRow);
    if (idx === -1) {
      mergeTimelinesArray.push([newRow]);
    } else {
      if (!mergeTimelinesArray?.[idx]) {
        mergeTimelinesArray[idx] = [];
      }
      mergeTimelinesArray[idx].push(newRow);
    }
  }

  return mergeTimelinesArray;
};
