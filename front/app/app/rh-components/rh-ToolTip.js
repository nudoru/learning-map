import React from 'react'

const ToolTip = ({position, style, label, children}) => {
  let cls = ['tooltip-'+position].concat([style]);

  return (
    <span className={cls.join(' ')} aria-label={label}>{children}</span>
  )
};

export default ToolTip;