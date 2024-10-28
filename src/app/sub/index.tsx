import TimelineCell, { TimelineCellConfig } from "@/gantt/chart/timeline/cell";
import {
  TimelineCellContent,
  TimelineCellContentConfig,
} from "@/gantt/chart/timeline/cell/content";
import ExpanderHeader, {
  ExpanderHeaderConfig,
} from "@/gantt/expander/column/header";
import ExpanderListCell, {
  ExpanderListCellConfig,
} from "@/gantt/expander/column/list/cell";
import { ReturnMergeTimeline } from "@/gantt/utils";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const App = (props: { a: number }) => {
  const [count, setCount] = useState(1);
  return (
    <>
      <div
        onClick={() => {
          setCount((pre) => pre + 1);
        }}
      >
        {count}
        {props?.a}
      </div>
      <div>list</div>
    </>
  );
};

const ExpanderListCellRender = (props: {
  expanderListCell: ExpanderListCell;
}) => {
  const { expanderListCell } = props;
  const { update, expandIds = [] } =
    expanderListCell?.expanderList?.gantt ?? {};
  const {
    id,
    expand,
    expandable,
    title,
    path = [],
  } = expanderListCell?.mergeTimelineDataSource ?? {};
  // console.log(
  //   expanderListCell?.mergeTimelineDataSource,
  //   expand,
  //   expandable,
  //   expandIds
  // );
  return (
    <div
      style={{
        fontSize: 12,
        height: "100%",
        paddingLeft: (path?.length - 1) * 12,
        cursor: expandable ? "pointer" : "default",
      }}
      onClick={() => {
        if (!expandable) return;
        const newExpandIds = expand
          ? expandIds.filter((d) => {
              return d !== id;
            })
          : [...expandIds, id!];
        update?.({
          expandIds: newExpandIds,
        });
      }}
    >
      <div>{title}</div>
      {expandable && <div>{expand ? "close" : "open"}</div>}
    </div>
  );
};

const TimelineCellRender = (props: { mergeTimeline: ReturnMergeTimeline }) => {
  const { mergeTimeline } = props;
  const {
    cellBeginCount,
    cellFinishCount,
    cellBottomCount,
    cellTopCount,
    startTime,
    endTime,
    id,
    path,
  } = mergeTimeline;
  return (
    <>
      {/* <div style={{ fontSize: 12, wordBreak: "break-all" }}>
        {JSON.stringify(mergeTimeline)}
      </div> */}
      <div
        style={{
          fontSize: 12,
          display: "grid",
          width: "100%",
          height: "100%",
          padding: "0 20px",
          gridTemplateColumns: "repeat(3,100px)",
          gridTemplateRows: "repeat(2)",
        }}
      >
        {[
          id,
          JSON.stringify(path),
          JSON.stringify([
            cellBeginCount,
            cellFinishCount,
            cellTopCount,
            cellBottomCount,
          ]),
          startTime,
          endTime,
        ].map((t, i) => {
          return <div key={i}>{t}</div>;
        })}
      </div>
    </>
  );
};

export class THeader extends ExpanderHeader {
  root?: any;
  constructor(config: ExpanderHeaderConfig) {
    super(config);
    // console.log(this, "this");
    // this.create();
    // console.log("ddd");
  }

  render(it: ExpanderHeader) {
    if (!this.root) this.root = createRoot(it.container!);
    this.root.render(<App a={3} />);
  }
}

export class TExpanderListCell extends ExpanderListCell {
  root?: any;
  constructor(config: ExpanderListCellConfig) {
    super(config);
  }

  // 覆盖原来的内容
  render(it: ExpanderListCell) {
    // if (!this.root) this.root = createRoot(it.cellElement!);
    // this.root.render(<App a={3} />);
  }

  // 创建新的内容
  updateRender(it: ExpanderListCell) {
    if (!this.root) this.root = createRoot(it.cellElement!);
    this.root.render(<ExpanderListCellRender expanderListCell={it} />);
  }
}

export class TTimelineListCell extends TimelineCell {
  root?: any;
  constructor(config: TimelineCellConfig) {
    super(config);
  }

  // 覆盖原来的内容
  render(it: TimelineCell) {}

  // 创建新的内容
  updateRender(it: TimelineCell) {
    if (!this.root) this.root = createRoot(it.cellElement!);
    this.root.render(<TimelineCellRender mergeTimeline={it.mergeTimeline} />);
  }
}

export class TTimelineCellContent extends TimelineCellContent {
  root?: any;
  constructor(config: TimelineCellContentConfig) {
    super(config);
  }

  // 首次渲染的内容
  render(it: TimelineCellContent) {}

  // 创建新的内容
  updateRender(it: TimelineCellContent) {
    if (!this.root) this.root = createRoot(it.element!);
    const mergeTimeline = it.timelineCell?.mergeTimeline! ?? {};
    this.root.render(<TimelineCellRender mergeTimeline={mergeTimeline} />);
  }
}
