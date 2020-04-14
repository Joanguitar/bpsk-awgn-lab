import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { sum, log10, pow } from 'mathjs'
import logo from './logo.svg';
import './App.css';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';

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

function valueLabelFormat(value){
  return(''+Math.round(10*value)/10)
}

function last(array){
  return(array[array.length-1])
}

var spareRandom = null;
function normalRandom()
{
	var val, u, v, s, mul;

	if(spareRandom !== null)
	{
		val = spareRandom;
		spareRandom = null;
	}
	else
	{
		do
		{
			u = Math.random()*2-1;
			v = Math.random()*2-1;

			s = u*u+v*v;
		} while(s === 0 || s >= 1);

		mul = Math.sqrt(-2 * Math.log(s) / s);

		val = u * mul;
		spareRandom = v * mul;
	}

	return val;
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
    this.noise_symbol = 90;
    this.noise_std = 0.5;
  }
  add2signals = (value) => {
    var signal = this.state.signal
    var signal_filtered = this.state.signal_filtered
    signal.push(value ? 1 : -1)
    signal.shift()
    signal[this.noise_symbol] += this.noise_std*normalRandom()
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
  handle_SNR = (event, value) => {
    this.noise_std = pow(10, -value/20)
  }
  componentDidMount() {
    this.interval = setInterval(() => this.update(), 50);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    const snr = 20*log10(1/this.noise_std)
    return (
      <div className="App">
        <Row>
          <Col lg="1">
          </Col>
          <Col lg="7">
            <Card>
              <CardHeader>
                <CardTitle>
                  <h3>
                    Communication
                  </h3>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Scatter
                  data={{
                    datasets: [
                      {
                        label: "signal",
                        fill: true,
                        showLine: true,
                        lineTension: 0.1,
                        backgroundColor: "rgba(50, 50, 255, 0.1)",
                        borderColor: "rgba(50, 50, 255, 1)",
                        borderWidth: 2,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        pointRadius: 3,//4,
                        data: this.state.signal.slice(-this.noise_symbol+1).reverse().map((simbol, ii) => {return({x: ii, y: simbol})}),
                      },
                      {
                        label: "signal_w_noise",
                        fill: true,
                        showLine: true,
                        lineTension: 0.1,
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        borderColor: "rgba(255, 0, 0, 1)",
                        borderWidth: 2,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        pointRadius: 3,//4,
                        data: this.state.signal.slice(this.state.filter.length, -this.noise_symbol+1).reverse().map((simbol, ii) => {return({x: this.noise_symbol+ii-1, y: simbol})}),
                      },
                      {
                        label: "signal_for filter",
                        fill: true,
                        showLine: true,
                        lineTension: 0.1,
                        backgroundColor: "rgba(255, 150, 0, 0.1)",
                        borderColor: "rgba(255, 150, 0, 1)",
                        borderWidth: 2,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        pointRadius: 3,//4,
                        data: this.state.signal.slice(0, this.state.filter.length).reverse().map((simbol, ii) => {return({x: this.state.signal.length+ii-this.state.filter.length, y: simbol})}),
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
          <Col lg="3">
            <Card>
              <CardHeader>
                <CardTitle>
                  <h3>
                    Filter
                  </h3>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Scatter
                  data={{
                    datasets: [
                      {
                        label: "signal",
                        fill: true,
                        showLine: true,
                        lineTension: 0.1,
                        backgroundColor: "rgba(0, 255, 0, 0.1)",
                        borderColor: "rgba(0, 200, 0, 1)",
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
              <CardFooter>
                <Row>
                  <Col md="6">
                    <FormLabel component="legend">
                      SNR (dB)
                    </FormLabel>
                    <Slider
                      value={snr}
                      onChange={this.handle_SNR}
                      aria-labelledby="continuous-slider"
                      valueLabelDisplay="auto"
                      getAriaValueText={valueLabelFormat}
                      valueLabelFormat={valueLabelFormat}
                      min={-10}
                      max={20}
                      step={0.01}
                    />
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
