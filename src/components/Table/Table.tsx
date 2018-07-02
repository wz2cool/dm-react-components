import * as React from "react";
import "./style.less";

interface ColumnDef {
  field: string;
  displayName?: string;
  title?: any;
  headerTemplate?: any;
  cellTemplate?: any;
  width?: number;
  minWidth?: number;
}

export interface TableProps {
  options: {
    rowHeight: number;
    columnDefs: ColumnDef[];
    data: any[];
  };
}

interface TableState {
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
  private scrollBarSize = 0;
  private listWrapper: any;
  private scrollBarWrapper: any;
  private listOffsetY = 0;
  private limit = 50;
  private delayNewSourceTimer: any;
  private updateTimestamp = 0;
  private forceUpdateInterval = 100; // ms

  constructor(props: TableProps) {
    super(props);

    this.state = {
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

  public render() {
    const { options } = this.props;
    const { rowHeight, columnDefs, data } = options;
    const scrollHeight = data.length * rowHeight;
    return (
      <div className="rc-table">
        <div
          className="rc-table-list"
          ref={node => (this.listWrapper = node)}
          onWheel={e => this.handleWheel(e)}
        >
          {columnDefs.map((column, columnIndex) => {
            return (
              <div
                className="rc-table-column"
                key={columnIndex}
                style={{
                  minWidth: column.minWidth ? column.minWidth : "auto",
                  lineHeight: rowHeight + "px",
                  flex: column.width
                    ? "0 0 " + column.width + "px"
                    : "1 1 100%",
                }}
              >
                <div
                  className="rc-table-cell rc-table-cell-header"
                  style={{ height: rowHeight }}
                >
                  {column.headerTemplate ? (
                    column.headerTemplate
                  ) : (
                    <div className="rc-table-cell-text">
                      {column.displayName || column.field}
                    </div>
                  )}
                </div>
                {this.state.data.map((item, itemIndex) => {
                  const title = column.title
                    ? column.title(item)
                    : item[column.field];
                  return (
                    <div
                      className="rc-table-cell rc-table-cell-content"
                      key={itemIndex}
                      style={
                        itemIndex === 0
                          ? {
                              height: rowHeight,
                              marginTop: this.listOffsetY,
                            }
                          : { height: rowHeight }
                      }
                    >
                      {column.cellTemplate ? (
                        column.cellTemplate(item)
                      ) : (
                        <div className="rc-table-cell-text" title={title}>
                          {item[column.field]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div
          className="rc-table-scrollbar"
          style={{
            width: this.scrollBarSize,
          }}
        >
          <div
            className="rc-table-scrollbar-header"
            style={{ height: rowHeight }}
          />
          <div
            ref={node => (this.scrollBarWrapper = node)}
            onScroll={e => this.handleScroll()}
            style={{ flex: "auto", overflowX: "hidden", overflowY: "auto" }}
          >
            <div style={{ width: "1px", height: scrollHeight }} />
          </div>
          <div
            className="rc-table-scrollbar-footer"
            style={{ height: this.scrollBarSize }}
          />
        </div>
      </div>
    );
  }

  private handleWheel = (e: any) => {
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

  private handleScroll = () => {
    this.delayDoAction(50, () => {
      this.setNewSource();
    });
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
}
