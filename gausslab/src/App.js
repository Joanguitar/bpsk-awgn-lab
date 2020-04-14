import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { sum, log10, pow } from 'mathjs'
import slice from 'slice.js';
import logo from './logo.svg';
import './App.css';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

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
      bits: new Array(18).fill(false),
      signal: new Array(180).fill(0.0),
      signal_filtered: new Array(60).fill(0.0),
      pulse: new Array(10).fill(1),
      filter: new Array(10).fill(0.1),
      count: 0,
      true_bits: new Array(20).fill(false),
      decoded_bits: new Array(20).fill(false),
    }
    this.buffered_bits = 19;
    this.noise_symbol = 90;
    this.noise_std = 0.5;
    this.snr = 20*log10(1/this.noise_std)
    this.handicap = 0
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
    var true_bits = this.state.true_bits
    var decoded_bits = this.state.decoded_bits
    bits.push(value)
    true_bits.push(bits[0])
    while (bits.length > this.buffered_bits) {
      bits.shift()
    }
    true_bits.shift()
    decoded_bits.push(this.state.signal_filtered[this.state.signal_filtered.length-(this.state.count+2+this.handicap)] > 0)
    decoded_bits.shift()
    this.setState({bits: bits, true_bits: true_bits, decoded_bits: decoded_bits})
  }
  update = () => {
    this.add2signals(last(this.state.bits)*this.state.pulse[this.state.count])
    if (this.state.count >= this.state.pulse.length-1) {
      this.add2bits(Math.random() >= 0.5)
      this.setState({count: 0})
    } else {
      this.setState({count: this.state.count+1})
    }
  }
  handle_SNR = (event, value) => {
    this.noise_std = pow(10, -value/20)
    this.snr = 20*log10(1/this.noise_std)
  }
  handle_SXB = (event, value) => {
    this.setState({pulse: new Array(value).fill(1), filter: new Array(value).fill(1/value)})
    this.handicap = (value-(180%value))%value
    this.buffered_bits = 1+(180+this.handicap)/value
  }
  componentDidMount() {
    this.interval = setInterval(() => this.update(), 50);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    var bits2show = []
    if(this.buffered_bits < 18){
      bits2show = this.state.bits.map(bit => (bit ? '1' : '0'))
    } else {
      bits2show = [...this.state.bits.slice(0, 4).map(bit => (bit ? '1' : '0')), '...', ...this.state.bits.slice(-4).map(bit => (bit ? '1' : '0'))]
    }
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
                        label: "signal_sub",
                        fill: true,
                        showLine: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        borderColor: "rgba(255, 0, 0, 1)",
                        borderWidth: 2,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        pointRadius: 5,//4,
                        data: slice(this.state.signal_filtered)['-'+(this.state.count+1+this.handicap)+':0:-'+this.state.filter.length].map((simbol, ii) => {return({x: ii*this.state.filter.length+this.state.count+this.handicap, y: simbol})}),
                      },
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
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <h4>
                    Controls
                  </h4>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="6">
                    <FormLabel component="legend">
                      SNR (dB)
                    </FormLabel>
                    <Slider
                      value={this.snr}
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
                  <Col md="6">
                    <FormLabel component="legend">
                      Samples per bit
                    </FormLabel>
                    <Slider
                      value={this.state.pulse.length}
                      onChange={this.handle_SXB}
                      aria-labelledby="discrete-slider"
                      valueLabelDisplay="auto"
                      getAriaValueText={valueLabelFormat}
                      valueLabelFormat={valueLabelFormat}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="1">
          </Col>
          <Col lg="10">
            <Card>
              <CardBody>
                <Table>
                  <tbody>
                    <tr>
                      {bits2show.slice().reverse().map(bit => {return(
                        <td>
                          {bit}
                        </td>
                      )})}
                      {this.state.true_bits.slice().reverse().map(bit => {return(
                        <td>
                          {bit ? '1' : '0'}
                        </td>
                      )})}
                      <td>
                        True bits
                      </td>
                    </tr>
                    <tr>
                      {bits2show.slice().reverse().map(bit => {return(
                        <td>
                        </td>
                      )})}
                      {this.state.decoded_bits.slice().reverse().map(bit => {return(
                        <td>
                          {bit ? '1' : '0'}
                        </td>
                      )})}
                      <td>
                        Decoded bits
                      </td>
                    </tr>
                    <tr>
                      {bits2show.slice().reverse().map(bit => {return(
                        <td>
                        </td>
                      )})}
                      {this.state.decoded_bits.slice().reverse().map((bit, ii) => {return(
                        <td>
                          {bit != this.state.true_bits[this.state.true_bits.length-(ii+1)] ? '1' : '0'}
                        </td>
                      )})}
                      <td>
                        Bit errors
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <h1>
                    BPSK Communication with AWGN and simbol redundancy
                  </h1>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p>
                  The figures above depict a digital communication example.
                  This one consists on a transmitter, a channel and a receiver.
                </p>
                <Row>
                  <Col md="4">
                    <h3>The transmitter</h3>
                    <p align='left'>
                      The transmitter consiste on a BPSK modulator with redundancy.
                      This means that maps each bit into the BPSK constellation [-1, 1], in this case -1 for 0 and 1 for 1.
                      Then it replicates the symbols for as many samples as specified.
                      The samples per bit can be modified with the slider.
                      (The transmission power is considered as 1 for simplicity).
                    </p>
                    <p>
                      The transmitted signal is represented with blue in the left graph.
                    </p>
                  </Col>
                  <Col md="4">
                    <h3>The channel</h3>
                    <p align='left'>
                      The channel is modeled as an additive white Gaussian noise channel (AWGN).
                      This means that for each sample in the signal it adds a noise component distributed as an independent Gaussian variable.
                      <InlineMath math="n[t]\sim\mathcal{N}(0, \sigma^2)" />
                      <BlockMath math="y_r[t] = y_t[t] + n[t]"/>
                    </p>
                    <p>
                      The effect of the channel over the transmitted signal is represented with red in the left graph.
                    </p>
                  </Col>
                  <Col md="4">
                    <h3>The receiver</h3>
                    <p align='left'>
                      The receiver uses a uniform matched filter with downsampling to process the signal and then decodes the BPSK modulation.
                      It starts by filtering the signal using a moving average of length equal to the number of samples per bit.
                      Then it performs a downsampling by selecting a sample for each samples block of length equal to the number of samples per bit.
                      This allows the receiver to eliminate the redundancy per bit while clearing the BPSK constellation symbol.
                      All is left to do is to decode the BPSK constellation.
                      The receiver does this by mapping all values greater than 0 to 1 and the remaining ones to 0.
                    </p>
                    <p>
                      The samples that the filter is applied to are highlighted with yellow in the left graph.
                    </p>
                    <p>
                      The result of the filter is depicted with green in the right plot, while the downsampling is depicted as red dots.
                    </p>
                  </Col>
                </Row>
                <h2>The plots</h2>
                <Row>
                  <Col md="6">
                    <h3>Left plot</h3>
                    <p align="left">
                      The left plot represents the communication channel.
                      The transmitted signal is represented in blue.
                      The received signal is represented in red.
                      The samples being filtered are represented in yellow.
                    </p>
                    <p align="left">
                      The signal leaves the transmitter clean (blue line).
                      Then it encounters the channel getting the noise and becoming distorted (red line).
                      Finally, it reaces the receiver and gets prepared to be filtered (yellow).
                    </p>
                  </Col>
                  <Col md="6">
                    <h3>Right plot</h3>
                    <p align="left">
                      The right plot represents the decoding at the receiver.
                      The filtered received signal is represented with blue.
                      The downsampling is represented with red markers.
                    </p>
                    <p align="left">
                      The signal in the receiver gets filtered becoming the green line.
                      Then it goes through a subsampling, only selecting one out of each number of samples per bit (red markers).
                    </p>
                  </Col>
                </Row>
                <h2>The table</h2>
                <p align="left">
                  The table compares the transmitted bits against the decoded ones.
                  Note there's a delay between the transmitted bits and the decoded ones, this is due to representation purposes we have considered the time the signal takes to travel from the transmitter to the receiver.
                  In practice, for coding/decoding purposes we can consider that the receiver receives the signal being transmitted instantly.
                </p>
                <p align="left">
                  The first row containts the true value of the transmitted bits.
                  The second row contains the bit as decoded by the receiver.
                  The last row indicates if there's a bit error, this is a missmatch between the first and second row.
                </p>
                <h2>Take-aways</h2>
                <p align="left">
                  It's interesting to see how by increasing the signal to noise ratio, the bit decoding error decrease, same as for the samples per bit.
                  Another thing to note is that a shorter number of sampled per bit allows us to communicate a higher amount of bits at the cost of higher error.
                  This translates as a trade-off between bits transmitted per second and signal to noise ratio.
                  As the signal to noise increases, the bit error probabilty decreses allowing us to decrease the number of samples per bit thus increasing the bits per second while mantaining the bit error probability stable.
                </p>
                <p align="left">
                  Try to increase the signal to noise ratio and decrease the number of samples per bit to balance into a nice bit error probabilty, you will see how the number of bits per second increases.
                </p>
                <p align="left">
                  Note: due to the time delay between the transmitted signal and the received one it takes a while until the changes to the parameters take effect.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
