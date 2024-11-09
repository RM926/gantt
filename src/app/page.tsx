"use client";
import Gantt from "@/gantt";
import { data } from "@/gantt/data_source";
import {
  TCalenderListCell,
  TExpanderListCell,
  TTimelineCellContent,
  TTimelineCellVisualContent,
  TTimelineListCell,
  TVueExpanderListCell,
} from "@/app/sub";
import { useEffect, useRef } from "react";
import { loopTree, oneDayTimeStamp } from "@/gantt/utils";
import MouseMoveStepTest from "./sub/MouseMove";
import { TimelineCellContent } from "@/gantt/chart/timeline/cell/content";
import Scroll from "./sub/Scroll";

const Page = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<Gantt>();

  useEffect(() => {
    if (!ganttRef.current && containerRef.current) {
      ganttRef.current = new Gantt({
        container: containerRef.current,
        dataSource: data,
        expandIds: ["1"],
        timeRange: ["2024/10/1", "2024/10/29"],
        styles: {
          cell: {
            height: 40,
            width: 50,
          },
        },
        /**
         *  每个class都有对应的render(调用一次) updateRender(滚动触发)来触发更新视图
         *  gantt渲染了每个组件的容器位置，填充的内容如下进行自定义
         */
        enhance: {
          timeline: {
            // todo TS类型
            // cell: TTimelineListCell,
            // cellContent: TTimelineCellContent as any,
            visualContent: TTimelineCellVisualContent as any,
          },
          expanderLabel: {
            cell: TExpanderListCell as any,
          },
          calender: {
            cell: TCalenderListCell as any,
          },
        },
      });
      console.log(ganttRef.current);
    }
  }, []);
  return (
    <div>
      <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
        <button
          onClick={() => {
            ganttRef.current?.update({
              cellGap: oneDayTimeStamp / 24,
            });
          }}
        >
          changeCellGap(hour)
        </button>
        <button
          onClick={() => {
            ganttRef.current?.update({
              cellGap: oneDayTimeStamp,
            });
          }}
        >
          changeCellGap(day)
        </button>
        <button
          onClick={() => {
            ganttRef.current?.update({
              styles: {
                cell: {
                  width: "auto",
                  height: 30,
                },
              },
            });
          }}
        >
          autoCellWidth
        </button>
        <button
          onClick={() => {
            ganttRef.current?.update({
              styles: {
                cell: {
                  width: 50,
                  height: 40,
                },
                header: {
                  height: 100,
                },
              },
            });
          }}
        >
          changeStyles
        </button>
      </div>

      {/* <MouseMoveStepTest />  */}
      {/* <Scroll /> */}
      <div
        ref={containerRef}
        style={{
          width: "calc(100% - 100px)",
          maxHeight: "100vh",
        }}
      />
    </div>
  );
};

export default Page;
