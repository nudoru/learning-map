import React from 'react';
import ModalCover from './rh-ModalCover';
import { Panel } from './rh-Panel';

const ModalPanel = ({modal = {}, panel = {}}) => {
  return (
    <div className="rh-popup-container">
      <ModalCover {...modal}/>
      <div className="full-window-cover-center">
        <Panel {...panel}>
          {this.props.children}
        </Panel>
      </div>
    </div>
  );
};

export default ModalPanel;