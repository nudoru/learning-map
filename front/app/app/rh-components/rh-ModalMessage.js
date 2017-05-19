import React from 'react';
import ModalCover from './rh-ModalCover';
import PopupSimple from './rh-PopupSimple';

/**
 * Simple modal message cover
 */

const ModalMessage = ({modal, message, children}) => {
  return (
    <div className="rh-popup-container">
      <ModalCover {...modal}/>
      <div className="full-window-cover-center">
        <PopupSimple {...message}>
          {children}
        </PopupSimple>
      </div>
    </div>
  );
};

export default ModalMessage;