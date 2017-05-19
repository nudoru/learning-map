/*
 Flexbox grid
 https://github.com/kristoferjoseph/flexboxgrid
 */

import React from 'react';

export const Grid = ({children}) => {
  // className="fxgrid-container-fluid"
  return <div>{children}</div>;
};

export const Row = ({children, modifier, className}) => {
  let cls = 'fxgrid-row';
  if (modifier) {
    cls += ' ' + modifier;
  }
  if (className) {
    cls += ' ' + className;
  }
  return <div className={cls}>{children}</div>;
};

export const Col = ({width, children, modifier, className}) => {
  let cls = 'col-xs';
  if (width) {
    cls += '-' + width;
  }
  if (modifier) {
    cls += ' ' + modifier;
  }
  if (className) {
    cls += ' ' + className;
  }
  return <div className={cls}>{children}</div>;
};