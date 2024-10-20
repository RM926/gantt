export enum MoveDirection {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
  INNER,
  NONE,
}

const MoveScrollOverflowDefaultConfig = {
  scrollSpeed: [10, 10, 10, 10],
  scrollStep: [1, 1],
  edgeRange: [0, 0, 0, 0],
};

export type MoveScrollOverflowMoveStepChangePayload = {
  direction: MoveDirection;
  changeStep: number;
};

export type MoveScrollOverflowConfig = {
  targetElement: Element;
  scrollSpeed?: number[];
  edgeRange?: number[];
  scrollStep?: number[];
  scrollStatusChange?: (payload: { direction: MoveDirection }) => void;
  scrollStepChange?: (payload: MoveScrollOverflowMoveStepChangePayload) => void;
};

export default class MoveOverflowScroll {
  target?: MoveScrollOverflowConfig["targetElement"];
  scrollSpeed = MoveScrollOverflowDefaultConfig.scrollSpeed;
  edgeRange = MoveScrollOverflowDefaultConfig.edgeRange;
  scrollStep = MoveScrollOverflowDefaultConfig.scrollStep;

  moving = false;

  moveDirection?: MoveDirection;

  scrollMemo = [0, 0];

  position: number[] = [0, 0];

  lockScroll = false;

  scrollStatusChange: MoveScrollOverflowConfig["scrollStatusChange"];

  scrollStepChange: MoveScrollOverflowConfig["scrollStepChange"];

  constructor(payload: MoveScrollOverflowConfig) {
    const {
      targetElement,
      scrollSpeed,
      edgeRange,
      scrollStatusChange,
      scrollStepChange,
      scrollStep,
    } = payload;
    this.target = targetElement;
    if (scrollSpeed) this.scrollSpeed = scrollSpeed;
    if (edgeRange) this.edgeRange = edgeRange;
    if (scrollStatusChange) this.scrollStatusChange = scrollStatusChange;
    if (scrollStepChange) this.scrollStepChange = scrollStepChange;
    if (scrollStep) this.scrollStep = scrollStep;
    this._init();
  }

  setScrollLock(lock: boolean) {
    this.lockScroll = lock;
  }

  openScroll(direction: MoveDirection) {
    const { scrollLeft, scrollTop } = this.target!;
    // console.log([scrollLeft, scrollTop], this.scrollMemo, "this.scrollMemo");
    if (direction !== this.moveDirection) {
      this.moveDirection = direction;

      this.scrollMemo = [scrollLeft, scrollTop];

      if (this.scrollStatusChange) this.scrollStatusChange({ direction });
    }

    if (this.lockScroll) return;
    const [topSpeed, rightSpeed, bottomSpeed, leftSpeed] = this.scrollSpeed!;

    if (direction === MoveDirection.LEFT) {
      this.target!.scrollLeft -= leftSpeed;
    } else if (direction === MoveDirection.RIGHT) {
      this.target!.scrollLeft += rightSpeed;
    } else if (direction === MoveDirection.TOP) {
      this.target!.scrollTop -= topSpeed;
    } else if (direction === MoveDirection.BOTTOM) {
      this.target!.scrollTop += bottomSpeed;
    }

    const [xStep, yStep] = this.scrollStep;

    if (
      this.moveDirection === MoveDirection.RIGHT ||
      this.moveDirection === MoveDirection.LEFT
    ) {
      const [scrollLeftMemo, scrollTopMemo] = this.scrollMemo;
      const changeStep = this.judgeOverflowStep({
        begin: scrollLeftMemo,
        finish: scrollLeft,
        stepGap: xStep,
      });
      if (changeStep) {
        // console.log(scrollLeft, changeStep, xStep, this.scrollStep);
        this.scrollMemo = [scrollLeftMemo + changeStep * xStep, scrollTopMemo];
        // console.log(this.scrollMemo[0], scrollLeft, {
        //   changeStep,
        //   direction: this.moveDirection,
        // });
        this.scrollStepChange?.({
          changeStep,
          direction: this.moveDirection,
        });
      }
    }
    if (
      this.moveDirection === MoveDirection.TOP ||
      this.moveDirection === MoveDirection.BOTTOM
    ) {
      const [scrollLeftMemo, scrollTopMemo] = this.scrollMemo;
      const changeStep = this.judgeOverflowStep({
        begin: scrollTopMemo,
        finish: scrollTop,
        stepGap: yStep,
      });
      if (changeStep) {
        this.scrollMemo = [scrollLeftMemo, scrollTopMemo + changeStep * yStep];
        this.scrollStepChange?.({
          changeStep,
          direction: this.moveDirection,
        });
      }
    }
  }

  _judgeOverflowContainer() {
    if (!this.target) return;
    const { top, left, width, height } = this.target.getBoundingClientRect();
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
      const step = left + leftEdge - x;
      this.openScroll(MoveDirection.LEFT);
      // console.log("向左滚动");
    } else if (left + width - x - rightEdge < 0) {
      const step = x + rightEdge - (left + width);
      this.openScroll(MoveDirection.RIGHT);
      // console.log("向右滚动");
    } else if (top - y + topEdge > 0) {
      // console.log("向上滚动");
      const step = top - y + topEdge!;
      this.openScroll(MoveDirection.TOP);
    } else if (top + height - y - bottomEdge! < 0) {
      // console.log("向下滚动");
      const step = y + bottomEdge! - (top + height);
      this.openScroll(MoveDirection.BOTTOM);
    } else {
      const direction = MoveDirection.INNER;
      if (this.scrollStatusChange && this.moveDirection !== direction) {
        this.moveDirection = direction;
        this.scrollStatusChange({ direction });
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

  judgeOverflowStep(payload: {
    begin: number;
    finish: number;
    stepGap?: number;
  }) {
    const { begin, finish, stepGap = 1 } = payload;
    const changeStep = (finish - begin) / stepGap;
    const direction = changeStep > 0;
    return Math.abs(changeStep) >= 1
      ? direction
        ? Math.floor(changeStep)
        : Math.ceil(changeStep)
      : 0;
  }

  _init() {
    if (this.target) {
      this.target.addEventListener("mousedown", this.onmousedown);
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
    if (this.target)
      this.target.removeEventListener("mousedown", this.onmousedown);
    this.clear();
  }
}
