"use client";
import Gantt from "@/gantt";
import { data } from "@/gantt/data_source";
import { TTimelineListCell } from "@/gantt/demo";
import { useEffect, useRef } from "react";

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
            cell: TTimelineListCell,
          },
        },
      });
    }
  }, []);
  return <div ref={containerRef} style={{ width: 700, height: 500 }} />;
};

export default Page;
