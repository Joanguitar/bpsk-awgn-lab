import React from 'react';
import { Line } from 'react-chartjs-2';
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
      signal: new Array(120).fill(0),
      symbols_per_bit: 10,
      pulse: new Array(10).fill(1),
      count: 0
    }
  }
  add2signal = (value) => {
    console.log(last(this.state.signal));
    var signal = this.state.signal
    signal.push(value ? 1 : -1)
    signal.shift()
    this.setState({signal: signal})
  }
  add2bits = (value) => {
    var bits = this.state.bits
    bits.push(value)
    bits.shift()
    this.setState({bits: bits})
  }
  update = () => {
    this.add2signal(last(this.state.bits)*this.state.pulse[this.state.count])
    if (this.state.count == 9) {
      this.add2bits(Math.random() >= 0.5)
      this.setState({count: 0})
    } else {
      this.setState({count: this.state.count+1})
    }
  }
  componentDidMount() {
    this.interval = setInterval(() => this.update(), 100);
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
                <Line
                  data={{
                    datasets: [
                      {
                        label: "signal",
                        fill: true,
                        showLine: true,
                        lineTension: 0.1,
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        borderColor: "#f11e1f",
                        borderWidth: 5,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        pointRadius: 4,//4,
                        data: this.state.signal.slice().reverse(),
                      }
                    ]
                  }}
                  options = {{
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
                          gridLines: {
                            display: true,
                            drawBorder: false,
                            color: "rgba(255,255,255,0.1)",
                            zeroLineColor: "transparent"
                          },
                          ticks: {
                            min: -2,
                            max: 2,
                            fontColor: "#9a9a9a",
                            stepSize: 0.5,
                          }
                        }
                      ],
                      xAxes: [
                        {
                          gridLines: {
                            display: true,
                            drawBorder: false,
                            color: "rgba(255,255,255,0.1)",
                            zeroLineColor: "transparent"
                          },
                          ticks: {
                            min: 0,
                            max: 120,
                            fontColor: "#9a9a9a",
                            stepSize: 1,
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
