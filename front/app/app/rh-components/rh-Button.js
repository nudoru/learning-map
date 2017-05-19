import React from 'react';

export const ButtonHRow   = ({children}) => <div
  className="rh-button-container-horiz">{children}</div>;
export const ButtonHGroup = ({children}) => <div
  className="rh-button-group-horiz">{children}</div>;
export const ButtonVGroup = ({children}) => <div
  className="rh-button-group-vert">{children}</div>;

const NOOP = () => {
};

/*
 style = secondary, neutral, hollow
 */
const buttonMaker = ({children, style, small, text, hollow, icon, block, disabled, onClick = NOOP, className='', ...other}) => {
  let cls = 'rh-button' + (style ? ' rh-button-' + style : '');
  if (text) {
    if(!style) {
      cls += ' rh-button';
    }
    cls += '-text';
  } else if(hollow) {
    if(!style) {
      cls += ' rh-button';
    }
    cls += '-hollow';
  }
  if (small) {
    cls += ' rh-button-small';
  }
  if(icon) {
    cls += ' rh-button-icon';
  }
  if(block) {
    cls += ' rh-button-block';
  }
  if(disabled) {
    cls += ' disabled';
    if(onClick) {
      onClick = NOOP;
    }
  }

  cls += ' '+className;

  return <button onClick={onClick} className={cls} {...other}>{children}</button>;
};

export const Button = (props) => {
  const {style='', ...other} = props;
  return buttonMaker({style, ...other});
};

export const SecondaryButton = (props) => {
  const {style='secondary', ...other} = props;
  return buttonMaker({style, ...other});
};

export const NeutralButton = (props) => {
  const {style='neutral', ...other} = props;
  return buttonMaker({style, ...other});
};

export const NegativeButton = (props) => {
  const {style='negative', ...other} = props;
  return buttonMaker({style, ...other});
};