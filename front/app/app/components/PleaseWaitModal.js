import React from 'react';
import IconCircle from '../rh-components/rh-IconCircle';
import ModalMessage from '../rh-components/rh-ModalMessage';

export const PleaseWaitModal = ({message}) => {
  return (<div>
    <ModalMessage error={false} dismissible={false}>
      <div className="rh-login">
        <IconCircle icon="user"/>
        <h1>{message}</h1>
        <i className="fa fa-spinner fa-pulse fa-2x fa-fw"/>
      </div>
    </ModalMessage>
  </div>)
};