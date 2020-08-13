//panels are the  children of the main dashboard element
import React, { Component } from "react";

class Panel extends Component {


  render() {
    //these extracted props are passed from the Dashboard. Props obj belongs to the component
    const { label, value, onSelect } = this.props;

    return (
      <section
        className="dashboard__panel"
        onClick={onSelect}
      >
        <h1 className="dashboard__panel-header">{label}</h1>
        <p className="dashboard__panel-value">{value}</p>
      </section>
    );
  }
}

export default Panel;