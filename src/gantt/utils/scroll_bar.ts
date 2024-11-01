import MouseMove from "./mousemove";
import ResizeObserverDom from "./resize-observer-dom";

type ScrollBarConfig = {
  targetElement: HTMLElement;
};

export class ScrollBar {
  target?: HTMLElement;

  xScrollBarOuter?: HTMLElement;
  xScrollBar?: HTMLElement;

  yScrollBarOuter?: HTMLElement;
  yScrollBar?: HTMLElement;

  yMouseMoveStep?: MouseMove;
  xMouseMoveStep?: MouseMove;

  targetResizeObserver?: ResizeObserverDom;

  constructor(config: ScrollBarConfig) {
    const { targetElement } = config;
    this.target = targetElement;
    this._init();
  }

  _init() {
    this.createX();
    this.createY();
    this.targetResizeObserver = new ResizeObserverDom(this.target!);
    this.targetResizeObserver.observerSize(this.resize);
    this.watch();
  }

  createX() {
    const { width } = this.target!.getBoundingClientRect();
    const { scrollWidth } = this.target!;
    const xScrollBarOuterDom = document.createElement("div");
    const xScrollBarDom = document.createElement("div");

    const xScrollBarOuterDomStyles = {
      position: "absolute",
      bottom: "0px",
      left: "0px",
      width: width + "px",
      height: "20px",
      zIndex: 2,
      // border: '1px solid red',
    };

    const xScrollBarDomStyles = {
      position: "absolute",
      top: "0px",
      left: "0px",
      height: "100%",
      width: `${(width * width) / scrollWidth}px`,
      // border: '1px solid blue',
      background: "rgba(0, 0, 0, 0.16)",
      borderRadius: "5px",
      cursor: "pointer",
    };

    Object.entries(xScrollBarOuterDomStyles).map((entry) => {
      const [key, value] = entry;
      xScrollBarOuterDom.style[key] = value;
    });

    Object.entries(xScrollBarDomStyles).map((entry) => {
      const [key, value] = entry;
      xScrollBarDom.style[key] = value;
    });
    xScrollBarOuterDom.appendChild(xScrollBarDom);
    this.target?.appendChild(xScrollBarOuterDom);
    this.xScrollBarOuter = xScrollBarOuterDom;
    this.xScrollBar = xScrollBarDom;
    const _thatTarget = this.target;
    this.xMouseMoveStep = new MouseMove({
      target: this.xScrollBar,
      mouseMoveStepChange: (payload) => {
        if (!_thatTarget) return;
        const { type, changeStep } = payload;
        const { width: innerWidth } = _thatTarget.getBoundingClientRect();
        const { scrollWidth: innerScrollWidth } = _thatTarget;
        if (type === "x") {
          this.target!.scrollLeft +=
            changeStep * (innerScrollWidth / innerWidth);
        }
      },
    });
  }

  createY() {
    if (!this.target) return;
    const { height } = this.target.getBoundingClientRect();
    const { scrollHeight } = this.target;

    const yScrollBarOuterDom = document.createElement("div");
    const yScrollBarDom = document.createElement("div");

    const yScrollBarOuterDomStyles = {
      position: "absolute",
      top: "0px",
      right: "0px",
      height: height + "px",
      width: "20px",
      zIndex: 2,
      // border: '1px solid red',
    };

    const yScrollBarDomStyles = {
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "100%",
      height: `${(height * height) / scrollHeight}px`,
      // border: '1px solid blue',
      background: "rgba(0, 0, 0, 0.16)",
      borderRadius: "5px",
      cursor: "pointer",
    };

    Object.entries(yScrollBarOuterDomStyles).map((entry) => {
      const [key, value] = entry;
      yScrollBarOuterDom.style[key] = value;
    });

    Object.entries(yScrollBarDomStyles).map((entry) => {
      const [key, value] = entry;
      yScrollBarDom.style[key as any] = value;
    });
    yScrollBarOuterDom.appendChild(yScrollBarDom);
    this.target?.appendChild(yScrollBarOuterDom);
    this.yScrollBarOuter = yScrollBarOuterDom;
    this.yScrollBar = yScrollBarDom;
    const _thatTarget = this.target;
    this.yMouseMoveStep = new MouseMove({
      target: this.yScrollBar,
      mouseMoveStepChange: (payload) => {
        if (!_thatTarget) return;
        const { type, changeStep } = payload;
        const { height: innerHeight } = _thatTarget.getBoundingClientRect();
        const { scrollHeight: innerScrollHeight } = _thatTarget;
        if (type === "y") {
          this.target!.scrollTop +=
            changeStep * (innerScrollHeight / innerHeight);
        }
      },
    });
  }

  resize = () => {
    if (!this.target) return;

    const { width, height } = this.target.getBoundingClientRect();
    const { scrollHeight, scrollWidth } = this.target;

    if (this.xScrollBar && this.xScrollBarOuter) {
      this.xScrollBarOuter.style.display =
        width >= scrollWidth ? "none" : "block";
      this.xScrollBarOuter.style.width = `${width}px`;
      this.xScrollBar.style.width = `${(width * width) / scrollWidth}px`;
    }

    if (this.yScrollBar && this.yScrollBarOuter) {
      this.yScrollBarOuter.style.display =
        height >= scrollHeight ? "none" : "block";
      this.yScrollBarOuter.style.height = `${height}px`;
      this.yScrollBar.style.height = `${(height * height) / scrollHeight}px`;
    }
  };

  watch() {
    this.target?.addEventListener("scroll", this.onscroll);
  }

  onscroll = () => {
    if (!this.target) return;
    const { width, height } = this.target?.getBoundingClientRect();
    const { scrollTop, scrollLeft, scrollWidth, scrollHeight } = this.target;
    this.xScrollBar!.style.left = scrollLeft * (width / scrollWidth) + "px";
    this.yScrollBar!.style.top = scrollTop * (height / scrollHeight) + "px";
  };

  destroy() {
    this.xScrollBar?.remove();
    this.xScrollBarOuter?.remove();
    this.yScrollBar?.remove();
    this.yScrollBarOuter?.remove();
    this.targetResizeObserver?.unobserve();
  }
}
