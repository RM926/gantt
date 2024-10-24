"use client";
import Gantt from "@/gantt";
import { data } from "@/gantt/data_source";
import { TTimelineCellContent, TTimelineListCell } from "@/gantt/demo";
import { useEffect, useRef } from "react";
import { loopTree } from "@/gantt/utils";

const Page = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<Gantt>();
  useEffect(() => {
    if (!ganttRef.current && containerRef.current) {
      ganttRef.current = new Gantt({
        container: containerRef.current,
        dataSource: data,
        enhance: {
          timeline: {
            // cell: TTimelineListCell,
            cellContent: TTimelineCellContent,
          },
        },
      });
    }
  }, []);
  return <div ref={containerRef} style={{ width: 700, height: 500 }} />;
};

export default Page;
