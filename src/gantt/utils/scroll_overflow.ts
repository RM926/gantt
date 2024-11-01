export enum MoveDirection {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
  INNER,
  NONE,
}

const ScrollOverflowDefaultConfig = {
  scrollSpeed: [10, 10, 10, 10],
  edgeRange: [0, 0, 0, 0],
};

export type ScrollOverflowConfig = {
  container: Element;
  scrollSpeed?: number[];
  edgeRange?: number[];
  scrollStep?: number[];
  overflowStatusChange?: (payload: { direction: MoveDirection }) => void;
};

export default class ScrollOverflow {
  container?: ScrollOverflowConfig["container"];
  scrollSpeed = ScrollOverflowDefaultConfig.scrollSpeed;
  edgeRange = ScrollOverflowDefaultConfig.edgeRange;

  moving = false;

  moveDirection?: MoveDirection;

  scrollMemo = [0, 0];

  position: number[] = [0, 0];

  lockScroll = false;

  overflowStatusChange: ScrollOverflowConfig["overflowStatusChange"];

  constructor(payload: ScrollOverflowConfig) {
    const { container, scrollSpeed, edgeRange, overflowStatusChange } = payload;
    this.container = container;
    if (scrollSpeed) this.scrollSpeed = scrollSpeed;
    if (edgeRange) this.edgeRange = edgeRange;
    if (overflowStatusChange) this.overflowStatusChange = overflowStatusChange;

    this._init();
  }

  setScrollLock(lock: boolean) {
    this.lockScroll = lock;
  }

  openScroll(direction: MoveDirection) {
    const { scrollLeft, scrollTop } = this.container!;
    if (direction !== this.moveDirection) {
      this.moveDirection = direction;

      this.scrollMemo = [scrollLeft, scrollTop];

      if (this.overflowStatusChange) this.overflowStatusChange({ direction });
    }

    if (this.lockScroll) return;
    const [topSpeed, rightSpeed, bottomSpeed, leftSpeed] = this.scrollSpeed!;

    if (direction === MoveDirection.LEFT) {
      this.container!.scrollLeft -= leftSpeed;
    } else if (direction === MoveDirection.RIGHT) {
      this.container!.scrollLeft += rightSpeed;
    } else if (direction === MoveDirection.TOP) {
      this.container!.scrollTop -= topSpeed;
    } else if (direction === MoveDirection.BOTTOM) {
      this.container!.scrollTop += bottomSpeed;
    }
  }

  _judgeOverflowContainer() {
    if (!this.container) return;
    const { top, left, width, height } = this.container.getBoundingClientRect();
    const [x, y] = this.position;

    // console.log(
    //   x,
    //   y,
    //   top,
    //   left,
    //   width,
    //   height,
    //   "x, y, top, left, width, height"
    // );

    // 向左滚动 left > x
    // 向右滚动 left + width < x
    // 向上滚动 top > y
    // 向下滚动 top + height < y
    const [topEdge, rightEdge, bottomEdge, leftEdge] = this.edgeRange!;

    if (left + leftEdge! - x > 0) {
      // left -x > range
      // console.log(left, this.edgeRange, x);

      this.openScroll(MoveDirection.LEFT);
      // console.log("向左滚动");
    } else if (left + width - x - rightEdge < 0) {
      this.openScroll(MoveDirection.RIGHT);
      // console.log("向右滚动");
    } else if (top - y + topEdge > 0) {
      // console.log("向上滚动");

      this.openScroll(MoveDirection.TOP);
    } else if (top + height - y - bottomEdge! < 0) {
      // console.log("向下滚动");
      this.openScroll(MoveDirection.BOTTOM);
    } else {
      const direction = MoveDirection.INNER;
      if (this.overflowStatusChange && this.moveDirection !== direction) {
        this.moveDirection = direction;
        this.overflowStatusChange({ direction });
      }

      // console.log("inner");
    }
  }

  onmousedown = (e: Event) => {
    // console.log("down");
    this._register();
    e.preventDefault();
    this.moving = true;
  };

  onmousemove = (e: MouseEvent) => {
    // console.log("move");
    if (this.moving) {
      const { x, y } = e;
      this.position = [x, y];
      this._judgeOverflowContainer();
    }
  };

  onmouseup = (e: Event) => {
    // console.log("up");
    this.moving = false;
    this.clear();
  };

  _init() {
    if (this.container) {
      this.container.addEventListener("mousedown", this.onmousedown);
    }
  }

  _register() {
    document.addEventListener("mousemove", this.onmousemove);
    document.addEventListener("mouseup", this.onmouseup);
  }

  clear() {
    this.moving = false;
    this.moveDirection = MoveDirection.NONE;
    this.position = [0, 0];
    document.removeEventListener("mousemove", this.onmousemove);
    document.removeEventListener("mouseup", this.onmouseup);
  }

  destroy() {
    if (this.container)
      this.container.removeEventListener("mousedown", this.onmousedown);
    this.clear();
  }
}
