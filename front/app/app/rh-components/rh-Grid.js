/*
 Flexbox grid
 https://github.com/kristoferjoseph/flexboxgrid
 */

import React from 'react';

export const Grid = props => {
  return <div {...props}/>;
};

export const Row = ({children, modifier, className, ...rest}) => {
  let cls = 'fxgrid-row';
  if (modifier) {
    cls += ' ' + modifier;
  }
  if (className) {
    cls += ' ' + className;
  }
  return <div className={cls} {...rest}>{children}</div>;
};

export const Col = ({width, children, modifier, className, ...rest}) => {
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
  return <div className={cls} {...rest}>{children}</div>;
};