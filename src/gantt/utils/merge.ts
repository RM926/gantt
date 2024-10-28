import {
  GanttSourceData,
  GanttSourceDataTimeline,
  MergeTimelineDataSource,
} from "../index.d";
import { ContainTypeEnum, judgeContainType } from "./contain";
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
    for (let t of d.timelines) {
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
}) => {
  const { timeRange } = payload;
  if (timeRange?.length < 2) return [];

  const [start, end] = timeRange;
  const startTimestamp = getStartTime(new Date(start));
  const endTimestamp = getStartTime(new Date(end));
  const result = [startTimestamp];
  let accumulate = startTimestamp;
  while (accumulate < endTimestamp) {
    accumulate = accumulate + oneDayTimeStamp;
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
  timelines: GanttSourceDataTimeline[];
  timestampLine: number[];
  /** 上一行数据的垂直方向的行数 */
  verticalCurrentRowIdx: number;
  cellGap: number;
  path: (string | number)[];
}): ReturnMergeTimeline[][] => {
  const { timelines, timestampLine, verticalCurrentRowIdx, cellGap, path } =
    payload;
  const currentBeginTime = timestampLine[0];

  const mergeTimelinesArray: ReturnMergeTimeline[][] = [];

  const diskArrayCount =
    (timestampLine.slice(-1)[0] - currentBeginTime) / cellGap + 1;

  const diskArray = !!diskArrayCount ? [new Array(diskArrayCount).fill(0)] : [];

  /** 找到单个数据位于的行数 */
  function findFillDiskArrayIndex(params: {
    diskArray: (number | string)[][];
    begin: number;
    finish: number;
    fillId: number | string;
    cellGap: number;
  }): number {
    const { diskArray: _diskArray, begin, finish, fillId } = params;

    let isOverlap = false;
    let diskIdx = -1;
    const emptyDiskArray: (number | string)[] = new Array(
      _diskArray[0].length
    ).fill(0);
    let isEmptyDiskArrayIsFill = false;
    for (let i = 0; i < _diskArray.length; i++) {
      const currentDiskArray = JSON.parse(JSON.stringify(_diskArray[i]));
      isOverlap = false;
      for (let j = begin; j < finish; j++) {
        if (!isEmptyDiskArrayIsFill) {
          emptyDiskArray[j] = fillId;
        }

        if (currentDiskArray[j]) {
          isOverlap = true;
        }
        currentDiskArray[j] = fillId;
      }

      isEmptyDiskArrayIsFill = true;

      if (!isOverlap) {
        diskIdx = i;
        _diskArray[diskIdx] = currentDiskArray;
        break;
      }
    }

    if (diskIdx === -1) {
      _diskArray.push(emptyDiskArray);
    }
    return diskIdx;
  }

  for (const t of timelines) {
    const { startTime, endTime, id } = t;
    const cellBeginCount = (startTime - currentBeginTime) / cellGap;
    const cellFinishCount = (endTime - startTime) / cellGap + cellBeginCount;
    const idx = findFillDiskArrayIndex({
      diskArray,
      begin: cellBeginCount,
      finish: cellFinishCount,
      fillId: id,
      cellGap,
    });

    const topIdx =
      (idx === -1 ? diskArray.length - 1 : idx) + verticalCurrentRowIdx;
    const newRow = {
      ...t,
      cellBeginCount,
      cellFinishCount,
      cellTopCount: topIdx,
      cellBottomCount: topIdx + 1,
      path,
    };

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
