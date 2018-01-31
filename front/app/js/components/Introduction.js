import React from 'react';

const Introduction = ({text, instructions, newOrUpdated}) => {
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
        <section className="introduction">
          {text ? <div className="introduction-text"
                       dangerouslySetInnerHTML={{__html: text}}></div> : null}
          {instructions ? <div className="instructions-text"
                               dangerouslySetInnerHTML={{__html: instructions}}></div> : null}
          {neworupdatedList}
        </section>
      </div>
    </div>
  )
};

export default Introduction;