import { Gantt } from "../..";
import {
  GanttExpanderColumnClassName,
  GanttExpanderColumnHeaderClassName,
  GanttExpanderListClassName,
} from "../../constant";
import { getRandomClass } from "../../utils/document";
import ExpanderHeader from "./header";
import ExpanderList from "./list";
import ExpanderListCell, { ExpanderListCellConfig } from "./list/cell";

export type ColumnConfig = {
  container: HTMLElement;
  gantt?: Gantt;
  enhance?: Partial<{
    header: ExpanderHeader;
    cell: ExpanderListCell;
  }>;
  header?: ExpanderHeader;
  list?: ExpanderList;

  // event
  listScrollCallback?: (e?: Event) => void;
};

class Column {
  container?: ColumnConfig["container"];
  gantt?: ColumnConfig["gantt"];
  enhance?: ColumnConfig["enhance"];

  header?: ColumnConfig["header"];
  list?: ColumnConfig["list"];
  listScrollCallback: ColumnConfig["listScrollCallback"];

  constructor(config: ColumnConfig) {
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
    const columnElement = document.createElement("div");
    const randomClass = getRandomClass(GanttExpanderColumnClassName);
    columnElement.classList.add(GanttExpanderColumnClassName, randomClass);
    const htmlString = `
        <div class='${GanttExpanderColumnHeaderClassName}'></div>
        <div class='${GanttExpanderListClassName}'></div>
    `;
    columnElement.innerHTML = htmlString;
    this.container!.appendChild(columnElement);

    const [headerElement, listElement] = [
      GanttExpanderColumnHeaderClassName,
      GanttExpanderListClassName,
    ].map((className) => {
      return document.querySelector(`.${randomClass} .${className}`);
    });
    return { headerElement, listElement };
  }

  createHeader(container: HTMLElement) {
    const h = this?.enhance?.header || ExpanderHeader;
    this.header = new (h as any)({
      container,
      gantt: this.gantt,
    });
  }

  createList(container: HTMLElement) {
    this.list = new ExpanderList({
      container,
      gantt: this.gantt,
      column: this,
      scrollCallback: this.listScrollCallback,
    });
  }

  createCell(config: ExpanderListCellConfig) {
    const c = this?.enhance?.cell || ExpanderListCell;
    return new (c as any)(config);
  }
}

export default Column;
