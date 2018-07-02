import * as React from "react";
import { render } from "react-dom";
import TableExample from "./examples/TableExample";
import "./app.less";

class Examples extends React.Component {
  public render() {
    return (
      <div>
        <TableExample />
      </div>
    );
  }
}

render(<Examples />, document.getElementById("root"));
