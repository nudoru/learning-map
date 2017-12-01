import React from 'react';
import ModalCover from './rh-ModalCover';
import PopupSimple from './rh-PopupSimple';

/**
 * Simple modal message cover
 * <ModalMessage
 modal={{
      dismissible: true,
      dismissFunc: () => {}
    }}
 message={{
      title        : 'Complete',
      icon         : 'check-circle-o',
      buttonLabel  : 'Continue',
      buttonOnClick: () => {}
    }}>
 <p>You've completed all activities required for accreditation!</p>
 </ModalMessage>
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