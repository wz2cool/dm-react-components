import * as React from "react";
import * as _ from "lodash";
import Table, { TableProps } from "../components/Table";

declare const openDatabase: (
  db: string,
  version: string,
  desc: string,
  size: number,
  cb?: any,
) => any;

const db = openDatabase("dmdb", "1.0", "Test DB", 10 * 1024 * 1024);

interface State {
  data: any[];
}

export default class TableExample extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      data: [],
    };
  }

  public render() {
    const tableOptions = {
      rowHeight: 30,
      columnDefs: [
        {
          field: "id",
          width: 100,
        },
        {
          field: "name",
          displayName: "名字",
          headerTemplate: <div>名字 (自定义)</div>,
          cellClass: "",
          minWidth: 200,
          cellTemplate: (item: any) => (
            <span
              style={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
                display: "inline-block",
              }}
              onClick={e => {
                alert(item.firstName + " " + item.lastName);
                // prevent row active
                e.stopPropagation();
              }}
            >
              {item.firstName + " " + item.lastName} (自定义/可点击)
            </span>
          ),
        },
        {
          field: "companyName",
          displayName: "公司",
          minWidth: 300,
        },
        {
          field: "email",
          displayName: "邮箱",
          minWidth: 100,
          title: (item: any) => item.email + "自定义title",
        },
        {
          field: "street",
          displayName: "街道",
          minWidth: 300,
        },
      ],
      data: this.state.data,
    };

    return (
      <div>
        <div style={{ height: "320px" }}>
          <Table options={tableOptions} />
        </div>
        <button onClick={this.getData}>get data from WebSQL</button>
      </div>
    );
  }

  private getData = () => {
    console.log(new Date().toJSON());
    const _that = this;
    db.transaction((tx: any) => {
      tx.executeSql(
        "SELECT * FROM faker limit 50000",
        [],
        (tx: any, results: any) => {
          const data = _.values(results.rows);
          _that.setState({
            data,
          });
          console.log(new Date().toJSON());
        },
      );
    });
  };
}
