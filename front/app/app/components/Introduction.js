import React from 'react';
import {connect} from 'react-redux';

const Introduction = ({text, newOrUpdated}) => {
  let neworupdatedList = newOrUpdated.length ? (
      <div><h2>What's new and updated</h2><ul className="introduction-list-newcontent">
        {
          newOrUpdated.map(title => <li>{title}</li>)
        }
      </ul></div>
    ) : null;

  return (
    <div className="content-region">
      <div className="page-container">
        <div className="introduction">
          <div className="text-summary"
               dangerouslySetInnerHTML={{__html: text}}></div>
          {neworupdatedList}
        </div>
      </div>
    </div>
  )
};

const mapStateToProps = state => {
  return {
    text: state.config.currentStructure.introduction
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Introduction);