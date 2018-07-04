import * as React from "react";
import { render } from "react-dom";
import TableExample from "./TableExample";

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
