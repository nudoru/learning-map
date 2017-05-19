import React from 'react';

export const BlockLinkHGroup = ({style = 'white', children}) => <ul
  className={'block-links-' + style + ' block-links-horizontal'}>{children}</ul>;

export const BlockLinkVGroup = ({style = 'white', children}) => <ul
  className={'block-links-' + style + ' block-links-vertical'}>{children}</ul>;

export const BlockLink = ({label, byline, link, children}) => <li><a
  href={link}>{label}{byline ? <em>{byline}</em> : null}</a>{children ?
  <span className="children">{children}</span> : null}</li>;