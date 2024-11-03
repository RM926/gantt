import { useEffect } from "react";
var ticking = false; // rAF 触发锁

function Scroll() {
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(realFunc);
      ticking = true;
    }
  }

  function realFunc() {
    // do something...
    const bars = document.querySelectorAll(".scroll_bar");
    const { scrollLeft } = document.querySelector(".scroll_container")!;
    // console.log(bar, scrollLeft);
    Array.from(bars).forEach((bar) => {
      (bar as HTMLElement).style.left = `${scrollLeft}px`;
    });
    ticking = false;
  }

  return (
    <div
      style={{
        height: 300,
        width: 400,
        border: "1px solid red",
        position: "relative",
        overflow: "auto",
      }}
      className="scroll_container"
      onScroll={onScroll}
    >
      <div style={{ border: "1px solid blue", width: 20000, height: 300 }}>
        {new Array(30).fill(0).map((it, key) => {
          return (
            <div
              key={key}
              className="scroll_bar"
              style={{
                top: key * 10 + key,
                width: 100,
                position: "absolute",
                background: "lightblue",
                height: 10,
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

export default Scroll;
