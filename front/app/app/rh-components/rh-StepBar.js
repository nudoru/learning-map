import React from 'react';

// Origionally based on https://codepen.io/alexerlandsson/pen/KzLXvL

export const StepBar = ({children}) => {
  return (
    <ul className="rh-stepbar">
      {children}
    </ul>
  );
};

export const StepBarItem = ({current, children}) => {
  const cls = 'stepbar-item' + (current ? ' current' : '');
  return (<li className={cls}>
    <span className="stepbar-link">{children}</span>
  </li>);
};

export const StepBarLink = ({current, link = '#', children}) => {
  const cls = 'stepbar-item' + (current ? ' current' : '');
  return (<li className={cls}>
    <a href={link} className="stepbar-link">{children}</a>
  </li>);
};
