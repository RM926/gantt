export const offsetArray = (array: any[], offset = 0) => {
  if (offset === 0) return array;
  const sliceIndex = offset % array.length;
  return [...array.slice(-sliceIndex), ...array.slice(0, -sliceIndex)];
};

/**
 * @name convertDyadicArray 一维数组转换为二维数组
 * @param {Array} arr
 * @param {Number} row
 * @example convertDyadicArray([2,3,4,5,6,7], 3) => [[2,3],[4,5],[6,7]]
 */
export function convertDyadicArray<T>(arr: T[], row: number) {
  const dyadicArray = [] as T[][];
  const col = arr.length / row;
  for (let i = 0; i < row; i++) {
    dyadicArray.push(arr.slice(i * col, (i + 1) * col));
  }
  return dyadicArray;
}