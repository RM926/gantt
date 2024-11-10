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

export const getIntersectRange = (
  line1: [number, number],
  line2: [number, number]
) => {
  const [line1L, line1R] = line1;
  const [line2L, line2R] = line2;
  const L1 = line1L <= line1R ? line1 : [line1R, line1L];
  const L2 = line2L <= line2R ? line2 : [line2R, line2L];
  if (
    !(
      judgeContainType({
        contain: line1,
        contained: line2,
        type: ContainTypeEnum.NONE,
      }) &&
      judgeContainType({
        contain: line2,
        contained: line1,
        type: ContainTypeEnum.NONE,
      })
    )
  ) {
    const [l1L, l1R] = L1;
    const [l2L, l2R] = L2;
    return [Math.max(l1L, l2L), Math.min(l1R, l2R)] as [number, number];
  }
};
