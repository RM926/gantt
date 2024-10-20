class ResizeObserverDom {
  private observerObject: ResizeObserver | undefined;

  private observerDom: HTMLElement | null = null;

  private _observerSize:
    | ((payload: { width: number; height: number }) => void)
    | undefined;

  constructor(observerDom: HTMLElement) {
    this.observerDom = observerDom;
    this.init();
  }

  private init() {
    this.observerObject = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          // Firefox implements `contentBoxSize` as a single content rect, rather than an array
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;
          if (this._observerSize)
            this._observerSize({
              width: contentBoxSize.inlineSize,
              height: contentBoxSize.blockSize,
            });
        } else {
          if (this._observerSize)
            this._observerSize({
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            });
        }
      }
    });
    this.observer();
  }

  observerSize(callback: (payload: { width: number; height: number }) => void) {
    this._observerSize = callback;
  }

  private observer() {
    if (this.observerDom) {
      this.observerObject?.observe(this?.observerDom);
    }
  }

  unobserve() {
    if (this.observerDom) {
      this.observerObject?.unobserve(this.observerDom);
      this.observerDom = null;
      this._observerSize = undefined;
    }
  }
}

export default ResizeObserverDom;
