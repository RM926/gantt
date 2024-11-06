/**
 *
 * 鼠标移动当前位置计算：
 *  mousemove 挂载在document上,
 *  ---> grid落点的位置 + document移动的距离 + grid container 容器滚动的距离
 *  = grid准确的位置
 *
 */

type MousemoveChangeParams = {
  type: "x" | "y";
  changeStep: number;
};

export enum MouseStatus {
  UP,
  DOWN,
  MOVE,
}

export type MousemoveConfig = {
  container?: HTMLElement;
  target?: HTMLElement;
  offsetRange?: boolean;
  moveStep?: number[];
  /**
   *  top bottom left right
   */
  range?: (number | undefined)[];
  moveStepChange?: (params: MousemoveChangeParams) => void;
  mouseStatusChange?: (status: MouseStatus) => void;
};

class Mousemove {
  container?: MousemoveConfig["container"];
  target?: MousemoveConfig["target"];

  moveStepChange?: MousemoveConfig["moveStepChange"];
  mouseStatusChange?: MousemoveConfig["mouseStatusChange"];

  moving = false;
  moveStep = [1, 1];

  documentBegin: number[] = [];
  containerBegin: number[] = [];

  // t,b,l,r
  range: MousemoveConfig["range"] = [];

  // top,bottom,left,bottom 落点距离边缘的距离
  offsetRange: number[] | boolean = false;

  current = [0, 0];

  // 行列
  matrix = [0, 0];
  lastMatrix = [0, 0];

  constructor(config: MousemoveConfig) {
    this.updateConfig(config);
    this._init();
  }

  updateConfig(config: MousemoveConfig) {
    const {
      container,
      target,
      offsetRange,
      moveStep,
      range,
      moveStepChange,
      mouseStatusChange,
    } = config;
    if (container) this.container = container;
    if (target) this.target = target;
    if (typeof offsetRange === "boolean") this.offsetRange = offsetRange;
    if (moveStep) this.moveStep = moveStep;
    if (range) this.range = range;
    if (moveStepChange) {
      this.moveStepChange = moveStepChange;
    }
    if (mouseStatusChange) {
      this.mouseStatusChange = mouseStatusChange;
    }
  }

  onMovedStepCallback() {
    if (!(this.lastMatrix && this.matrix)) return;
    const [matrixX, matrixY] = this.matrix;
    const [lastMatrixX, lastMatrixY] = this.lastMatrix;

    const [moveStepX, moveStepY] = this.moveStep;

    // x方向  // range 在上层处理
    if (matrixX !== lastMatrixX && typeof moveStepX !== "undefined") {
      const changeMatrixX = matrixX - lastMatrixX;
      this.lastMatrix = [lastMatrixX + changeMatrixX, lastMatrixY];
      const payload = {
        type: "x" as MousemoveChangeParams["type"],
        changeStep: changeMatrixX,
      };
      if (this.moveStepChange) {
        this.moveStepChange(payload);
      }
      // console.log("x", payload);
    }

    if (matrixY !== lastMatrixY && typeof moveStepY !== "undefined") {
      const changeMatrixY = matrixY - lastMatrixY;
      this.lastMatrix = [matrixX, lastMatrixY + changeMatrixY];
      const payload = {
        type: "y" as MousemoveChangeParams["type"],
        changeStep: changeMatrixY,
      };
      if (this.moveStepChange) {
        this.moveStepChange(payload);
      }
      // console.log("y", payload);
    }
  }

  containerMousedown = (e: any) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { left, top } = this.container?.getBoundingClientRect()!;

    this.containerBegin = [clientX - left, clientY - top];
  };

  documentMousedown = (e: MouseEvent) => {
    e.preventDefault();
    const { x, y } = e;
    this.documentBegin = [x, y];
    const [cbx, cby] = this.containerBegin;
    this.current = [cbx, cby];

    // 设置target offsetRange
    if (this.offsetRange) {
      const { top, left, height, width } =
        this.target?.getBoundingClientRect()!;
      const [targetPositionX, targetPositionY] = [x - left, y - top];
      this.offsetRange = [
        targetPositionY,
        height - targetPositionY,
        targetPositionX,
        width - targetPositionX,
      ];
    }
    const currentMatrix = this.getCurrentMatrix();
    this.lastMatrix = currentMatrix;
  };

  documentMousemove = (e: MouseEvent) => {
    if (this.mouseStatusChange) {
      this.mouseStatusChange(MouseStatus.MOVE);
    }
    const { x, y } = e;
    const [dbx, dby] = this.documentBegin;
    const [cbx, cby] = this.containerBegin;
    this.current = [cbx + (x - dbx), cby + (y - dby)];
    this.matrix = this.getCurrentMatrix();
    this.onMovedStepCallback();
  };

  documentMouseup = () => {
    this.moving = false;
    if (this.mouseStatusChange) {
      this.mouseStatusChange(MouseStatus.UP);
    }
    if (this.container) {
      this.container.removeEventListener("mousedown", this.containerMousedown);
      document.removeEventListener("mousemove", this.documentMousemove);
      document.removeEventListener("mouseup", this.documentMouseup);
    }
  };

  targetMousedown = (e: any) => {
    e.preventDefault();
    this.moving = true;
    if (this.mouseStatusChange) {
      this.mouseStatusChange(MouseStatus.DOWN);
    }

    if (this.container) {
      this.container.addEventListener("mousedown", this.containerMousedown);
      document.addEventListener("mousemove", this.documentMousemove);
      document.addEventListener("mouseup", this.documentMouseup);
    }
  };

  _init() {
    if (this.target) {
      this.target.addEventListener("mousedown", this.targetMousedown, true);
      document.addEventListener("mousedown", this.documentMousedown);
    }
  }

  getRangeValue(range: (number | undefined)[], value: number) {
    const [x, x1] = range;
    if (typeof x !== "undefined" && value <= x) return x;
    if (typeof x1 !== "undefined" && value >= x1) return x1;
    return value;
  }

  getCurrentMatrix() {
    const [moveStepX, moveStepY] = this.moveStep;
    const [currentX, currentY] = this.current;
    const [tr, br, lr, rr] = this.range!;
    const [otr, obr, olr, orr] = (
      this.offsetRange ? this.offsetRange : [0, 0, 0, 0]
    ) as number[];

    const l = typeof lr !== "undefined" ? lr + olr : lr;
    const r = typeof rr !== "undefined" ? rr - orr : rr;
    const t = typeof tr !== "undefined" ? tr + otr : tr;
    const b = typeof br !== "undefined" ? br - obr : br;

    const idealCurrentX = this.getRangeValue([l, r], currentX);
    const idealCurrentY = this.getRangeValue([t, b], currentY);
    // console.log(
    //   "idealCurrentX",
    //   [l, r],
    //   currentX,
    //   idealCurrentX
    // );

    return [
      Math.floor(idealCurrentX / moveStepX),
      Math.floor(idealCurrentY / moveStepY),
    ];
  }
}

export default Mousemove;
