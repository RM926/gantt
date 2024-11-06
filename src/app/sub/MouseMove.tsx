import Gantt from "@/gantt";
import MouseMove, { MouseStatus } from "@/gantt/utils/mousemove";
import ScrollOffset from "@/gantt/utils/scroll_offset";
import ScrollOverflow from "@/gantt/utils/scroll_overflow";
import MoveOverflowScroll from "@/gantt/utils/scroll_overflow";
import { useEffect, useRef, useState } from "react";

const MouseMoveTest = () => {
  const [position, setPosition] = useState([0, 0]);
  const [left, top] = position;
  const mouseMoveGridRef = useRef<MouseMove>();
  const scrollOffsetRef = useRef<ScrollOffset>();

  useEffect(() => {
    if (mouseMoveGridRef.current) return;
    mouseMoveGridRef.current = new MouseMove({
      moveStep: [10, 60],
      offsetRange: true,
      range: [0, undefined, 0, undefined],
      container: document.querySelector("#grid") as HTMLElement,
      target: document.querySelector("#container_ref") as HTMLElement,
      mouseStatusChange: (status) => {
        if (status === MouseStatus.DOWN) {
          if (!scrollOffsetRef.current)
            scrollOffsetRef.current = new ScrollOffset({
              container: document.querySelector("#container") as HTMLElement,
              offsetChange: ({ type, changeStep }) => {
                if (mouseMoveGridRef.current?.moving) {
                  const [bx, by] = mouseMoveGridRef.current?.containerBegin;
                  console.log(bx, "bx");
                  if (type === "x") {
                    mouseMoveGridRef.current!.containerBegin = [
                      bx + changeStep,
                      by,
                    ];
                  }

                  if (type === "y") {
                    mouseMoveGridRef.current!.containerBegin = [
                      bx,
                      by + changeStep,
                    ];
                  }
                }
              },
            });
          scrollOffsetRef.current.record();
        }
      },
      moveStepChange: (payload) => {
        const { type, changeStep } = payload;
        if (type === "x") {
          setPosition((pre) => {
            const [x, y] = pre;
            return [x + changeStep * 10, y];
          });
        } else if (type === "y") {
          setPosition((pre) => {
            const [x, y] = pre;
            return [x, y + changeStep * 60];
          });
        }
      },
    });

    new ScrollOverflow({
      container: document.querySelector("#container") as HTMLElement,
      overflowStatusChange: ({ direction }) => {
        console.log(direction);
      },
    });
  }, []);

  return (
    <div
      id="container"
      style={{
        width: 400,
        marginTop: 100,
        marginLeft: 100,
        height: 400,
        overflow: "auto",
        border: "1px solid red",
      }}
    >
      <div
        id="grid"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateRows: "repeat(9,1fr)",
          gridTemplateColumns: "repeat(9,1fr)",
          height: 540,
          width: 540,
          marginTop: 100,
          marginLeft: 100,
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
          {new Array(81).fill(0).map((_, i) => {
            return <div key={i} style={{ border: "1px solid red" }}></div>;
          })}
        </>
      </div>
    </div>
  );
};

// 宽度限制
const MouseMoveStepTest2 = () => {
  const [size, setSize] = useState([240, 60]);
  const [position, setPosition] = useState([0, 0]);
  const [width, height] = size;
  const [left, top] = position;
  const mouseMoveGridRef = useRef<MouseMove>();

  useEffect(() => {
    if (mouseMoveGridRef.current) return;
    mouseMoveGridRef.current = new MouseMove({
      moveStep: [60, 60],
      offsetRange: true,
      range: [undefined, undefined, undefined, 240],
      container: document.querySelector("#grid") as HTMLElement,
      target: document.querySelector("#container_ref") as HTMLElement,
      moveStepChange: (payload) => {
        const { type, changeStep } = payload;
        if (type === "x") {
          setSize((pre) => {
            const [w, h] = pre;
            return [w - changeStep * 60, h];
          });
          setPosition((pre) => {
            const [l, t] = pre;
            return [l + changeStep * 60, t];
          });
        }
        //  else if (type === "y") {
        //   setSize((pre) => {
        //     const [x, y] = pre;
        //     return [x, y - changeStep * 60];
        //   });
        // }
      },
    });
  }, []);

  return (
    <div
      style={{
        width: 400,
        marginTop: 100,
        marginLeft: 100,
        height: 400,
        overflow: "auto",
        border: "1px solid red",
      }}
    >
      <div
        id="grid"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateRows: "repeat(9,1fr)",
          gridTemplateColumns: "repeat(9,1fr)",
          height: 540,
          width: 540,
          marginTop: 100,
          marginLeft: 100,
        }}
      >
        <>
          <div
            style={{
              position: "absolute",
              width,
              height,
              border: "1px solid red",
              top,
              left,
            }}
          >
            <div
              id="container_ref"
              style={{
                position: "absolute",
                width: 40,
                height: "100%",
                background: "skyblue",
                top: 0,
                left: 0,
              }}
            />
          </div>
          {new Array(81).fill(0).map((_, i) => {
            return <div key={i} style={{ border: "1px solid #000000" }}></div>;
          })}
        </>
      </div>
    </div>
  );
};

export default MouseMoveTest;
