import type {
  GanttSourceData,
  GanttSourceDataTimeline,
  MergeTimelineDataSource,
} from "../index.d";
import {
  getIntersectRange,
} from "./contain";
import { getStartTime } from "./date";
import { getTreePathTarget } from "./tree";

export const updateGanttDataSource = (payload: {
  dataSource: GanttSourceData[];
  downMergeSourceRow?: MergeTimelineDataSource;
  changeMergeTimeline: ReturnMergeTimeline;
}) => {
  const { dataSource, downMergeSourceRow, changeMergeTimeline } = payload;

  const {
    cellTopCount,
    cellBottomCount,
    cellFinishCount,
    cellBeginCount,
    path,
    ...timeline
  } = changeMergeTimeline

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
      (t) => t.id !== changeMergeTimeline.id
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
