import * as React from "react";
import Table from "./table";
import { Sort } from "./model/Sort";
import { Direction } from "./model/direction";

const DirectionComponent = ({
  field,
  sorts,
}: {
  field: string;
  sorts: Sort[];
}) => {
  let direction = Direction.NONE;
  let index = 0;
  for (let i = 0; i < sorts.length; i++) {
    if (sorts[i].field === field) {
      direction = sorts[i].direction;
      index = i + 1;
      break;
    }
  }
  let iconClassName = "rc-table-sort-icon";
  if (direction === Direction.ASC) {
    iconClassName = iconClassName + " rc-table-sort-asc";
  } else if (direction === Direction.DESC) {
    iconClassName = iconClassName + " rc-table-sort-desc";
  }
  return (
    <span className="rc-table-sort">
      <span className={iconClassName} />
      <span className="rc-table-sort-index">{index ? index : ""}</span>
    </span>
  );
};

const getView = (component: Table): JSX.Element => {
  const that = component;
  const { selected, sorts } = that.state;
  const { options } = that.props;
  const { rowHeight, columnDefs, data } = options;
  const scrollHeight = data.length * rowHeight;
  return (
    <div className="rc-table">
      <div
        className="rc-table-list"
        ref={node => (that.listWrapper = node)}
        onWheel={e => that.handleWheel(e)}
      >
        {columnDefs.map((column, columnIndex) => {
          return (
            <div
              className="rc-table-column"
              key={columnIndex}
              style={{
                minWidth: column.minWidth ? column.minWidth : "auto",
                lineHeight: rowHeight + "px",
                flex: column.width ? "0 0 " + column.width + "px" : "1 1 100%",
              }}
            >
              <div
                className="rc-table-cell rc-table-cell-header"
                style={{
                  height: rowHeight,
                  cursor: column.enableSorting ? "pointer" : "auto",
                }}
                onClick={e => that.handleHeaderClick(e, column)}
              >
                {column.headerTemplate ? (
                  column.headerTemplate
                ) : (
                  <span className="rc-table-cell-text">
                    {column.displayName || column.field.toString()}
                  </span>
                )}
                {column.enableSorting ? (
                  <DirectionComponent
                    field={column.field.toString()}
                    sorts={sorts}
                  />
                ) : null}
              </div>
              {that.state.data.map((item, itemIndex) => {
                const title = column.title
                  ? column.title(item)
                  : item[column.field.toString()];
                return (
                  <div
                    className={
                      "rc-table-cell rc-table-cell-content" +
                      (selected && selected.id === item.id
                        ? " rc-table-cell-selected"
                        : "")
                    }
                    key={itemIndex}
                    onClick={() => that.handleRowClick(item)}
                    style={
                      itemIndex === 0
                        ? {
                            height: rowHeight,
                            marginTop: that.listOffsetY,
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
          width: that.scrollBarSize,
        }}
      >
        <div
          className="rc-table-scrollbar-header"
          style={{ height: rowHeight }}
        />
        <div
          ref={node => (that.scrollBarWrapper = node)}
          onScroll={e => that.handleScroll()}
          style={{ flex: "auto", overflowX: "hidden", overflowY: "auto" }}
        >
          <div style={{ width: "1px", height: scrollHeight }} />
        </div>
        <div
          className="rc-table-scrollbar-footer"
          style={{ height: that.scrollBarSize }}
        />
      </div>
    </div>
  );
};

export { getView };
