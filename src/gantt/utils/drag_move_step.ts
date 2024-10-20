// drag方法有兼容性，drag事件最后的位置信息为0

export type DragStepCallbackPayload = {
  type: "x" | "y";
  changeStep: number;
  totalStep: number;
};

const DragMoveStepDefault = {
  stepOffsetRate: [1, 1],
  moveStep: [1, 1],
};

export type DragMoveStepConfig = {
  targetElement?: Element | Document;
  moveStep?: number[];

  stepOffsetRate?: number[];

  dragStepCallback?: (payload: DragStepCallbackPayload) => void;
  dragStartCallback?: (e: Event) => void;
  dragCallback?: () => void;
  dragEndCallback?: () => void;
};

class DragMoveStep {
  moveStep?: number[];
  stepOffsetRate?: number[];

  down = false;
  moving = false;
  target: Element | Document | undefined = undefined;

  begin?: number[];
  current?: number[];

  lastCurrent?: number[];
  lastStepCurrent?: number[];

  dragStepCallback?: DragMoveStepConfig["dragStepCallback"];

  dragStartCallback?: DragMoveStepConfig["dragStartCallback"];
  dragCallback?: DragMoveStepConfig["dragCallback"];
  dragEndCallback?: DragMoveStepConfig["dragEndCallback"];

  constructor(config: DragMoveStepConfig) {
    const {
      targetElement,
      moveStep,
      dragStepCallback,
      dragStartCallback,
      dragCallback,
      stepOffsetRate,
    } = config;

    this.target = targetElement;
    this.moveStep = moveStep || DragMoveStepDefault.moveStep;
    this.stepOffsetRate = stepOffsetRate || DragMoveStepDefault.stepOffsetRate;
    this.dragStepCallback = dragStepCallback;
    this.dragStartCallback = dragStartCallback;
    this.dragCallback = dragCallback;
    this._init();
  }

  _ondragStepCallback() {
    const [stepOffsetRateX, stepOffsetRateY] = this.stepOffsetRate!;
    const [moveStepX, moveStepY] = this.moveStep!;

    if (!(this.current && this.begin && this.lastStepCurrent)) return;

    const [currentX, currentY] = this.current;
    const [lastCurrentX, lastCurrentY] = this.lastCurrent!;

    const [lastStepCurrentX, lastStepCurrentY] = this.lastStepCurrent;
    const [beginX, beginY] = this.begin;

    const [directionX, directionY] = [
      currentX - lastCurrentX,
      currentY - lastCurrentY,
    ];

    const stepY = (currentY - lastStepCurrentY) / moveStepY;

    if (currentX !== lastCurrentX) {
      // TODO 待优化
      const offsetRateX =
        currentX - lastCurrentX > 0
          ? -(1 - stepOffsetRateX)
          : 1 - stepOffsetRateX;
      const stepX =
        (currentX - (lastStepCurrentX + moveStepX * offsetRateX)) / moveStepX;
      if (Math.abs(stepX) >= 1) {
        const intStep = stepX > 0 ? 1 : -1;

        this.lastStepCurrent = [
          lastStepCurrentX + intStep * moveStepX,
          lastStepCurrentY,
        ];

        const [newLastStepCurrentX] = this.lastStepCurrent;
        // console.log(
        //   lastStepCurrentX,
        //   newLastStepCurrentX,
        //   (newLastStepCurrentX - beginX) / moveStepX
        // );

        const payload: DragStepCallbackPayload = {
          type: "x",
          changeStep: intStep,
          totalStep: (newLastStepCurrentX - beginX) / moveStepX,
        };

        console.log(payload, "payloadX");
        if (this.dragStepCallback) this.dragStepCallback(payload);
      }
    }

    // if (Math.abs(stepY) > stepOffsetRateY) {
    //   const intStep = stepY > 0 ? 1 : -1;

    //   this.lastStepCurrent = [
    //     lastStepCurrentX,
    //     lastStepCurrentY + intStep * moveStepY,
    //   ];

    //   const [, newLastStepCurrentY] = this.lastStepCurrent;
    //   const payload: DragStepCallbackPayload = {
    //     type: "y",
    //     changeStep: intStep,
    //     totalStep: (newLastStepCurrentY - beginY) / moveStepY,
    //   };
    //   console.log(payload, "payloadY");
    //   if (this.dragStepCallback) this.dragStepCallback(payload);
    // }
  }

  _init() {
    if (this.target) {
      this.target.draggable = true;
      this.target.addEventListener("dragstart", this.ondragstart.bind(this));
      this.target.addEventListener("drag", this.ondrag.bind(this));
      this.target.addEventListener("dragend", this.ondragend.bind(this));
      this.target.addEventListener(
        "dragover",
        (e) => {
          e.preventDefault();
        },
        false
      );
    }
  }

  ondragstart(e: Event) {
    this.down = true;
    const { x, y } = e;
    const p = [x, y];
    this.begin = p;
    this.current = p;
    this.lastCurrent = p;
    this.lastStepCurrent = p;
    if (this.dragStartCallback) this.dragStartCallback(e);
  }

  ondrag(e: Event) {
    // console.log(e, "drag");
    // return;
    e.preventDefault();
    this.moving = true;
    this.lastCurrent = this.current;
    const { x, y } = e;

    const p = [x, y];
    this.current = p;

    // if (x !== lastCurrentX) {
    //   if (x - lastCurrentX > 0) {
    //     // console.log("right", x, lastCurrentX, "x, lastCurrentX");
    //     console.log("right");
    //   } else {
    //     // console.log("left", x, lastCurrentX, "x, lastCurrentX");
    //     console.log("left");
    //   }
    // }
    // return;

    this._ondragStepCallback();
    if (this.dragCallback) this.dragCallback();
  }

  ondragend(e: Event) {
    console.log("up", e);
    if (this.dragEndCallback) this.dragEndCallback();
    // this.clear();
  }

  ondragover(e: Event) {
    e.preventDefault();
  }

  clear() {
    this.down = false;
    this.moving = false;
    this.current = undefined;
    this.lastStepCurrent = undefined;
    this.begin = undefined;
  }

  destroyed() {
    this.clear();
    if (this.target) {
      this.target.removeEventListener("dragstart", this.ondragstart.bind(this));
      this.target.removeEventListener("drag", this.ondrag.bind(this));
      this.target.removeEventListener("dragend", this.ondragend.bind(this));
      this.target.removeEventListener("dragover", this.ondragend.bind(this));
    }
  }
}

export default DragMoveStep;
