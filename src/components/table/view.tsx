import * as React from "react";
import styled from "styled-components";
import Table from "./table";
import { Sort } from "./model/Sort";
import { Direction } from "./model/direction";

const FlexAutoDivider = styled.div`
  flex: auto;
`;

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
    /* border-bottom: 1px solid #ccc; */
    flex: none;
  }
  ${ScrollbarFooter} {
    flex: none;
  }
`;

const Row = styled.div`
  display: table-row;
  :hover {
    background: #ccc;
  }
`;

const Column = styled.div`
  display: table-cell;
`;

const Cell = styled.div`
  /* padding: 0 8px; */
`;

const HeaderCell = Cell.extend`
  padding: 0;
  background: #eee;
  border-right: 1px solid #ccc;
  /* border-bottom: 1px solid #ccc; */
  user-select: none;
  position: relative;
  display: flex;
`;

const HeaderCellContent = styled.div`
  /* padding: 0 8px; */
`;

const SelectedRow = Row.extend`
  background: #d6ebdc;
  :hover {
    background: #d6ebdc;
  }
`;

const CellText = styled.div`
  width: 100%;
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
  const {
    selected,
    sorts,
    columnDefs,
    resizer,
    data,
    isShowScrollbarY,
  } = state;
  const { options, isLoading } = props;
  const { rowHeight, headerHeight } = options;
  const { isColumnResizing } = resizer;
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
        className="rc-table-list"
        ref={(node: any) => (that.listWrapper = node)}
        onWheel={e => handleWheel(e)}
        style={{
          height: "100%",
          flex: "auto",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "table",
          }}
        >
          <Row className="rc-table-row rc-table-header">
            {columnDefs.map((column, columnIndex) => {
              const widthProp =
                column.resizedWidth || column.width
                  ? { width: column.resizedWidth || column.width }
                  : {};
              const minWidth =
                column.resizedWidth || column.width
                  ? column.resizedWidth || column.width
                  : column.minWidth;
              return (
                <Column
                  className="rc-table-column"
                  key={columnIndex}
                  style={{
                    lineHeight: (headerHeight || rowHeight) + "px",
                  }}
                >
                  <div
                    style={{
                      minWidth,
                      ...widthProp,
                    }}
                  >
                    <HeaderCell
                      className="rc-table-cell"
                      style={{
                        height: headerHeight || rowHeight,
                        cursor: column.enableSorting ? "pointer" : "auto",
                      }}
                      onClick={(e: any) => handleHeaderClick(e, column)}
                    >
                      <HeaderCellContent className="rc-table-cell-content">
                        {column.headerTemplate ? (
                          column.headerTemplate
                        ) : (
                          <CellText>
                            {column.displayName || column.field.toString()}
                          </CellText>
                        )}
                      </HeaderCellContent>
                      {column.enableSorting ? (
                        <DirectionComponent
                          field={column.field.toString()}
                          sorts={sorts}
                        />
                      ) : null}
                      <FlexAutoDivider />
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
                    </HeaderCell>
                  </div>
                </Column>
              );
            })}
            <Column style={{ flex: "1 0 auto" }}>
              <HeaderCell
                style={{
                  borderRight: "none",
                  height: headerHeight || rowHeight,
                }}
              />
            </Column>
          </Row>

          {data.map((item, itemIndex) => {
            const RowElement =
              selected && selected === item ? SelectedRow : Row;
            return (
              <RowElement
                className="rc-table-row rc-table-body"
                key={itemIndex}
                style={{
                  height: rowHeight,
                  marginTop: itemIndex === 0 ? listOffsetY : 0,
                }}
              >
                {columnDefs.map((column, columnIndex) => {
                  const title = column.title
                    ? column.title(item)
                    : item[column.field.toString()];
                  const widthProp =
                    column.resizedWidth || column.width
                      ? { width: column.resizedWidth || column.width }
                      : {};
                  const minWidth =
                    column.resizedWidth || column.width
                      ? column.resizedWidth || column.width
                      : column.minWidth;
                  return (
                    <Column className="rc-table-cloumn" key={columnIndex}>
                      <div
                        style={{
                          minWidth,
                          ...widthProp,
                        }}
                      >
                        <Cell
                          className="rc-table-cell"
                          onClick={() => handleRowClick(item)}
                        >
                          {column.cellTemplate ? (
                            column.cellTemplate(item)
                          ) : (
                            <CellText title={title}>
                              {item[column.field]}
                            </CellText>
                          )}
                        </Cell>
                      </div>
                    </Column>
                  );
                })}
              </RowElement>
            );
          })}
        </div>
      </div>
      <Scrollbar
        className="rc-table-scrollbar"
        style={{
          width: isShowScrollbarY ? scrollBarSize : 0,
        }}
      >
        <ScrollbarHeader
          className="rc-table-scrollbar-header"
          style={{ height: headerHeight || rowHeight }}
        />
        <div
          className="rc-table-scrollbar-body"
          ref={node => (that.scrollBarWrapper = node)}
          onScroll={e => handleScroll()}
          style={{ flex: "auto", overflowX: "hidden", overflowY: "auto" }}
        >
          <div style={{ width: "1px", height: scrollHeight }} />
        </div>
        <ScrollbarFooter
          className="rc-table-scrollbar-footer"
          style={{ height: scrollBarSize }}
        />
      </Scrollbar>
    </Wrap>
  );
};

export { getView };
