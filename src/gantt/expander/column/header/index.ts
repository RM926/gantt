import Gantt from "../../../index";

export type ExpanderHeaderConfig = {
  container: HTMLElement;
  gantt: Gantt;
};

class ExpanderHeader {
  container?: ExpanderHeaderConfig["container"];
  gantt?: ExpanderHeaderConfig["gantt"];

  constructor(config: ExpanderHeaderConfig) {
    const { container, gantt } = config;
    if (container) this.container = container;
    if (gantt) this.gantt = gantt;
    this.updateContainer(this);
    this.render(this);
  }

  updateContainer(it: ExpanderHeader) {
    const { height } = this.gantt?.styles?.header!;
    this.container!.style.height = height + "px";
  }

  render(it: ExpanderHeader) {
    const div = document.createElement("div");
    div.innerHTML = "label";
    this.container?.appendChild(div);
  }

  update() {}
}

export default ExpanderHeader;
