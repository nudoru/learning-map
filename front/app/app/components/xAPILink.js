import React from 'react';
import {curry} from 'ramda';
import {
  sendLinkStatement
} from './LRSProvider';

const handleClick = curry((title, id, onClick, evt) => {
  // console.log('handle xapi link click',title, id);
  sendLinkStatement(title, id);
  if(onClick) {
    onClick({title, id});
  }
});

export const XAPILink = ({href, id, onClick, children}) =>
  <a href={href}
     target="_blank"
     onClick={handleClick(children, id, onClick)}
     dangerouslySetInnerHTML={{__html: children}} />;
