import React from 'react';

const Panel = (props) => {

  let panelClass = ['rh-panel'],
      header, footer;

  if (props.title || props.icon || props.utilityButtons) {
    header = <PanelHeader {...props}/>;
  }

  if (props.footerNote || props.actionButtons) {
    footer = <PanelFooter {...props}/>;
  }

  return (<section className={panelClass.join(' ')}>
    {header}
    <div className="rh-panel-content">
      {props.children}
    </div>
    {footer}
  </section>);
};

export default Panel;

export const PanelHeader = ({title, icon, utilityButtons}) => {
  let headerIcon = icon ?
    <div className="rh-panel-header-icon"><i className={'fa fa-' + icon}/>
    </div> : null;

  return (<div className="rh-panel-header">
    {headerIcon}
    <div className="rh-panel-header-label">
      <h1>{title}</h1>
    </div>
    <div className="rh-panel-header-buttons">
      {utilityButtons ? utilityButtons.map(b => b) : null}
    </div>
  </div>);
};

export const PanelFooter = ({footerNote, actionButtons}) => {
  return (<div className="rh-panel-footer">
    <h1>{footerNote}</h1>
    <div className="rh-panel-footer-buttons">
      {actionButtons ? actionButtons.map(b => b) : null}
    </div>
  </div>);
};