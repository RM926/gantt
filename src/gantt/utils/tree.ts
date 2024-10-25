import {
  GanttSourceData,
  GanttSourceDataTimeline,
  MergeTimelineDataSource,
} from "../index.d";
import { data } from "../data_source";
import { oneDayTimeStamp } from "./date";
import { getMergeTimelines, ReturnMergeTimeline } from "./merge";

type Tree = {
  id: string | number;
  children?: Tree[];
};

const treeData: Tree[] = [
  {
    id: "0",
    children: [
      {
        id: "0-1",
        children: [
          {
            id: "0-1-0",
          },
          {
            id: "0-1-1",
            children: [
              {
                id: "0-1-1-0",
              },
            ],
          },
        ],
      },
      {
        id: "0-2",
        children: [
          {
            id: "0-2-0",
          },
          {
            id: "0-2-1",
          },
        ],
      },
      {
        id: "0-3",
      },
    ],
  },
  {
    id: "1",
    children: [
      {
        id: "1-1",
        children: [
          {
            id: "1-1-0",
          },
          {
            id: "1-1-1",
            children: [
              {
                id: "1-1-1-0",
              },
            ],
          },
        ],
      },
      {
        id: "1-2",
        children: [
          {
            id: "1-2-0",
          },
          {
            id: "1-2-1",
          },
        ],
      },
      {
        id: "1-3",
      },
    ],
  },
];

const timestampLine = [
  {
    id: "1727539200000",
    left: 0,
    right: 1,
    value: 1727539200000,
  },
  {
    id: "1727625600000",
    left: 1,
    right: 2,
    value: 1727625600000,
  },
  {
    id: "1727712000000",
    left: 2,
    right: 3,
    value: 1727712000000,
  },
  {
    id: "1727798400000",
    left: 3,
    right: 4,
    value: 1727798400000,
  },
  {
    id: "1727884800000",
    left: 4,
    right: 5,
    value: 1727884800000,
  },
  {
    id: "1727971200000",
    left: 5,
    right: 6,
    value: 1727971200000,
  },
  {
    id: "1728057600000",
    left: 6,
    right: 7,
    value: 1728057600000,
  },
  {
    id: "1728144000000",
    left: 7,
    right: 8,
    value: 1728144000000,
  },
  {
    id: "1728230400000",
    left: 8,
    right: 9,
    value: 1728230400000,
  },
  {
    id: "1728316800000",
    left: 9,
    right: 10,
    value: 1728316800000,
  },
  {
    id: "1728403200000",
    left: 10,
    right: 11,
    value: 1728403200000,
  },
  {
    id: "1728489600000",
    left: 11,
    right: 12,
    value: 1728489600000,
  },
];

export function loopTree(tree: Tree[]) {
  for (let t of tree) {
    // 顺序
    // console.log(t.id);
    if (t.children?.length) {
      loopTree(t.children);
    }
    // 倒序
    // console.log(t.id);
  }
}
// loopTree(treeData);

export function getTreePathTarget<T extends Tree>(
  tree: T[],
  path: (number | string)[],
  pathIndex = 0
) {
  const pathId = path[pathIndex ?? 0];
  for (let t of tree) {
    // console.log(t.id, t);
    if (t.id === pathId) {
      const nextPathId = path?.[pathIndex + 1];
      if (nextPathId && t?.children?.length)
        return getTreePathTarget(t.children, path, pathIndex + 1);
      if (!nextPathId) return t;
    }
  }
}

// console.log(getLoopTreePathTarget(treeData, ["1", "1-2", "1-1-1"]));
// 顺序
/**
 * 剔除未展开的叶子节点 添加expand,expandable
 * 添加位置信息
 */
export function getMergeTimelinesSourceData(payload: {
  dataSource: GanttSourceData[];
  timestampLine: number[];
  cellGap: number;
  expandIds?: (number | string)[];
}) {
  let verticalCurrentRowIdx = 0;

  function loopSourceData(payload: {
    dataSource: GanttSourceData[];
    expandIds?: (number | string)[];
    timestampLine: number[];
    cellGap: number;
    father?: MergeTimelineDataSource;
    result?: MergeTimelineDataSource[];
  }) {
    const {
      dataSource,
      expandIds = [],
      timestampLine,
      cellGap,
      father,
      result = [],
    } = payload;
    for (let t of dataSource) {
      // console.log(t, father);
      const { children, timelines, ...other } = t;
      const mergeTimelines = getMergeTimelines({
        timelines,
        timestampLine,
        cellGap,
        verticalCurrentRowIdx,
        path: [...(father?.path ?? []), t.id],
      });
      // const mergeTimelines = [];

      const lastVerticalCurrentRowIdx = verticalCurrentRowIdx;
      verticalCurrentRowIdx =
        verticalCurrentRowIdx + Math.max(mergeTimelines?.length, 1);
      const newFather: MergeTimelineDataSource = {
        ...other,
        timelines,
        mergeTimelines,
        top: lastVerticalCurrentRowIdx,
        bottom: verticalCurrentRowIdx,
        expand: expandIds.includes(t.id),
        expandable: !!t.children?.length,
        path: [t.id],
      };

      if (!father) {
        result.push(newFather);
      } else {
        if (!father?.children) father.children = [];
        father.children.push(newFather);
        newFather.path.unshift(...(father?.path ?? []));
      }

      // 跳过未展开的节点
      if (!expandIds?.includes(t.id)) {
        continue;
      }
      if (t.children?.length) {
        loopSourceData({
          dataSource: t.children,
          expandIds,
          timestampLine,
          cellGap,
          result,
          father: newFather,
        });
      }
    }
    return result;
  }

  const { dataSource, expandIds, timestampLine, cellGap } = payload;
  const renderDataSource = loopSourceData({
    timestampLine,
    cellGap,
    dataSource,
    expandIds,
  });
  console.log("renderDataSource", renderDataSource);
  return renderDataSource;
}

// getMergeTimelinesSourceData({
//   dataSource: treeData,
//   expandIds: ["0", "0-1"],
//   timestampLine: timestampLine!.map((t) => t.value),
//   cellGap: oneDayTimeStamp,
// });
