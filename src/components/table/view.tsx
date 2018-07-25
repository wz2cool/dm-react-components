import * as React from "react";
import styled from "styled-components";
import Table from "./table";
import { Sort } from "./model/Sort";
import { Direction } from "./model/direction";

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background: #f8f8f8;
  position: relative;
`;

const LoadingMask = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
`;

const LoadingContent = styled.div``;

const LoadingIcon = styled.div`
  width: 100px;
  height: 100px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ResizerMask = styled.div`
  cursor: col-resize;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
`;

const Resizer = styled.span`
  width: 4px;
  height: 100%;
  position: absolute;
  top: 0;
  right: -1px;
  z-index: 999;
`;

const ResizerInner = styled.span`
  width: 4px;
  height: 100%;
  cursor: col-resize;
  display: block;
`;

const ScrollbarHeader = styled.div``;

const ScrollbarFooter = styled.div``;

const Scrollbar = styled.div`
  height: 100%;
  flex: none;
  display: flex;
  flex-direction: column;
  ${ScrollbarHeader} {
    background: #eee;
    border-bottom: 1px solid #ccc;
    flex: none;
  }
  ${ScrollbarFooter} {
    flex: none;
  }
`;

const Column = styled.div``;

const Cell = styled.div`
  padding: 0 8px;
`;

const CellHeader = Cell.extend`
  padding: 0;
  background: #eee;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  user-select: none;
  position: relative;
  display: flex;
`;

const CellHeaderContent = styled.div`
  padding: 0 8px;
`;

const CellSelected = Cell.extend`
  background: #d6ebdc;
`;

const CellText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SortWrap = styled.span``;

const SortIcon = styled.span`
  width: 0;
  height: 0;
  vertical-align: middle;
  display: inline-block;
  border-color: #666;
  border-style: solid;
  border-width: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
`;

const SortIconAsc = SortIcon.extend`
  border-bottom-width: 4px;
`;

const SortIconDesc = SortIcon.extend`
  border-top-width: 4px;
`;

const SortIndex = styled.span`
  vertical-align: middle;
  font-size: 12px;
`;

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
  let SortIconElement = SortIcon;
  if (direction === Direction.ASC) {
    SortIconElement = SortIconAsc;
  } else if (direction === Direction.DESC) {
    SortIconElement = SortIconDesc;
  }
  return (
    <SortWrap>
      <SortIconElement />
      <SortIndex>{index ? index : ""}</SortIndex>
    </SortWrap>
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
  return (
    <Wrap>
      {isLoading ? (
        <LoadingMask>
          <LoadingContent>
            <LoadingIcon>Loading...</LoadingIcon>
          </LoadingContent>
        </LoadingMask>
      ) : null}
      {isColumnResizing ? <ResizerMask /> : null}
      <div
        style={{
          height: "100%",
          flex: "auto",
          overflowX: "auto",
          overflowY: "hidden",
          display: "flex",
          flexDirection: "row",
        }}
        ref={(node: any) => (that.listWrapper = node)}
        onWheel={e => handleWheel(e)}
      >
        {columnDefs.map((column, columnIndex) => {
          return (
            <div
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
              <CellHeader
                style={{
                  height: rowHeight,
                  cursor: column.enableSorting ? "pointer" : "auto",
                }}
                onClick={(e: any) => handleHeaderClick(e, column)}
              >
                <CellHeaderContent>
                  {column.headerTemplate ? (
                    column.headerTemplate
                  ) : (
                    <CellText>
                      {column.displayName || column.field.toString()}
                    </CellText>
                  )}
                </CellHeaderContent>
                {column.enableSorting ? (
                  <DirectionComponent
                    field={column.field.toString()}
                    sorts={sorts}
                  />
                ) : null}
                <div style={{ flex: "auto" }} />
                {true ? (
                  <Resizer>
                    <ResizerInner
                      onMouseDown={(e: any) =>
                        handleResizerMouseDown(
                          e,
                          column,
                          e.currentTarget.parentElement.parentElement
                            .offsetWidth,
                        )
                      }
                    />
                  </Resizer>
                ) : null}
              </CellHeader>
              {data.map((item, itemIndex) => {
                const title = column.title
                  ? column.title(item)
                  : item[column.field.toString()];
                const CellElement =
                  selected && selected === item ? CellSelected : Cell;
                return (
                  <CellElement
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
                      <CellText title={title}>{item[column.field]}</CellText>
                    )}
                  </CellElement>
                );
              })}
            </div>
          );
        })}
        <Column style={{ flex: "1 0 auto" }}>
          <CellHeader style={{ borderRight: "none", height: rowHeight }} />
        </Column>
      </div>
      <Scrollbar
        style={{
          width: scrollBarSize,
        }}
      >
        <ScrollbarHeader style={{ height: rowHeight }} />
        <div
          ref={node => (that.scrollBarWrapper = node)}
          onScroll={e => handleScroll()}
          style={{ flex: "auto", overflowX: "hidden", overflowY: "auto" }}
        >
          <div style={{ width: "1px", height: scrollHeight }} />
        </div>
        <ScrollbarFooter style={{ height: scrollBarSize }} />
      </Scrollbar>
    </Wrap>
  );
};

export { getView };
