import { Gantt } from "../..";
import {
  GanttCalendarClassName,
  GanttCalenderHeaderClassName,
  GanttCalenderListClassName,
} from "../../constant";
import { getRandomClass } from "../../utils/document";
import CalenderHeader from "./header";
import CalenderList from "./list";
import CalenderListCell, { type CalenderListCellConfig } from "./list/cell";

type CalenderConfig = {
  container: HTMLElement;
  gantt?: Gantt;
  enhance?: Partial<{
    header: CalenderHeader;
    cell: CalenderListCell;
  }>;
  header?: CalenderHeader;
  list?: CalenderList;

  // event
  listScrollCallback?: (e?: Event) => void;
};

class Calender {
  container?: CalenderConfig["container"];
  gantt?: CalenderConfig["gantt"];
  enhance?: CalenderConfig["enhance"];

  header?: CalenderConfig["header"];
  list?: CalenderConfig["list"];

  listScrollCallback: CalenderConfig["listScrollCallback"];

  constructor(config: CalenderConfig) {
    const { container, gantt, enhance, listScrollCallback } = config;
    if (container) this.container = container;
    if (gantt) this.gantt = gantt;
    if (enhance) this.enhance = enhance;
    if (listScrollCallback) this.listScrollCallback = listScrollCallback;
    const { headerElement, listElement } = this.draw();
    this.createHeader(headerElement as HTMLElement);
    this.createList(listElement as HTMLElement);
  }

  draw() {
    const htmlString = `
        <div class='${GanttCalenderHeaderClassName}'></div>
        <div class='${GanttCalenderListClassName}'></div>
    `;
    const randomClass = getRandomClass(GanttCalendarClassName);
    if (this.container) {
      this.container.classList.add(randomClass);
      this.container.style.height = `${this.gantt?.styles?.header?.height}px`;
    }

    this.container!.innerHTML = htmlString;

    const [headerElement, listElement] = [
      GanttCalenderHeaderClassName,
      GanttCalenderListClassName,
    ].map((className) => {
      return document.querySelector(`.${randomClass} .${className}`);
    });
    return { headerElement, listElement };
  }

  createHeader(container: HTMLElement) {
    const h = this?.enhance?.header || CalenderHeader;
    this.header = new (h as any)({
      container,
      gantt: this.gantt,
    });
  }

  createList(container: HTMLElement) {
    this.list = new CalenderList({
      container,
      gantt: this.gantt,
      calender: this,
      scrollCallback: this.listScrollCallback,
    });
  }

  createCell(config: CalenderListCellConfig): CalenderListCell {
    const c = this?.enhance?.cell || CalenderListCell;
    return new (c as any)(config);
  }

  update() {
    this.list?.update();
    this.header?.update();
  }
}

export default Calender;
