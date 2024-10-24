import { GanttSourceData } from "..";
import { data } from "../data_source";

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

// 顺序 未展开的剔除叶子节点
export function removeDataSourceLeaf(payload: {
  dataSource: GanttSourceData[];
  expandIds?: (number | string)[];
  modifying?: GanttSourceData[];
}) {
  const { dataSource, expandIds = [], modifying } = payload;

  for (let t of dataSource) {
    // 顺序
    console.log(t);
    if (!expandIds?.includes(t.id)) {
      continue;
    }

    if (t.children?.length) {
      // console.log("11", t);
      removeDataSourceLeaf({ dataSource: t.children, expandIds, modifying });
    }
    // console.log(t.id);
  }
}

export function loopDataSource(payload: {
  dataSource: GanttSourceData[];
  timestampLine?: number[];
  cellGap?: number;
  expandIds?: (number | string)[];
}) {
  const { dataSource, expandIds, timestampLine, cellGap } = payload;
  const showDataSource = removeDataSourceLeaf({ dataSource, expandIds });
  // for (let t of dataSource) {
  //   // 顺序
  //   console.log(t.id);
  //   if (!expandIds?.includes(t.id)) {
  //     continue;
  //   }
  //   if (t.children?.length) {
  //     loopDataSource({ dataSource: t.children, expandIds });
  //   }
  //   // 倒序
  // }
}

loopDataSource({
  dataSource: treeData,
  expandIds: ["0", "0-1"],
});
