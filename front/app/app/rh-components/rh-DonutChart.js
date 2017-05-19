import React from 'react';

// Donut Chart implementation from this pen http://codepen.io/zeroskillz/pen/mPmENy

const DonutChart = React.createClass({
  propTypes: {
    value      : React.PropTypes.number,        // value the chart should show
    valuelabel : React.PropTypes.string,   // label for the chart
    size       : React.PropTypes.number,         // diameter of chart
    strokewidth: React.PropTypes.number,   // width of chart line
    className  : React.PropTypes.string
  },
  getDefaultProps() {
    return {
      value      : 0,
      valuelabel : '',
      size       : 75,
      strokewidth: 5,
      className  : ''
    };
  },
  render() {

    let halfsize       = (this.props.size * 0.5),
        radius         = halfsize - (this.props.strokewidth * 0.5),
        circumference  = 2 * Math.PI * radius,
        strokeval      = ((this.props.value * circumference) / 100),
        dashval        = (strokeval + ' ' + circumference),
        trackstyle     = {strokeWidth: this.props.strokewidth},
        indicatorstyle = {
          strokeWidth    : this.props.strokewidth,
          strokeDasharray: dashval
        },
        rotateval      = 'rotate(-90 ' + halfsize + ',' + halfsize + ')',
        valY           = this.props.valuelabel.length ? halfsize : halfsize + 7,
        labelY         = halfsize + 15;

    return (
      <svg width={this.props.size} height={this.props.size}
           className={'rh-donutchart ' + this.props.className}>
        <circle r={radius} cx={halfsize} cy={halfsize} transform={rotateval}
                style={trackstyle} className="rh-donutchart-track"/>
        <circle r={radius} cx={halfsize} cy={halfsize} transform={rotateval}
                style={indicatorstyle} className="rh-donutchart-indicator"/>
        <text className="rh-donutchart-text" x={halfsize} y={halfsize}
              style={{textAnchor: 'middle'}}>
          <tspan className="rh-donutchart-text-val" x={halfsize}
                 y={valY}>{this.props.value}</tspan>
          <tspan className="rh-donutchart-text-percent">%</tspan>
          <tspan className="rh-donutchart-text-label" x={halfsize}
                 y={labelY}>{this.props.valuelabel}</tspan>
        </text>
      </svg>
    );
  }
});

export default DonutChart;