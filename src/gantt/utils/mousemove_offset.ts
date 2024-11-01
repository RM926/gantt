import Mousemove, { MousemoveConfig, MouseStatus } from "./mousemove";
import ScrollOffset from "./scroll_offset";

class MousemoveOffset {
  scrollOffset?: ScrollOffset;
  mousemove?: Mousemove;
  config?: MousemoveConfig;

  constructor(config: MousemoveConfig) {
    this.config = config;
    this._init();
  }

  _init() {
    const { container, mouseStatusChange, ...other } = this.config!;
    const _that = this;
    this.mousemove = new Mousemove({
      ...other,
      container,
      mouseStatusChange: (status) => {
        mouseStatusChange?.(status);
        if (status === MouseStatus.DOWN) {
          if (!_that.scrollOffset) {
            _that.scrollOffset = new ScrollOffset({
              container,
              offsetChange: ({ type, changeStep }) => {
                if (_that.mousemove?.moving) {
                  const [bx, by] = _that.mousemove.containerBegin;

                  if (type === "x") {
                    _that.mousemove.containerBegin = [bx + changeStep, by];
                  }

                  if (type === "y") {
                    _that.mousemove.containerBegin = [bx, by + changeStep];
                  }
                }
              },
            });
          }

          _that.scrollOffset.record();
        }
      },
    });
  }
}

export default MousemoveOffset;
