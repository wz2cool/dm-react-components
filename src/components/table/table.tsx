import * as React from "react";
import { Sort } from "./model/Sort";
import { Direction } from "./model/direction";
import { getView } from "./view";
import "./style.css";

interface ColumnDef<T> {
  field: keyof T;
  displayName?: string;
  title?: any;
  headerTemplate?: any;
  cellTemplate?: any;
  width?: number;
  minWidth?: number;
  enableSorting?: boolean;
}

export interface TableOptions<T> {
  rowHeight: number;
  columnDefs: ColumnDef<T>[];
  data: T[];
}

export interface TableProps {
  options: TableOptions<any>;
  sortChanged?: (sorts: Sort[]) => void;
  isLoading?: boolean;
}

interface MyColumnDef<T> extends ColumnDef<T> {
  resizedWidth?: number;
}

interface TableState {
  selected: any;
  resizer: any;
  sorts: Sort[];
  columnDefs: MyColumnDef<any>[];
  data: any[];
}

function getScrollBarSize() {
  const scrollDiv = document.createElement("div");
  scrollDiv.style.width = "100px";
  scrollDiv.style.height = "100px";
  scrollDiv.style.overflow = "scroll";
  scrollDiv.style.position = "absolute";
  scrollDiv.style.top = "-999999px";
  document.body.appendChild(scrollDiv);

  // Get the scrollbar size
  const scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;

  // Delete the DIV
  document.body.removeChild(scrollDiv);

  return scrollbarSize;
}

export default class Table extends React.Component<TableProps, TableState> {
  public scrollBarSize = 0;
  public listWrapper: any;
  public scrollBarWrapper: any;
  public listOffsetY = 0;
  public scrollHeight = 0;
  
  // resizer
  private resizerLine: any;

  // page limit(include visible and unvisible item)
  private limit = 50;

  // delay
  private delayTimer: any;
  private updateTimestamp = 0;
  private timeout = 100; // ms
  private forceUpdateInterval = 200; // ms

  constructor(props: TableProps) {
    super(props);

    const { options } = props;
    const { rowHeight, columnDefs, data } = options;

    this.scrollHeight = data.length * rowHeight;
    this.state = {
      selected: null,
      resizer: {
        isColumnResizing: false,
        resizingColumn: undefined,
        resizeWidth: 0,
      },
      columnDefs,
      sorts: [],
      data: data.slice(0, this.limit),
    };
  }

  public componentDidMount() {
    this.scrollBarSize = getScrollBarSize();
    const { options } = this.props;
    const { rowHeight } = options;
    this.limit = Math.ceil(this.listWrapper.offsetHeight / rowHeight) + 5;
    window.addEventListener("resize", this.handleWindowResize);
  }

  public componentWillReceiveProps(nextProps: TableProps) {
    this.delayDoAction(this.timeout, () => {
      const { options } = nextProps;
      const { rowHeight, data } = options;
      const nextColumnDefs: MyColumnDef<any>[] = options.columnDefs;
      const columnDefs: MyColumnDef<any>[] = this.state.columnDefs;
      for (let i = 0; i < nextColumnDefs.length; i++) {
        const nextColumnDef = nextColumnDefs[i];
        for (let m = 0; m < columnDefs.length; m++) {
          const columnDef = columnDefs[m];
          if (columnDef.field === nextColumnDef.field) {
            nextColumnDef.resizedWidth = columnDef.resizedWidth;
          }
        }
      }

      this.scrollHeight = data.length * rowHeight;
      this.setState({
        columnDefs: nextColumnDefs,
      });
      this.updateData();
    });
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
  }

  public render(): JSX.Element {
    return getView(this);
  }

  public handleHeaderClick = (
    e: React.MouseEvent<any>,
    columnDef: ColumnDef<any>,
  ) => {
    if (
      columnDef.enableSorting !== true ||
      !this.props.sortChanged ||
      this.state.resizer.isColumnResizing
    ) {
      return;
    }

    let sorts = this.state.sorts;
    let matchedSort = this.getMatchedSort(sorts, columnDef.field.toString());
    if (matchedSort) {
      if (matchedSort.direction === Direction.ASC) {
        // ASC -> DESC
        matchedSort.direction = Direction.DESC;
      } else {
        matchedSort.direction = Direction.NONE;
        const index = sorts.indexOf(matchedSort);
        if (index > -1) {
          sorts.splice(index, 1);
        }
      }
    } else {
      matchedSort = new Sort();
      matchedSort.field = columnDef.field.toString();
      matchedSort.direction = Direction.ASC;
      sorts.push(matchedSort);
    }

    if (!e.ctrlKey) {
      sorts = [];
      if (matchedSort.direction !== Direction.NONE) {
        sorts.push(matchedSort);
      }
    }
    this.props.sortChanged(sorts);
    this.setState({ sorts });
  };

  public handleWheel = (e: any) => {
    const { options } = this.props;
    const { rowHeight, data } = options;
    let scrollTop = this.scrollBarWrapper.scrollTop + e.deltaY;
    if (scrollTop < 0) {
      scrollTop = 0;
    }
    const scrollHeight = data.length * rowHeight;
    if (scrollTop > scrollHeight) {
      scrollTop = scrollHeight;
    }
    this.scrollBarWrapper.scrollTop = scrollTop;
    if (!(scrollTop <= 0 || scrollTop >= scrollHeight) && e.deltaX === 0) {
      e.preventDefault();
    }
  };

  public handleScroll = () => {
    this.delayDoAction(this.timeout, () => {
      this.updateData();
    });
  };

  public handleRowClick = (item: any) => {
    let selected = null;
    if (this.state.selected && this.state.selected === item) {
      selected = null;
    } else {
      selected = item;
    }
    this.setState({ selected });
  };

  public handleResizerMouseDown = (
    e: any,
    column: ColumnDef<any>,
    defaultWidth: number,
  ) => {
    const resizer = this.state.resizer;
    resizer.isColumnResizing = true;
    resizer.resizingColumn = column;
    resizer.resizeMouseX = e.clientX;
    const columnDefs = this.state.columnDefs;
    for (let i = 0; i < columnDefs.length; i++) {
      if (columnDefs[i].field === column.field) {
        columnDefs[i].resizedWidth = defaultWidth;
        break;
      }
    }
    this.setState({ resizer });
    document.addEventListener("mouseup", this.handleGlobalMouseUp, true);

    const resizerLine = document.createElement("div");
    resizerLine.style.width = "1px";
    resizerLine.style.height = "100%";
    resizerLine.style.background = "#666";
    resizerLine.style.position = "fixed";
    resizerLine.style.top = "0px";
    resizerLine.style.left = e.clientX + "px";
    document.body.appendChild(resizerLine);
    this.resizerLine = resizerLine;
    document.addEventListener("mousemove", this.handleGlobalMouseMove, true);

    e.preventDefault();
  };

  private handleGlobalMouseMove = (e: any) => {
    if (this.resizerLine) {
      this.resizerLine.style.left = e.clientX + "px";
    }
  };

  private handleGlobalMouseUp = (e: any) => {
    this.resizeColumn(e);
    if (this.resizerLine) {
      document.body.removeChild(this.resizerLine);
      this.resizerLine = undefined;
    }
    setTimeout(() => {
      this.state.resizer.isColumnResizing = false;
      this.setState({});
    }, 100);
    document.removeEventListener("mouseup", this.handleGlobalMouseUp, true);
  };

  private resizeColumn = (e: any) => {
    const { resizer, columnDefs } = this.state;
    const { isColumnResizing, resizeMouseX, resizingColumn } = resizer;
    if (isColumnResizing && resizingColumn) {
      const resizeDiffX = e.clientX - resizeMouseX;
      let isInResizedColumns = false;
      for (let i = 0; i < columnDefs.length; i++) {
        if (columnDefs[i].field === resizingColumn.field) {
          let width = (columnDefs[i].resizedWidth || 0) + resizeDiffX;
          if (width < 20) {
            width = 20;
          }
          columnDefs[i].resizedWidth = width;
          isInResizedColumns = true;
          break;
        }
      }
      resizer.resizeMouseX = e.clientX;
      this.setState({ resizer, columnDefs }, () => {
        this.updateData();
      });
    }
  };

  private handleWindowResize = () => {
    this.delayDoAction(this.timeout, () => {
      this.updateData();
    });
  };

  private updateData = (nextProps?: TableProps) => {
    const { options } = nextProps || this.props;
    const { rowHeight, data } = options;
    const scrollTop = this.scrollBarWrapper.scrollTop;
    // list visible size
    const listVisibleSize = this.listWrapper.clientHeight / rowHeight;
    // list index offset 0.9 => 0  1.9 => 1
    let index = Math.floor(scrollTop / rowHeight);
    // update offsetY of first item of list when scroll to bottom
    const dataLength = data.length;
    if (dataLength - index < listVisibleSize) {
      // -1: header has 1px border-bottom
      this.listOffsetY =
        ((this.listWrapper.clientHeight - 1) % rowHeight) - rowHeight;
    } else {
      this.listOffsetY = 0;
    }
    // reset index if has whitespace when scroll to bottom
    if (dataLength - index + 1 < listVisibleSize) {
      index = index - 1;
    }

    this.setState({
      data: data.slice(index, index + this.limit),
    });
  };

  private delayDoAction = (timeout: number, action: () => void) => {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
    }

    const timeDiff = new Date().getTime() - this.updateTimestamp;
    if (this.updateTimestamp && timeDiff > this.forceUpdateInterval) {
      this.updateTimestamp = new Date().getTime();
      action();
    } else {
      this.delayTimer = setTimeout(() => {
        this.updateTimestamp = new Date().getTime();
        action();
      }, timeout);
    }
  };

  private getMatchedSort(sorts: Sort[], field: string): Sort | null {
    for (const sort of sorts) {
      if (sort.field === field) {
        return sort;
      }
    }
    return null;
  }
}
