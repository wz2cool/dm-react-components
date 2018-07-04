import * as React from "react";
import * as _ from "lodash";
import Table, { TableOptions } from "../components/Table";
import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import { User } from "./model/user";
import { Sort } from "../components/Table/model/Sort";

import "./style.css";
import { Direction } from "../components/Table/model/direction";

declare const openDatabase: (
  db: string,
  version: string,
  desc: string,
  size: number,
  cb?: any,
) => any;

const db = openDatabase("dmdb", "1.0", "Test DB", 100 * 1024 * 1024);

interface State {
  data: User[];
}

export default class TableExample extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      data: [],
    };
  }

  public render() {
    const tableOptions: TableOptions<User> = {
      rowHeight: 30,
      columnDefs: [
        {
          field: "id",
          width: 100,
          enableSorting: true,
        },
        {
          field: "firstName",
          displayName: "名字",
          headerTemplate: <div>名字 (自定义)</div>,
          minWidth: 200,
          enableSorting: true,
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
      <div className="layout">
        <div className="header">
          <button onClick={this.fillLocalDb}>fill local db</button>
          <button onClick={this.getData}>get data from WebSQL</button>
        </div>
        <div className="content">
          <Table options={tableOptions} sortChanged={this.handleSortChanged} />
        </div>
      </div>
    );
  }

  private getData = () => {
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
        },
      );
    });
  };

  private fillLocalDb = async () => {
    console.log("fillLocalDb start");
    let users: User[] = [];
    for (let i = 1; i <= 50; i++) {
      console.log("get data: ", i);
      const response = await this.getUsers(i);
      const getUsers = response.data;
      users = users.concat(getUsers);
    }

    db.transaction((tx: any) => {

      tx.executeSql("Drop table faker");
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS faker (id UNIQUE, avatar, county, email, title, firstName, lastName, street, zipCode, date, bs, catchPhrase, companyName, words, sentence)",
      );

     

      for (let i = 0; i < users.length; i++) {
        const item = users[i];
        tx.executeSql(
          "INSERT INTO faker (id, avatar, county, email, title, firstName, lastName, street, zipCode, date, bs, catchPhrase, companyName, words, sentence) VALUES (" +
            i +
            ', "' +
            item.avatar +
            '", "' +
            item.county +
            '", "' +
            item.email +
            '", "' +
            item.title +
            '", "' +
            item.firstName +
            '", "' +
            item.lastName +
            '", "' +
            item.street +
            '", "' +
            item.zipCode +
            '", "' +
            item.date +
            '", "' +
            item.bs +
            '", "' +
            item.catchPhrase +
            '", "' +
            item.companyName +
            '", "' +
            item.words +
            '", "' +
            item.sentence +
            '")',
        );
      }
    });

    console.log("fillLocalDb end");
  };

  private getUsers(part: number): AxiosPromise<User[]> {
    const url = `https://raw.githubusercontent.com/wz2cool/fake-data/master/users/users_${part}.json`;
    return axios.get(url);
  }

  private handleSortChanged = (sorts: Sort[]) => {
    const fields: string[] = [];
    const directions: string[] = [];

    for (const sort of sorts) {
      fields.push(sort.field!);
      directions.push(Direction[sort.direction].toLocaleLowerCase());
    }
    const newData = _.orderBy(this.state.data, fields, directions);
    this.setState({ data: newData });
  };
}
