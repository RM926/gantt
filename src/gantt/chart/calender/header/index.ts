import Gantt from "../../../index";

export type CalenderHeaderConfig = {
  container: HTMLElement;
  gantt: Gantt;
};

class CalenderHeader {
  container?: CalenderHeaderConfig["container"];
  gantt?: CalenderHeaderConfig["gantt"];

  constructor(config: CalenderHeaderConfig) {
    const { container, gantt } = config;
    if (container) this.container = container;
    if (gantt) this.gantt = gantt;
    this.updateContainer(this);
    this.render(this);
  }

  updateContainer(it: CalenderHeader) {
    // const { height } = this.gantt?.styles?.header!;
    // this.container!.style.height = height + "px";
  }

  render(it: CalenderHeader) {
    const div = document.createElement("div");
    div.innerHTML = "label";
    this.container?.appendChild(div);
  }

  update() {}
}

export default CalenderHeader;
