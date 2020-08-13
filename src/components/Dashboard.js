import React, { Component } from "react";
import axios from 'axios';
import classnames from "classnames";
import Loading from "components/Loading.js";
import Panel from "components/Panel.js";
import { setInterview } from "helpers/reducers";

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
} from "helpers/selectors";
//fake data details about our Interview Scheduler in 4 panels
const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay

  }
];

class Dashboard extends Component {


  state = {
    loading: true,
    //null = unfocused; other values = panels ids from 1 - 4
    focused: null,
    days: [],
    appointments: {},
    interviews: {}
  };



  //use the componentDidMount lifecycle method 
  // to check to see if there is saved focus state after we render the application the first time
  componentDidMount() {
    //When we get the values out of storage, we use the JSON.parse function to convert the string back to JavaScript values
    const focused = JSON.parse(localStorage.getItem("focused"));


    // When the component mounts - request  data. 
    // After the data returns, we use this.setState to merge it into the existing state object.
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });

    //assign a reference to a WebSocket connection
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    //listen for messages on the socket connection and use them to update the state when we book or cancel an interview
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);

      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };

    //When the local storage contains state, we can set the state of the application to match
    if (focused) {
      this.setState({ focused });
    }
  }



  //use the componentDidUpdate lifecycle method to listen for changes to the state.
  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      //use the JSON.stringify function to convert our values before writing them to the localStorage
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  //componentWillUnmount lifecycle method to close the socket using the instance variable that holds the reference to the connection
  componentWillUnmount() {
    this.socket.close();
  }


  /* Instance Method to handle this context*/
  selectPanel(id) {
    this.setState(previousState => ({
      //set the value of focused back to null if the value of focused is currently set to a panel
      focused: previousState.focused !== null ? null : id
    }));
  }



  render() {

    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
    });

    //show Loading component if the application is in the loading state
    if (this.state.loading) {
      return <Loading />;
    }

    //create a new Panel for each of the four data objects
    const parsedPanels = data
      .filter(
        panel => this.state.focused === null || this.state.focused === panel.id
      )
      .map(panel => {
        return <Panel
          key={panel.id}
          label={panel.label}
          value={panel.getValue(this.state)}
          //onSelect uses an arrow function 
          onSelect={event => this.selectPanel(panel.id)}
        />
      })


    return (
      <main className={dashboardClasses}>
        {parsedPanels}
      </main>
    )
  }
}


export default Dashboard;
