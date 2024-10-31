import Gantt from "@/gantt";
import MouseMoveGrid from "@/gantt/utils/mouse_move_grid";
import MouseMoveStep from "@/gantt/utils/mouse_move_step copy";
import { useEffect, useRef, useState } from "react";

const MouseMoveStepTest = () => {
  const [position, setPosition] = useState([120, 120]);
  const [left, top] = position;
  const mouseMoveGridRef = useRef<MouseMoveGrid>();

  useEffect(() => {
    if (mouseMoveGridRef.current) return;
    mouseMoveGridRef.current = new MouseMoveGrid({
      gridContainer: document.querySelector("#grid") as HTMLElement,
      target: document.querySelector("#container_ref") as HTMLElement,
    });
  }, []);

  return (
    // <div
    //   style={{
    //     width: 200,
    //     marginTop: 100,
    //     marginLeft: 100,
    //     height: 200,
    //     overflow: "auto",
    //   }}
    // >
    <div
      id="grid"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateRows: "repeat(6,1fr)",
        gridTemplateColumns: "repeat(6,1fr)",
        height: 360,
        width: 360,
        marginTop: 400
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
    // </div>
  );
};

export default MouseMoveStepTest;
