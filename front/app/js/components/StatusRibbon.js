import React from 'react';

const styleMap = ['none', 'inprogress', 'danger', 'success', 'pending'];
const iconMap  = ['circle-o', 'hourglass-2', 'times', 'check', 'refresh'];

export const StatusRibbonTop = ({type, position, className = ''}) => {
  let index = type;

  return (
    <div className={'status-ribbon-top-' + styleMap[index] + ' ' + className}>
      <span>
        <i className={'fa fa-' + iconMap[index]}/>
      </span>
    </div>
  );
};

export const StatusRibbonLeft = ({type, position, className = ''}) => {
  let index = type;

  return (
    <div className={'status-ribbon-left-' + styleMap[index] + ' ' + className}>
      <span>
        <i className={'fa fa-' + iconMap[index]}/>
      </span>
    </div>
  );
};
