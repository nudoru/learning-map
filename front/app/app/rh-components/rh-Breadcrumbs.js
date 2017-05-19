import React from 'react';

const Breadcrumbs =({crumbs}) => {
    return (
    <div  className='rh-breadcrumbs-container'>
      <ul className="rh-breadcrumbs">
        {
          crumbs.map((item, i) => {
            let crumb = item.route ? (
              <li key={i}><a href={item.route}>{item.label}</a></li>) :
              (<li key={i}>{item.label}</li>);
            return crumb;
          })
        }
      </ul>
    </div>
    );
};

export default Breadcrumbs;