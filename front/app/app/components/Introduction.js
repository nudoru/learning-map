import React from 'react';

const Introduction = ({text, newOrUpdated}) => {
  const neworupdatedList = newOrUpdated.length ? (
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

export default Introduction;