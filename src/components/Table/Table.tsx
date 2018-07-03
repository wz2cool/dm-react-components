import * as React from "react";
import "./style.css";
import { Sort } from "./model/Sort";
import { Direction } from "./model/direction";
import { getView } from "./view";

interface ColumnDef {
  field: string;
  displayName?: string;
  title?: any;
  headerTemplate?: any;
  cellTemplate?: any;
  width?: number;
  minWidth?: number;
  enableSorting?: boolean;
}

export interface TableOptions {
  rowHeight: number;
  columnDefs: ColumnDef[];
  data: any[];
}

export interface TableProps {
  options: TableOptions;
  sortChanged?: (sorts: Sort[]) => void;
}

interface TableState {
  selected: any;
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
  scrollBarSize = 0;
  listWrapper: any;
  scrollBarWrapper: any;
  listOffsetY = 0;
  limit = 50;
  delayNewSourceTimer: any;
  updateTimestamp = 0;
  forceUpdateInterval = 100; // ms
  private sorts: Sort[] = [];

  constructor(props: TableProps) {
    super(props);

    this.state = {
      selected: null,
      data: props.options.data.slice(0, this.limit),
    };
  }

  public componentDidMount() {
    this.scrollBarSize = getScrollBarSize();
    const { options } = this.props;
    const { rowHeight } = options;
    this.limit = Math.ceil(this.listWrapper.offsetHeight / rowHeight) + 5;
  }

  public componentWillReceiveProps(nextProps: TableProps) {
    this.delayDoAction(50, () => {
      this.setNewSource();
    });
  }

  public render(): JSX.Element {
    return getView(this);
  }

  handleHeaderClick = (e: React.MouseEvent<any>, columnDef: ColumnDef) => {
    if (columnDef.enableSorting !== true || !this.props.sortChanged) {
      return;
    }

    let matchedSort = this.getMatchedSort(this.sorts, columnDef.field);
    if (matchedSort) {
      if (matchedSort.direction === Direction.ASC) {
        // ASC -> DESC
        matchedSort.direction = Direction.DESC;
      } else {
        matchedSort.direction = Direction.NONE;
      }
    } else {
      matchedSort = new Sort();
      matchedSort.field = columnDef.field;
      matchedSort.direction = Direction.ASC;
      this.sorts.push(matchedSort);
    }

    if (!e.ctrlKey) {
      this.sorts = [];
      if (matchedSort.direction !== Direction.NONE) {
        this.sorts.push(matchedSort);
      }
    }
    this.props.sortChanged(this.sorts);
  };

  handleWheel = (e: any) => {
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

  handleScroll = () => {
    this.delayDoAction(50, () => {
      this.setNewSource();
    });
  };

  handleRowClick = (item: any) => {
    let selected = null;
    if (this.state.selected && this.state.selected.id === item.id) {
      selected = null;
    } else {
      selected = item;
    }
    this.setState({ selected });
  };

  private setNewSource = () => {
    const { options } = this.props;
    const { rowHeight, data } = options;
    const scrollTop = this.scrollBarWrapper.scrollTop;
    let index = Math.floor((scrollTop - this.scrollBarSize - 1) / rowHeight);
    index = index >= 0 ? index : 0;

    if (
      scrollTop + this.listWrapper.offsetHeight >
        (data.length - 5) * rowHeight ||
      scrollTop < 5 * rowHeight
    ) {
      if (this.listWrapper.clientHeight !== this.listWrapper.offsetHeight) {
        // if has scroll bar
        this.listOffsetY =
          -(
            scrollTop /
            (data.length * rowHeight - rowHeight - this.scrollBarSize - 1)
          ) *
          (rowHeight -
            ((this.listWrapper.offsetHeight - 1 - this.scrollBarSize) %
              rowHeight));
      } else {
        // if has not scroll bar
        this.listOffsetY =
          -(
            scrollTop /
            (data.length * rowHeight - rowHeight - this.scrollBarSize - 1)
          ) *
          (rowHeight - ((this.listWrapper.offsetHeight - 1) % rowHeight));
      }
    }

    this.setState({
      data: data.slice(index, index + this.limit),
    });
  };

  private delayDoAction = (timeout: number, action: () => void) => {
    if (this.delayNewSourceTimer) {
      clearTimeout(this.delayNewSourceTimer);
    }

    const timeDiff = new Date().getTime() - this.updateTimestamp;
    if (this.updateTimestamp && timeDiff > this.forceUpdateInterval) {
      this.updateTimestamp = new Date().getTime();
      action();
    } else {
      this.delayNewSourceTimer = setTimeout(() => {
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
