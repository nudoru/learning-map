import React from 'react';

const ProgramEnrollment = ({enrolledMessage, goEnrollMessage, goEnrollLink, isEnrolled}) => {
    let showedMessage;
    if (isEnrolled) {
        showedMessage = <div className="enrollment-text"
                             dangerouslySetInnerHTML={{__html: enrolledMessage}}></div>

    } else {
        showedMessage = <a href={goEnrollLink} target="_blank">
            <div className="enrollment-text"
                 dangerouslySetInnerHTML={{__html: goEnrollMessage}}></div>
        </a>
    }

    return (
        <div className="content-region">
            <div className="page-container">
                <section className="enrollment">
                    <h3>Program Enrollment</h3>
                    {showedMessage}
                </section>
            </div>
        </div>
    )
};

export default ProgramEnrollment;