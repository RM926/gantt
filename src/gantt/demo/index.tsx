import { createRoot } from "react-dom/client";
import ExpanderHeader, {
  ExpanderHeaderConfig,
} from "../expander/column/header";
import { useState } from "react";
import ExpanderListCell, {
  ExpanderListCellConfig,
} from "../expander/column/list/cell";
import TimelineCell, {
  TimelineCellConfig,
} from "../chart/timeline/timeline_cell";
import { ReturnMergeTimeline } from "../utils/handle";

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

const TimelineCellRender = (props: { mergeTimeline: ReturnMergeTimeline }) => {
  const { mergeTimeline } = props;
  const {
    cellBeginCount,
    cellFinishCount,
    cellBottomCount,
    cellTopCount,
    startTime,
    endTime,
  } = mergeTimeline;
  return (
    <div
      style={{
        fontSize: 12,
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateColumns: "repeat(2,100px)",
        gridTemplateRows: "repeat(3)",
      }}
    >
      {[
        cellBeginCount,
        cellFinishCount,
        cellBottomCount,
        cellTopCount,
        startTime,
        endTime,
      ].map((t, i) => {
        return <div key={i}>{t}</div>;
      })}
    </div>
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
    const containerRangeBottom = it.expanderList?.containerRange?.[1];
    this.root.render(<App a={1} />);
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
