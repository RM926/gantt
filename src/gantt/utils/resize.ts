import ResizeObserverDom from "./resize-observer-dom";

class Resize {
  resizeObserverDom?: ResizeObserverDom;
  constructor(config: { container: HTMLElement }) {
    const { container } = config;
    this.resizeObserverDom = new ResizeObserverDom(container);
    this.resizeObserverDom.observerSize = () => {
      
    };
  }
}

export default Resize;
