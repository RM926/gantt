import { ReturnMergeTimeline } from "./merge";

export enum ContainTypeEnum {
  NONE,
  BOTH,
  CONTAIN,
  X,
  Y,
}

export function judgeContainType(payload: {
  contain: [number, number];
  contained: [number, number];
  type: ContainTypeEnum;
}): boolean {
  const { contain, contained, type } = payload;
  const [x, y] = contain;
  const [xx, yy] = contained;
  switch (type) {
    case ContainTypeEnum.BOTH:
      // xx [x,y] yy
      return xx < x && yy > y;
    case ContainTypeEnum.CONTAIN:
      return xx >= x && xx <= y && y >= xx && y >= yy;
    case ContainTypeEnum.X:
      // xx [x,y,yy]
      return xx < x && y > x;
    case ContainTypeEnum.Y:
      // [x,xx,y] yy
      return y > xx && yy > y;
    case ContainTypeEnum.NONE:
      // [xx,yy]  [x , y] [xx,yy]
      return (xx < x && yy < x) || (y < xx && y < yy);
    default:
      return false;
  }
}

export const getContainType = (payload: {
  contain: [number, number];
  contained: [number, number];
}) => {
  const { contain, contained } = payload;
  const type = [
    ContainTypeEnum.NONE,
    ContainTypeEnum.BOTH,
    ContainTypeEnum.CONTAIN,
    ContainTypeEnum.X,
    ContainTypeEnum.Y,
  ].find((t) =>
    judgeContainType({
      contain,
      contained,
      type: t,
    })
  );
  if (typeof type === "undefined") return ContainTypeEnum.NONE;
  return type;
};

export const judgeShowInContainer = (payload: {
  mergeTimeline: ReturnMergeTimeline;
  showCellCount: [number, number];
  offsetCellCount: [number, number];
}): [boolean, ContainTypeEnum] => {
  const {
    mergeTimeline: {
      cellBeginCount,
      cellFinishCount,
      cellTopCount,
      cellBottomCount,
    },
    showCellCount: [showX, showY],
    offsetCellCount: [offsetX, offsetY],
  } = payload;

  const xContain: [number, number] = [cellBeginCount, cellFinishCount];
  const xContained: [number, number] = [offsetX, offsetX + showX];

  /** 取反 */
  const xShow = !judgeContainType({
    contain: xContain,
    contained: xContained,
    type: ContainTypeEnum.NONE,
  });

  const yShow = !judgeContainType({
    contain: [cellTopCount, cellBottomCount],
    contained: [offsetY, offsetY + showY],
    type: ContainTypeEnum.NONE,
  });

  // console.log(
  //   cellTopCount,
  //   cellBottomCount,
  //   yTop,
  //   yBottom,
  //   "cellTopCount,cellBottomCount,yTop,yBottom"
  // );
  const cellOverflowType = !xShow
    ? ContainTypeEnum.NONE
    : getContainType({ contain: xContain, contained: xContained });
  return [yShow && xShow, cellOverflowType];
};

export const judgeOverflowStep = (payload: {
  begin: number;
  finish: number;
  stepGap?: number;
}) => {
  const { begin, finish, stepGap = 1 } = payload;
  const changeStep = (finish - begin) / stepGap;
  const direction = changeStep > 0;
  return Math.abs(changeStep) >= 1
    ? direction
      ? Math.floor(changeStep)
      : Math.ceil(changeStep)
    : 0;
};
