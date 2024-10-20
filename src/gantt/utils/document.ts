export const getRandomClass = (prefix: string) => {
  return `${prefix}_${Math.random().toString().split(".")[1]}`;
};
