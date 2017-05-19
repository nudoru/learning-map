import React from 'react';
import IconCircle from '../rh-components/rh-IconCircle';
import {Button} from '../rh-components/rh-Button';

const Popupsimple = ({
  title,
  error,
  buttonOnClick = () => {
  },
  buttonLabel,
  icon,
  children
}) => {

  let content,
      boxClass = ['rh-popup-simple'],
      button   = buttonLabel ? (
          <Button text block onClick={buttonOnClick}>{buttonLabel}</Button>) : null;

  if (error) {
    boxClass.push('error');
  }
console.log('pop up simple')
  content = <div className={boxClass.join(' ')}>
    {icon ? <IconCircle icon={icon} /> : null}
    {title ? <h1>{title}</h1> : null}
    {children}
    {button}
  </div>;

  return content;
};

export default Popupsimple;