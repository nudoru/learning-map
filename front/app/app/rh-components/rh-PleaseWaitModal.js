import React from 'react';
import ModalMessage from './rh-ModalMessage';
import Spinner from './rh-Spinner';

const PleaseWaitModal = ({title, icon='cog', children}) => {
  return (<ModalMessage message={{title: title, icon: 'cog'}}>
    {children}
    <Spinner type="spinner-lg"/>
  </ModalMessage>)
};

export default PleaseWaitModal;