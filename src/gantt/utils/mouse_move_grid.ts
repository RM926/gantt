/**
 * 鼠标定点确定当前的在grid的落点计算
 *
 * 如果滚出容器外，计算上屏幕外移动的位置
 * 容器外移动的距离 +
 * 容器开始滚动的位置到容器当前滚动的位置
 *
 *
 * 第二方案：
 * 鼠标定点计算当前的grid落点 ---> 同步到document中，拖拽移动距离来计算网格位置
 *                               + 滚动计算
 *  document滚动距离 + 滚动的距离 + grid落点 = 即为当前的落点
 *  move事件挂载到document上
 *
 * row: [100,200,300,400];
 * col: [50,100,150,200];
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
  const [x, y] = point;
};
/**
 *
 * 99  |   101
 *    100
 *
 * 101 % 50 === 2 ...1
 * 100 % 50 === 2
 * 99 % 50 === 1  - 1    ---> 99
 */

export type MouseMoveGridConfig = {
  scrollContainer?: HTMLElement;
  gridContainer?: HTMLElement;
  target?: HTMLElement;
  moveStep?: number[];
};

class MouseMoveGrid {
  scrollContainer?: MouseMoveGridConfig["scrollContainer"];
  gridContainer?: MouseMoveGridConfig["gridContainer"];
  target?: MouseMoveGridConfig["target"];

  moving = false;
  moveStep = [60, 60];

  documentBegin: number[] = [];
  gridBegin: number[] = [];

  range: number[] = [];
  current = [0, 0];

  // 行列
  matrix = [0, 0];
  lastMatrix = [0, 0];

  constructor(config: MouseMoveGridConfig) {
    const { scrollContainer, gridContainer, target } = config;
    if (scrollContainer) this.scrollContainer = scrollContainer;
    if (gridContainer) this.gridContainer = gridContainer;
    if (target) this.target = target;
    this._init();
  }

  onMovedStepCallback() {
    console.log(this.current, this.matrix);
    if (!(this.lastMatrix && this.matrix)) return;
    const [matrixX, matrixY] = this.matrix;
    const [lastMatrixX, lastMatrixY] = this.lastMatrix;

    // x方向  // todo range
    if (matrixX !== lastMatrixX) {
      const changeMatrixX = matrixX - lastMatrixX;
      this.lastMatrix = [lastMatrixX + changeMatrixX, lastMatrixY];
      const payload = {
        type: "x",
        changeStep: changeMatrixX,
      };
      console.log("x", payload);
    }
  }

  gridMousedown = (e: any) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { left, top } = this.gridContainer?.getBoundingClientRect()!;
    this.gridBegin = [clientX - left, clientY - top];
  };

  documentMousedown = (e: MouseEvent) => {
    e.preventDefault();
    const { x, y } = e;
    this.documentBegin = [x, y];
    const [gbx, gby] = this.gridBegin;
    this.current = [gbx, gby];
    this.matrix = this.getCurrentMatrix();
  };

  documentMousemove = (e: MouseEvent) => {
    const { x, y } = e;
    const [dbx, dby] = this.documentBegin;
    const [gbx, gby] = this.gridBegin;
    this.current = [gbx + (x - dbx), gby + (y - dby)];
    this.matrix = this.getCurrentMatrix();
    this.onMovedStepCallback();
  };

  documentMouseup = () => {
    this.moving = false;
    if (this.gridContainer) {
      this.gridContainer.removeEventListener("mousedown", this.gridMousedown);
      document.removeEventListener("mousemove", this.documentMousemove);
      document.removeEventListener("mouseup", this.documentMouseup);
    }
  };

  targetMousedown = (e: any) => {
    e.preventDefault();
    this.moving = true;
    if (this.gridContainer) {
      this.gridContainer.addEventListener("mousedown", this.gridMousedown);
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

  getCurrentMatrix() {
    const [moveStepX, moveStepY] = this.moveStep;
    const [currentX, currentY] = this.current;

    return [Math.floor(currentX / moveStepX), Math.floor(currentY / moveStepY)];
  }
}

export default MouseMoveGrid;
