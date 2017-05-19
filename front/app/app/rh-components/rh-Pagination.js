import React from 'react';
import {fillIntArray} from '../utils/Toolbox';

const Pagination = ({
  prev = false,
  next = true,
  start = 1,
  end = 5,
  current = 1
}) => {

  let numbers = fillIntArray(start, end);

  prev = prev ? (
      <a href="#"><i className="fa fa-step-backward"/></a>) : (
      <span className="disabled"><i className="fa fa-step-backward"/></span>);

  next = next ? (
      <a href="#"><i className="fa fa-step-forward"/></a>) : (
      <span className="disabled"><i
        className="fa fa-step-forward"/></span>);


  return (<div className="rh-pagination">
    <ul>
      <li>{prev}</li>
      {
        numbers.map((n) => {
          return (n === current ?
            (<li><span className="active">{n}</span></li>) :
            (<li><a href="#">{n}</a></li>))
        })
      }
      <li>{next}</li>
    </ul>
  </div>);
};

export default Pagination;