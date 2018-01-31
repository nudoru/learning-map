import React from 'react';

const Spinner = ({type}) => {
  let cls = ['spinner'];

  if(type) {
    cls.push(type);
  }

  return (<div className={cls.join(' ')}></div>)
};

export default Spinner;