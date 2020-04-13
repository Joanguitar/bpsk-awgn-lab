import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { sum } from 'mathjs'
import logo from './logo.svg';
import './App.css';

import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardText,
  CardTitle,
  Label,
  FormGroup,
  Input,
  Table,
  Row,
  Col
} from "reactstrap";

function last(array){
  return(array[array.length-1])
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bits: new Array(12).fill(false),
      signal: new Array(180).fill(0.0),
      signal_filtered: new Array(60).fill(0.0),
      pulse: new Array(10).fill(1),
      filter: new Array(10).fill(0.1),
      count: 0
    }
  }
  add2signals = (value) => {
    var signal = this.state.signal
    var signal_filtered = this.state.signal_filtered
    signal.push(value ? 1 : -1)
    signal.shift()
    signal_filtered.push(
      sum(signal.slice(0, this.state.filter.length).map((value, ii) => value*this.state.filter[ii]))
    )
    signal_filtered.shift()
    this.setState({signal: signal, signal_filtered: signal_filtered})
  }
  add2bits = (value) => {
    var bits = this.state.bits
    bits.push(value)
    bits.shift()
    this.setState({bits: bits})
  }
  update = () => {
    this.add2signals(last(this.state.bits)*this.state.pulse[this.state.count])
    if (this.state.count == 9) {
      this.add2bits(Math.random() >= 0.5)
      this.setState({count: 0})
    } else {
      this.setState({count: this.state.count+1})
    }
  }
  componentDidMount() {
    this.interval = setInterval(() => this.update(), 50);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    return (
      <div className="App">
        <Row>
          <Col lg="8">
            <Card>
              <CardBody>
                <Scatter
                  data={{
                    datasets: [
                      {
                        label: "signal",
                        fill: true,
                        showLine: true,
                        lineTension: 0.1,
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        borderColor: "#f11e1f",
                        borderWidth: 2,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        pointRadius: 3,//4,
                        data: this.state.signal.slice().reverse().map((simbol, ii) => {return({x: ii, y: simbol})}),
                      }
                    ]
                  }}
                  options={{
                    animation: {
                        duration: 0.05
                    },
                    legend: {
                      display: false
                    },
                    tooltips: {
                      enabled: false,
                    },
                    responsive: true,
                    scales: {
                      yAxes: [
                        {
                          barPercentage: 1.6,
                          gridLines: {
                            drawBorder: false,
                            color: "rgba(29,140,248,0.0)",
                            zeroLineColor: "transparent"
                          },
                          ticks: {
                            min: -2,
                            max: 2,
                            padding: 20,
                            fontColor: "#9e9e9e",
                            stepSize: 1
                          }
                        }
                      ],

                      xAxes: [
                        {
                          barPercentage: 1.6,
                          gridLines: {
                            drawBorder: false,
                            color: "rgba(0,242,195,0.1)",
                            zeroLineColor: "transparent"
                          },
                          ticks: {
                            padding: 20,
                            min: 0,
                            max: 180,
                            fontColor: "#9e9e9e"
                          }
                        }
                      ]
                    }
                  }}
                />
              </CardBody>
            </Card>
          </Col>
          <Col lg="4">
            <Card>
              <CardBody>
                <Scatter
                  data={{
                    datasets: [
                      {
                        label: "signal",
                        fill: true,
                        showLine: true,
                        lineTension: 0.1,
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        borderColor: "#f11e1f",
                        borderWidth: 2,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        pointRadius: 3,//4,
                        data: this.state.signal_filtered.slice().reverse().map((simbol, ii) => {return({x: ii, y: simbol})}),
                      }
                    ]
                  }}
                  options={{
                    animation: {
                        duration: 0.05
                    },
                    legend: {
                      display: false
                    },
                    tooltips: {
                      enabled: false,
                    },
                    responsive: true,
                    scales: {
                      yAxes: [
                        {
                          barPercentage: 1.6,
                          gridLines: {
                            drawBorder: false,
                            color: "rgba(29,140,248,0.0)",
                            zeroLineColor: "transparent"
                          },
                          ticks: {
                            min: -2,
                            max: 2,
                            padding: 20,
                            fontColor: "#9e9e9e",
                            stepSize: 1
                          }
                        }
                      ],

                      xAxes: [
                        {
                          barPercentage: 1.6,
                          gridLines: {
                            drawBorder: false,
                            color: "rgba(0,242,195,0.1)",
                            zeroLineColor: "transparent"
                          },
                          ticks: {
                            padding: 20,
                            min: 0,
                            max: 60,
                            fontColor: "#9e9e9e"
                          }
                        }
                      ]
                    }
                  }}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
