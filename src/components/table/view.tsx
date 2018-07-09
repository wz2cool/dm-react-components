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

const getResizedColumnWidth = (column: any, resizedColumns: any[]) => {
  let width = 0;
  let hasWidth = false;
  for (let i = 0; i < resizedColumns.length; i++) {
    if (resizedColumns[i].field === column.field) {
      width = resizedColumns[i].width;
      hasWidth = true;
      break;
    }
  }
  if (!hasWidth) {
    if (column.width) {
      width = column.width;
    }
  }
  return width;
};

const getView = (component: Table): JSX.Element => {
  const that = component;
  const {
    listOffsetY,
    scrollBarSize,
    scrollHeight,
    handleResizerMouseDown,
    handleHeaderClick,
    handleRowClick,
    handleScroll,
    handleWheel,
    state,
    props,
  } = that;
  const { selected, sorts, columnDefs, resizer, data } = state;
  const { options, isLoading } = props;
  const { rowHeight, data: optionsData } = options;
  const { resizedColumns, isColumnResizing } = resizer;
  console.log(1111);
  return (
    <div className="rc-table">
      {isLoading ? (
        <div className="rc-table-loading-mask">
          <div className="rc-table-loading-content">
            <div className="rc-table-loading-icon">Loading...</div>
          </div>
        </div>
      ) : null}
      {isColumnResizing ? <div className="rc-table-resizer-mask" /> : null}
      <div
        className="rc-table-list"
        ref={node => (that.listWrapper = node)}
        onWheel={e => handleWheel(e)}
      >
        {columnDefs.map((column, columnIndex) => {
          return (
            <div
              className="rc-table-column"
              key={columnIndex}
              style={{
                minWidth: column.resizedWidth
                  ? column.resizedWidth
                  : column.minWidth
                    ? column.minWidth
                    : "auto",
                lineHeight: rowHeight + "px",
                flex:
                  column.resizedWidth || column.width
                    ? "0 0 " + (column.resizedWidth || column.width) + "px"
                    : "1 1 100%",
              }}
            >
              <div
                className="rc-table-cell rc-table-cell-header"
                style={{
                  height: rowHeight,
                  cursor: column.enableSorting ? "pointer" : "auto",
                }}
                onClick={e => handleHeaderClick(e, column)}
              >
                <div className="rc-table-cell-header-content">
                  {column.headerTemplate ? (
                    column.headerTemplate
                  ) : (
                    <span className="rc-table-cell-text">
                      {column.displayName || column.field.toString()}
                    </span>
                  )}
                </div>
                {column.enableSorting ? (
                  <DirectionComponent
                    field={column.field.toString()}
                    sorts={sorts}
                  />
                ) : null}
                <div style={{ flex: "auto" }} />
                {true ? (
                  <span className="rc-table-resizer">
                    <span
                      className="rc-table-resizer-inner"
                      onMouseDown={(e: any) =>
                        handleResizerMouseDown(
                          e,
                          column,
                          e.currentTarget.parentElement.parentElement
                            .offsetWidth,
                        )
                      }
                    />
                  </span>
                ) : null}
              </div>
              {data.map((item, itemIndex) => {
                const title = column.title
                  ? column.title(item)
                  : item[column.field.toString()];
                return (
                  <div
                    className={
                      "rc-table-cell rc-table-cell-content" +
                      (selected && selected === item
                        ? " rc-table-cell-selected"
                        : "")
                    }
                    key={itemIndex}
                    onClick={() => handleRowClick(item)}
                    style={
                      itemIndex === 0
                        ? {
                            height: rowHeight,
                            marginTop: listOffsetY,
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
        <div className="rc-table-column" style={{ flex: "1 0 auto" }}>
          <div
            className="rc-table-cell rc-table-cell-header"
            style={{ borderRight: "none", height: rowHeight }}
          />
        </div>
      </div>
      <div
        className="rc-table-scrollbar"
        style={{
          width: scrollBarSize,
        }}
      >
        <div
          className="rc-table-scrollbar-header"
          style={{ height: rowHeight }}
        />
        <div
          ref={node => (that.scrollBarWrapper = node)}
          onScroll={e => handleScroll()}
          style={{ flex: "auto", overflowX: "hidden", overflowY: "auto" }}
        >
          <div style={{ width: "1px", height: scrollHeight }} />
        </div>
        <div
          className="rc-table-scrollbar-footer"
          style={{ height: scrollBarSize }}
        />
      </div>
    </div>
  );
};

export { getView };
