/**
 * 鼠标定点确定当前的在grid的落点计算
 *
 * 如果滚出容器外，计算上屏幕外移动的位置
 * 容器外移动的距离 +
 * 容器开始滚动的位置到容器当前滚动的位置
 */

enum PointContainType {
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
}

const getPointContainType = (payload: {
  // t,b,l,r
  range: number[];
  // x,y
  point: number[];
}) => {
  const { range, point } = payload;
  const [x,y] = point
};

export type MouseMoveGridConfig = {
  scrollContainer?: HTMLElement;
  gridContainer?: HTMLElement;
  target?: HTMLElement;
};

class MouseMoveGrid {
  scrollContainer?: MouseMoveGridConfig["scrollContainer"];
  gridContainer?: MouseMoveGridConfig["gridContainer"];
  target?: MouseMoveGridConfig["target"];

  moving = false;

  // t,r,b,l
  range: number[] = [];

  current = [0, 0];
  lastCurrent = [0, 0];

  constructor(config: MouseMoveGridConfig) {
    const { scrollContainer, gridContainer, target } = config;
    if (scrollContainer) this.scrollContainer = scrollContainer;
    if (gridContainer) this.gridContainer = gridContainer;
    if (target) this.target = target;
    this._init();
  }

  onMovedStepCallback() {
    console.log(this.current);
    if (!(this.current && this.lastCurrent)) return;
    const [currentX, currentY] = this.current;
    const [lastCurrentX, lastCurrentY] = this.lastCurrent!;
    // x方向
    if (currentX !== lastCurrentX) {
    }
  }

  gridMousedown = (e: any) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { left, top } = this.gridContainer?.getBoundingClientRect()!;
    this.lastCurrent = [clientX - left, clientY - top];
  };

  gridMousemove = (e: MouseEvent) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { left, top } = this.gridContainer?.getBoundingClientRect()!;
    this.current = [clientX - left, clientY - top];
    this.onMovedStepCallback();
  };

  gridMouseup = (e: MouseEvent) => {
    // console.log("gridMouseup");
  };

  documentMouseup = () => {
    this.moving = false;
    if (this.gridContainer) {
      this.gridContainer.removeEventListener("mousedown", this.gridMousedown);
      this.gridContainer.removeEventListener("mousemove", this.gridMousemove);
      document.removeEventListener("mouseup", this.documentMouseup);
    }
  };

  targetMousedown = (e: any) => {
    e.preventDefault();
    this.moving = true;
    if (this.gridContainer) {
      this.gridContainer.addEventListener("mousedown", this.gridMousedown);
      this.gridContainer.addEventListener("mousemove", this.gridMousemove);
      document.addEventListener("mouseup", this.documentMouseup);
    }
  };

  _init() {
    if (this.target) {
      this.target.addEventListener("mousedown", this.targetMousedown, true);
    }
  }
}

export default MouseMoveGrid;
