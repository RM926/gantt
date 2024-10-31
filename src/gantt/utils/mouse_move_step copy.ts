import { MouseEventHandler } from "react";

/**
 * 以当前target_row的位置为准，计算边缘
 */

export type MoveStepCallbackPayload = {
  type: "x" | "y";
  changeStep: number;
  totalStep: number;
};

const MouseMoveStepDefaultConfig = {
  stepOffsetRate: [1, 1],
  moveStep: [1, 1],
};

export type MouseMoveStepConfig = {
  targetElement?: Element;
  moveStep?: number[];
  // 移动多少算一格子
  stepOffsetRate?: number[];

  moveStepCallback?: (payload: MoveStepCallbackPayload) => void;
  /** 移动的状态变化回调 */
  moveStatusChange?: (moving: boolean) => void;
};

class MouseMoveStep {
  moveStep?: number[];
  stepOffsetRate?: number[];

  // offset?: number[];

  down = false;
  moving = false;

  target: MouseMoveStepConfig["targetElement"] = undefined;
  /** TODO 拖拽时产生的元素 */
  drag: MouseMoveStepConfig["targetElement"] = undefined;

  begin?: number[];
  // 当前的坐标值
  current?: number[];

  // 超出限制后,
  range?: number[];

  // 之前的坐标值
  lastCurrent?: number[];

  // 当每一步产生变化的时候记录的坐标值
  lastStepCurrent?: number[];

  moveStepCallback?: MouseMoveStepConfig["moveStepCallback"];
  moveStatusChange?: MouseMoveStepConfig["moveStatusChange"];

  constructor(config: MouseMoveStepConfig) {
    const {
      targetElement,
      moveStep,
      stepOffsetRate,
      moveStepCallback,
      moveStatusChange,
    } = config;

    this.target = targetElement;
    this.moveStep = moveStep || MouseMoveStepDefaultConfig["moveStep"];
    this.stepOffsetRate =
      stepOffsetRate || MouseMoveStepDefaultConfig["stepOffsetRate"];

    this.moveStepCallback = moveStepCallback;
    this.moveStatusChange = moveStatusChange;
    this._init();
  }

  setRange() {}

  _onMovedStepCallback() {
    const [stepOffsetRateX, stepOffsetRateY] = this.stepOffsetRate!;
    const [moveStepX, moveStepY] = this.moveStep!;

    if (!(this.current && this.begin && this.lastCurrent)) return;

    const [currentX, currentY] = this.current;
    const [lastCurrentX, lastCurrentY] = this.lastCurrent!;

    const [beginX, beginY] = this.begin;

    // x方向
    if (currentX !== lastCurrentX) {
      const [lastStepCurrentX, lastStepCurrentY] = this.lastStepCurrent!;

      // 偏移忽略计算
      const offsetRate =
        (currentX - lastCurrentX > 0 ? 1 : -1) * (1 - stepOffsetRateX);

      const stepX =
        (currentX - lastStepCurrentX + offsetRate * moveStepX) / moveStepX;

      // console.log(
      //   lastCurrentX,
      //   currentX,
      //   lastStepCurrentX,
      //   "lastCurrentX, currentX,lastStepCurrentX",
      //   stepX
      // );
      if (Math.abs(stepX) >= 1) {
        // Math.floor(-1.02) === -2
        // 需要判断正负数，向下向上取整
        const intStep = stepX > 0 ? Math.floor(stepX) : Math.ceil(stepX);

        const newLastStepCurrent = lastStepCurrentX + intStep * moveStepX;
        this.lastStepCurrent = [newLastStepCurrent, lastStepCurrentY];
        const payload: MoveStepCallbackPayload = {
          type: "x",
          changeStep: intStep,
          totalStep: (newLastStepCurrent - beginX) / moveStepX,
        };

        // console.log(payload, "payloadX");
        if (this.moveStepCallback) this.moveStepCallback(payload);
      }
    }

    // y方向
    if (currentY !== lastCurrentY) {
      const [lastStepCurrentX, lastStepCurrentY] = this.lastStepCurrent!;

      // 偏移忽略计算
      const offsetRate =
        (currentY - lastCurrentY > 0 ? 1 : -1) * (1 - stepOffsetRateY);

      const stepY =
        (currentY - lastStepCurrentY + offsetRate * moveStepY) / moveStepY;

      if (Math.abs(stepY) >= 1) {
        const intStep = stepY > 0 ? Math.floor(stepY) : Math.ceil(stepY);

        const newLastStepCurrentY = lastStepCurrentY + intStep * moveStepY;
        this.lastStepCurrent = [lastStepCurrentX, newLastStepCurrentY];

        const payload: MoveStepCallbackPayload = {
          type: "y",
          changeStep: intStep,
          totalStep: (newLastStepCurrentY - beginY) / moveStepY,
        };

        // console.log(payload, "payloadY");
        if (this.moveStepCallback) this.moveStepCallback(payload);
      }
    }
  }

  _init() {
    if (this.target) {
      this.target.addEventListener("mousedown", this.onmousedown, true);
    }
  }

  _initDrag() {
    document.addEventListener("mousemove", this.onmousemove, true);
    document.addEventListener("mouseup", this.onmouseup, true);
  }

  cloneElement = () => {
    this._initDrag();
    if (this.target) {
      // todo_solve bug mousedown事件没有阻止默认行为 e.preventDefault();
      // 这里如果把this.drag append 到body上，第二次拖拽不动 不是这个问题
      // 如果append的位置是this.target 相同的位置，第二次拖拽不动
      const { width, height } = this.target.getBoundingClientRect();
      const { offsetTop, offsetLeft, clientWidth, clientHeight } = this.target;
      console.log(this.target.getBoundingClientRect());
      const [left, top] = this.current!;
      console.dir(this.target, offsetTop, offsetLeft);

      const d = document.createElement("div");
      d.style.border = "1px solid red";
      d.style.position = "absolute";

      Object.entries({
        width,
        height,
        top,
        left,
      }).forEach((entry) => {
        const [key, value] = entry;
        d.style[key as unknown as number] = `${value}px`;
      });
      this.drag = d;
      document.body.appendChild(d);
    }
  };

  onmousedown = (e: any) => {
    // console.log("down");
    e.preventDefault();
    this.moving = true;

    const { pageX: x, pageY: y } = e;
    // console.log(x, y, e);

    const p = [x, y];
    this.begin = p;
    this.current = p;

    this.lastStepCurrent = this.current;

    this.cloneElement();
    if (this.moveStatusChange) this.moveStatusChange(this.moving);
  };

  onmousemove = (e: MouseEvent) => {
    // console.log(e);
    // e.preventDefault();
    if (this.moving) {
      const { pageX: x, pageY: y } = e;
      this.lastCurrent = this.current;
      const p = [x, y];
      this.current = p;
      this._onMovedStepCallback();
    }
  };

  onmouseup = (e: MouseEvent) => {
    // console.log("up");
    this.clear();
    if (this.moveStatusChange) this.moveStatusChange(this.moving);
  };

  clear() {
    /** code tip:
     *  1.通过document.removeEventListener("mousemove", this.onmousemove.bind(this))，来指正this指向,此时会生成一个新的函数,在清除事件绑定的时候无法成功
     * 2.利用箭头函数this指向就近作用域，即当前class, 所以事件的处理函数可以写成 onmousemove = () => {}
     * 3. 如果不写成箭头函数，为了得到单一的函数地址，如下 _onmousemove(){ this.onmousemove().bind(this)},此时内层函数的this是指向document
     */
    document.removeEventListener("mousemove", this.onmousemove, true);
    document.removeEventListener("mouseup", this.onmouseup, true);

    this.down = false;
    this.moving = false;
    this.current = undefined;
    this.lastStepCurrent = undefined;
    this.lastCurrent = undefined;
    this.begin = undefined;

    if (this.drag) {
      this.drag.remove();
      // document.body.removeChild(this.drag);
    }
  }

  destroyed() {
    this.clear();
    this.moveStepCallback = undefined;
    this.moveStatusChange = undefined;
    if (this.target) {
      this.target.removeEventListener("mousedown", this.onmousedown, true);
    }
  }
}

export default MouseMoveStep;
