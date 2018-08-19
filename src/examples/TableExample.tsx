import * as React from "react";
import * as _ from "lodash";
import { Table, TableOptions } from "../components";
import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import { User } from "./model/user";
import { Sort } from "../components/table/model/Sort";

import "./style.css";
import { Direction } from "../components/table/model/direction";
import { UserMapper } from "../mappers/userMapper";
import { DynamicQuery, FilterOperator } from "ts-dynamic-query";

export interface State {
  isTableLoading: boolean;
  data: User[];
}

export default class TableExample extends React.Component<{}, State> {
  private userMapper: UserMapper;
  constructor(props: {}) {
    super(props);
    this.userMapper = new UserMapper();
    this.state = {
      isTableLoading: false,
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
          minWidth: 100,
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
          <div className="content-inner">
            <Table
              options={tableOptions}
              sortChanged={this.handleSortChanged}
              isLoading={this.state.isTableLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  private getData = async () => {
    console.log("get data start");
    const query = new DynamicQuery<User>()
      .addFilter({
        propertyPath: "id",
        operator: FilterOperator.GREATER_THAN,
        value: 10000,
      })
      .addFilter({
        propertyPath: "companyName",
        operator: FilterOperator.START_WITH,
        value: "a",
        ignoreCase: true,
      });

    const users = await this.userMapper.getUser(query);
    console.log("get user Success, ", users.length);
  };

  private fillLocalDb = async () => {
    console.log("fillLocalDb start");
    for (let i = 1; i <= 50; i++) {
      console.log("begin get ==========", i);
      console.log("get user start");
      let response = await this.getUsers(i);
      let users = response.data as User[];
      console.log("get user end");
      console.log("save user start");
      await this.userMapper.bulkPut(users);
      console.log("save user end");
    }
    console.log("fillLocalDb end");
  };

  private getUsers(part: number): AxiosPromise<User[]> {
    const url = `https://raw.githubusercontent.com/wz2cool/fake-data/master/users/users_${part}.json`;
    return axios.get(url);
  }

  private handleSortChanged = (sorts: Sort[]) => {
    this.setState({ isTableLoading: true }, () => {
      setTimeout(() => {
        const fields: string[] = [];
        const directions: string[] = [];
        if (sorts.length === 0) {
          fields.push("id");
          directions.push("asc");
        } else {
          for (const sort of sorts) {
            fields.push(sort.field!);
            directions.push(Direction[sort.direction].toLocaleLowerCase());
          }
        }

        const newData = _.orderBy(this.state.data, fields, directions);
        this.setState({ data: newData, isTableLoading: false });
      }, 1000);
    });
  };
}
