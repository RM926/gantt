export const getRandomClass = (prefix: string) => {
  return `${prefix}_${Math.random().toString().split(".")[1]}`;
};

export const createElement = (type: string) => {
  return document.createElement(type);
};

export const appendChild = (father: HTMLElement, son: HTMLElement) => {
  father.appendChild(son);
};

export const appendClassName = (element: HTMLElement, classNames: string[]) => {
  element.classList.add(...classNames);
};

export const updateElementStyles = (
  element: HTMLElement,
  styles: Record<string, string | number>
) => {
  Object.entries(styles).forEach((entry) => {
    const [key, value] = entry as unknown as [number, string];
    element!.style[key] = value;
  });
};
