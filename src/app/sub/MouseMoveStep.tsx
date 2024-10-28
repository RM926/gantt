import Gantt from "@/gantt";
import MouseMoveStep from "@/gantt/utils/mouse_move_step copy";
import { useEffect, useRef, useState } from "react";

const MouseMoveStepTest = () => {
  const [position, setPosition] = useState([120, 120]);
  const [left, top] = position;
  const ganttRef = useRef<Gantt>();

  useEffect(() => {
    if (ganttRef.current) return;
    ganttRef.current = new MouseMoveStep({
      targetElement: document.querySelector("#container_ref")!,
      moveStepCallback(payload) {
        const { type, changeStep } = payload;
        console.log(type, changeStep);
        if (type === "x") {
          setPosition((pre) => {
            const [l, t] = pre;
            return [l + changeStep, t];
          });
        } else if (type === "y") {
          setPosition((pre) => {
            const [l, t] = pre;
            return [l, t + changeStep];
          });
        }
      },
    });
  }, []);

  return (
    <div
      style={{
        marginTop: 100,
        position: "relative",
        display: "grid",
        gridTemplateRows: "repeat(6,1fr)",
        gridTemplateColumns: "repeat(6,1fr)",
        height: 360,
        width: 360,
      }}
    >
      <>
        <div
          id="container_ref"
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            background: "skyblue",
            top,
            left,
          }}
        />
        {new Array(36).fill(0).map((_, i) => {
          return <div key={i} style={{ border: "1px solid red" }}></div>;
        })}
      </>
    </div>
  );
};

export default MouseMoveStepTest;
