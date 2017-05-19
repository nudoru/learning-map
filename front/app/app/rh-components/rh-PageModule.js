import React from 'react';

const PageModule = ({style, title, headline, children, className}) => {

  /*
   <div className="rh-page-module-cta">
   <button className="rh-button">Read more</button>
   </div>
   */

  style    = 'rh-page-module' + (style ? ' rh-page-module-' + style : '') + +' ' + className;
  title    = title ? (
    <h1 className="rh-page-module-title">{title}</h1>) : (
    <div></div>);
  headline = headline ? (
    <h2
      className="rh-page-module-headline">{headline}</h2>) : (
    <div></div>);

  return (<div className={style}>
    <div className="page-container">
      {title}
      {headline}
      {children}
    </div>
  </div>);
};

export default PageModule;