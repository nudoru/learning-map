import React from 'react';

const styleMap = ['none', 'inprogress', 'fail', 'pass', 'pending'];
const iconMap  = ['circle-o', 'play', 'times', 'check', 'refresh'];

export const StatusIcon = ({status}) => {

  status = status || 0;

  return (
    <div className={'rh-statusicon rh-statusicon-' + styleMap[status]}>
      <i className={'fa fa-' + iconMap[status]}/>
    </div>
  );
};

export const StatusIconTiny = ({status}) => {

  status = status || 0;

  return (
    <div className={'rh-statusicon-tiny rh-statusicon-' + styleMap[status]}>
      <i className={'fa fa-' + iconMap[status]}/>
    </div>
  );
};