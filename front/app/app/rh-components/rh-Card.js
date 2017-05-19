import React from 'react';
import IconCircle from './rh-IconCircle';
import { Button } from './rh-Button';

export const CardHGroup = ({children}) => <div
  className='rh-card-container-horizontal'>{children}</div>;

export const CardHGroupDecorative = ({children}) => <div
  className='rh-card-container-horizontal-decorative'>{children}</div>;

export const CardHGroupTable = ({children}) => <div
  className='rh-card-container-horizontal-table'>{children}</div>;

export const CardVGroup = ({children}) => <div
  className='rh-card-container-vertical'>{children}</div>;

export const CardMasonry33Group = ({children}) => <div
  className='rh-card-container-masonry-33'>{children}</div>;

export const CardMasonry50Group = ({children}) => <div
  className='rh-card-container-masonry-50'>{children}</div>;

export const CardHeader = ({children, className, ...other}) => <div
  className={'rh-card-header ' + className} {...other}>{children}</div>;

export const CardHeaderControls = ({children, className, ...other}) => <div
  className={'rh-card-header-controls ' + className} {...other}>{children}</div>;

export const CardFooter = ({children, className, ...other}) => <div
  className={'rh-card-footer ' + className} {...other}>{children}</div>;

export const CardContent = ({children, className, ...other}) => <div
  className={'rh-card-content ' + className} {...other}>{children}</div>;

export const CardFrame = ({children, className, ...other}) => {
  return (<div className={'rh-card ' + className} {...other}>
    {children}
  </div>);
};

export const Card = ({
                       style = 'light',
                       title,
                       icon,
                       className,
                       children,
                       onClick,
                        hControls,
                       ctaLabel = 'Read More'
                     }) => {

  let needHeader = icon || title,
      titleCls,
      headerArea,
      hControlsArea,
      footerArea;

  if (needHeader) {
    titleCls   = icon ? 'rh-card-title-icon' : '';
    headerArea = (
      <CardHeader>
        {icon ? <IconCircle center icon={icon}/> : null}
        {title ? <h1 className={titleCls}>{title}</h1> : null}
      </CardHeader>
    );
  }

  if(hControls) {
    hControlsArea = <CardHeaderControls>{hControls}</CardHeaderControls>
  }

  if (onClick) {
    footerArea = (<CardFooter><Button text onClick={onClick}>{ctaLabel}</Button></CardFooter>);
  }

  style = 'rh-card rh-card-' + style + ' ' + className;

  return (<div className={style}>
    {headerArea}
    {hControlsArea}
    <CardContent>
      {children}
    </CardContent>
    {footerArea}
  </div>);
};