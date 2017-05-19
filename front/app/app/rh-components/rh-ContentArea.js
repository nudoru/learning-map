import React from 'react';

class ContentArea extends React.Component {

  render() {
    return (
      <div className="content-region">
        <div className="page-container">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default ContentArea;