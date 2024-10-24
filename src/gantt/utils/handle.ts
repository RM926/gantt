import {
  GanttSourceData,
  GanttSourceDataTimeline,
  MergeTimelineDataSource,
} from "../index.d";
import { ContainTypeEnum, judgeContainType } from "./contain";
import { getStartTime, oneDayTimeStamp } from "./date";

export const updateGanttDataSource = (payload: {
  dataSource: GanttSourceData[];
  mergeTimelinesSourceData: MergeTimelineDataSource[];
  returnMergeTimeline: ReturnMergeTimeline;
}) => {
  const { dataSource, mergeTimelinesSourceData, returnMergeTimeline } = payload;
  const returnFatherId = returnMergeTimeline.fatherId;

  const {
    cellTopCount,
    cellBottomCount,
    cellFinishCount,
    cellBeginCount,
    ...timeline
  } = returnMergeTimeline;
  console.log(
    returnMergeTimeline,
    mergeTimelinesSourceData,
    "return MergeTimeline"
  );

  // console.log(
  //   fatherId,
  //   JSON.parse(JSON.stringify(mergeTimelinesSourceData)),
  //   "fatherId,mergeTimelinesSourceData"
  // );

  function findDownRow(mergeTimelineDataSource: MergeTimelineDataSource[]) {
    for (const m of mergeTimelineDataSource) {
      console.log(m, "tt");
      const { top, bottom, id } = m;
      const isContain = judgeContainType({
        contain: [top, bottom],
        contained: [cellTopCount, cellBottomCount],
        type: ContainTypeEnum.CONTAIN,
      });
      console.log(m, isContain, top, bottom, cellTopCount, cellBottomCount);
      if (id === "1-1-1") {
        console.log(isContain, "inter");
        return;
      }
      if (m?.children?.length)
        findDownRow(m.children as MergeTimelineDataSource[]);
    }
  }

  const downRow = findDownRow(mergeTimelinesSourceData);
  console.log(downRow);
  // const moveRowIndex = mergeTimelinesSourceData.findIndex((m) => {
  //   return m.id === returnFatherId;
  // });

  // console.log(downRowIndex, moveRowIndex, "downRowIndex,moveRowIndex");

  // const draftDataSource = JSON.parse(
  //   JSON.stringify(dataSource)
  // ) as GanttSourceData[];

  // const moveRow = draftDataSource[moveRowIndex];
  // moveRow.timelines = moveRow.timelines.filter(
  //   (t) => t.id !== returnMergeTimeline.id
  // );
  // if (!draftDataSource[downRowIndex]?.timelines?.length)
  //   draftDataSource[downRowIndex].timelines = [];
  // draftDataSource[downRowIndex].timelines.push(timeline);

  // console.log(draftDataSource, dataSource, "draftDataSource, dataSource");

  // return draftDataSource;
};

export const getTimeRangeTime = (payload: {
  dataSource: GanttSourceData[];
}) => {
  const { dataSource } = payload;
  let start = 0;
  let end = 0;

  for (const d of dataSource) {
    for (const t of d.timelines) {
      const { startTime, endTime } = t;
      if (start === 0 && end === 0) {
        start = startTime;
        end = endTime;
        continue;
      }
      if (startTime <= start) start = startTime;
      if (endTime >= end) end = endTime;
    }
  }

  return [start, end];
};

export const getTimestampLineByTimeRange = (payload: {
  timeRange: (number | Date | string)[];
}) => {
  const { timeRange } = payload;
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
  const {
    timelines,

    timestampLine,
    verticalCurrentRowIdx,
    cellGap,
    path,
  } = payload;
  const currentBeginTime = timestampLine[0];
  const mergeTimelinesArray: ReturnMergeTimeline[][] = [];

  const diskArrayCount =
    (timestampLine.slice(-1)[0] - currentBeginTime) / cellGap;

  const diskArray = [new Array(diskArrayCount).fill(0)];

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

// export const getMergeTimelinesSourceData = (payload: {
//   dataSource: GanttSourceData[];
//   timestampLine: number[];
//   CellGap: number;
// }) => {
//   const { dataSource, timestampLine, CellGap } = payload;
//   /** 记录当前行数 */
//   let verticalCurrentRowIdx = 0;
//   return dataSource.map((d) => {
//     const mergeTimelines = getMergeTimelines({
//       timelines: d.timelines,
//       timestampLine,
//       verticalCurrentRowIdx,
//       cellGap: CellGap,
//       fatherId: d.id,
//     });
//     const currentStartRowIdx = verticalCurrentRowIdx;
//     /** 无论有没有数据,一行至少占一行(空白数据情况) */
//     verticalCurrentRowIdx += Math.max(mergeTimelines?.length, 1);
//     return {
//       ...d,
//       top: currentStartRowIdx,
//       bottom: verticalCurrentRowIdx,
//       mergeTimelines,
//     };
//   });
// };
