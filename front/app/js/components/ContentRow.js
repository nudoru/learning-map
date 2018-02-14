import React from 'react';
import {contentLinkWithId, contentTitleToLink} from '../store/selectors';
import {Tag, TagHGroup} from '../rh-components/rh-Tag';
import {StatusRibbonLeft, StatusRibbonTop} from "./StatusRibbon";
import {XAPILink} from "./xAPILink";
import {XAPIToggle} from "./xAPIToggle";
import {XAPITextArea} from "./xAPITextArea";
import {Col, Row} from "../rh-components/rh-Grid";

// TODO generalize for new interaction obj
// Unclear if we'll need to accomodate other interaction types beyond a text entry,
// but use a general "interaction" term just in case
const hasXapiInteraction = contentObj => contentObj.hasOwnProperty("interaction");

const onXapiInteractionComplete = ({id, response}) => console.log('xAPI interaction completed', id, response);

export const ContentRow = props => {
    let rowCls = ['learning-map-row'];

    if (props.status === 3) {
        rowCls.push('learning-map-row-complete')
    } else {
        rowCls.push('learning-map-row-incomplete')
    }

    return <Row className={rowCls.join(' ')}>
        <RibbonCell {...props} />
        <NameCell {...props} />
        <DescriptionCell {...props}/>
        {hasXapiInteraction(props.contentObj) ? null : <StatusCell {...props} />}
    </Row>;
};

const RibbonCell = ({status}) => <Col className="learning-map-col details-ribbon">
    <StatusRibbonLeft className='details-ribbon-left' type={status}/>
    <StatusRibbonTop className='details-ribbon-top' type={status}/>
</Col>;

const NameCell = ({modType, modIcon, onLinkClick, contentObj}) => {
    let nameElement;

    const requiredMark = contentObj.isRequired ? <i className="details-course-name-required fa fa-asterisk"/> : null;

    const tagModType = modType ?
        <Tag><i className={'fa fa-' + modIcon}/>{modType}</Tag> : null;

    const tagDuration = contentObj.duration ?
        <Tag><i className='fa fa-clock-o'/>{contentObj.duration}</Tag> : null;

    const newOrUpdated = <span
        className="details-course-name-newOrUpdated">{contentObj.isNew ? ' (New) ' : (contentObj.isUpdated ? ' (Updated) ' : null)}</span>;

    if (contentObj.contentLink) {
        // The content id is appended to the link to generate the id so that it's unique.
        // The same link could be used for more than one content item
        nameElement = <XAPILink
            href={contentObj.contentLink}
            id={contentLinkWithId(contentObj.contentLink, contentObj.id)}
            onClick={onLinkClick}>
            {contentObj.title}
        </XAPILink>
    } else {
        nameElement = <span
            dangerouslySetInnerHTML={{__html: contentObj.title}}></span>;
    }

    return <Col className="learning-map-col details-course-name">
        <Row>
            <Col className='details-course-name-mark'>{requiredMark}</Col>
            <Col className='details-course-name-label'>{nameElement}{newOrUpdated}</Col>
        </Row>
        <Row>
            <Col>
                <TagHGroup>{tagModType}{tagDuration}</TagHGroup>
            </Col>
        </Row>
    </Col>;
};

const StatusCell = ({onCompletedClick, contentObj, status}) => {
    let statusMarker, toggleId;

    if (status === 3) {
        statusMarker = <div className='status-group'><span className='status-label'>Completed</span></div>;
    } else {
        if (contentObj.requireConfirm) {
            if (!contentObj.contentLink) {
                // Use the "slugified" title for the link
                toggleId = contentTitleToLink(contentObj.title, contentObj.id);
            } else {
                // Make it unique
                toggleId = contentLinkWithId(contentObj.contentLink, contentObj.id);
            }
            statusMarker = (<div>
                <XAPIToggle
                    id={toggleId}
                    title={contentObj.title}
                    disabled={contentObj.isComplete}
                    complete={contentObj.isComplete}
                    onClick={onCompletedClick}
                />
            </div>);
        } else if (contentObj.lmsID) {
            if (status === 1) {
                statusMarker = <div className='status-group'><span className='status-label'>In progress</span></div>;
            } else {
                statusMarker = <div className='status-group'><span className='status-label'>Not enrolled</span></div>;
            }
        } else if (contentObj.hasOwnProperty('allegoID')) {
            statusMarker =
                <div className='status-group'><span className='status-label'>Complete activity on Allego</span></div>;
        }
    }

    return <Col className="learning-map-col details-completion">
        <div className='details-completion-marker'>
            {statusMarker}
        </div>
    </Col>;
};

// This is either the description of the content object or an xAPI interaction
const DescriptionCell = ({contentObj}) => {
    let xapiInteraction = null;


    if (contentObj.hasOwnProperty("interaction")) {
        let refId;
        if (!contentObj.contentLink) {
            // Use the "slugified" title for the link
            refId = contentTitleToLink(contentObj.title, contentObj.id);
        } else {
            // Make it unique
            refId = contentLinkWithId(contentObj.contentLink, contentObj.id);
        }


        //previousResponse={}
        xapiInteraction =
            <XAPITextArea prompt={contentObj.interaction.prompt} disabled={false}
                          id={refId} onSave={onXapiInteractionComplete}/>;
    }

    return <Col className="learning-map-col details-course-description">
        <p dangerouslySetInnerHTML={{__html: contentObj.summary}}></p>
        {xapiInteraction}
    </Col>;
};
