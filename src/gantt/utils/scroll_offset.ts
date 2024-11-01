type ScrollOffsetConfig = {
  container?: HTMLElement;
  offsetChange?: (payload: { type: "x" | "y"; changeStep: number }) => void;
};

class ScrollOffset {
  container?: ScrollOffsetConfig["container"];
  offsetChange?: ScrollOffsetConfig["offsetChange"];

  lastCurrent = [0, 0];

  constructor(config: ScrollOffsetConfig) {
    const { container, offsetChange } = config;
    if (container) this.container = container;
    if (offsetChange) this.offsetChange = offsetChange;
    this._init();
  }

  record() {
    const distance = this.getScrollDistance();
    this.lastCurrent = distance;
  }

  scroll = () => {
    const [x, y] = this.getScrollDistance();
    const [lastX, lastY] = this.lastCurrent;
    if (x !== lastX) {
      const changeX = x - lastX;
      this.lastCurrent = [lastX + changeX, lastY];
      if (this.offsetChange) {
        this.offsetChange({
          type: "x",
          changeStep: changeX,
        });
      }
    }

    if (y !== lastY) {
      const changeY = y - lastY;
      this.lastCurrent = [lastX, lastY + changeY];
      if (this.offsetChange) {
        this.offsetChange({
          type: "y",
          changeStep: changeY,
        });
      }
    }
  };

  _init() {
    this.container?.addEventListener("scroll", this.scroll);
  }

  getScrollDistance() {
    if (!this.container) return [];
    const { scrollLeft, scrollTop } = this.container!;
    return [scrollLeft, scrollTop];
  }
}

export default ScrollOffset;
