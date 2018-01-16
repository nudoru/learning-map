import React from 'react';

const styleMap = ['none', 'inprogress', 'danger', 'success', 'pending'];
const iconMap  = ['circle-o', 'hourglass-2', 'times', 'check', 'refresh'];

export const StatusIcon = ({type}) => {
  //let index = styleMap.indexOf(type);
  let index = type; // for backwards compat w/ old learning map code

  return (
    <div className={'rh-statusicon rh-statusicon-' + styleMap[index]}>
      <i className={'fa fa-' + iconMap[index]}/>
    </div>
  );
};

export const StatusIconTiny = ({type}) => {
  let index = styleMap.indexOf(type);

  return (
    <div className={'rh-statusicon-tiny rh-statusicon-' + styleMap[index]}>
      <i className={'fa fa-' + iconMap[index]}/>
    </div>
  );
};