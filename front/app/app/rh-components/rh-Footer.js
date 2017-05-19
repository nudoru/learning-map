import React from 'react';

export const Footer = ({children}) => {

  return (
    <div className="footer-region">
      <div className="page-container">
        {children}
        <div className="footer-disclaimer">
          <p>Copyright ©{(new Date()).getFullYear()} Red Hat, Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;