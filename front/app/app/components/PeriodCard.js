import React from 'react';
import {
  contentLinkWithId,
  contentTitleToLink,
  isPeriodComplete
} from '../store/selectors';
import {Tag, TagHGroup} from '../rh-components/rh-Tag';
import {StatusIcon, StatusIconTiny} from '../rh-components/rh-StatusIcon';
import IconCircleText from '../rh-components/rh-IconCircleText';
import {XAPILink} from "./xAPILink";
import {XAPIToggle} from "./xAPIToggle";
import {XAPITextArea} from "./xAPITextArea";
import {Col, Row} from "../rh-components/rh-Grid";

//------------------------------------------------------------------------------
// Card showing the week information, overall completion icon, and courses
//------------------------------------------------------------------------------

export const PeriodCard = periodObj => {
  let {
        config,
        category,
        period,
        summary,
        activities,
        startDateDisplay,
        endDateDisplay,
        children,
        timePeriod
      }               = periodObj,
      periodCls       = ['period'],
      activitiesLabel = activities === 1 ? 'Activity' : 'Activities',
      tagRow          = null,
      activitiesEl    = activities ? (
        <Tag><em>{activities}</em> {activitiesLabel}</Tag>) : null,
      startEl         = startDateDisplay ? (
        <Tag>Begins <em>{startDateDisplay}</em></Tag>) : null,
      endEl           = endDateDisplay ? (
        <Tag>Ends <em>{endDateDisplay}</em></Tag>) : null;

  // Disabled pending new styles MBP 12/6/17
  // if (timePeriod === -1) {
  //   periodCls.push('period-past');
  // } else if (timePeriod === 0) {
  //   periodCls.push('period-current');
  // } else if (timePeriod === 1) {
  //   periodCls.push('period-future');
  // }

  //{activitiesEl}
  if (config.setup.interface.showDateOnPeriod) {
    tagRow = <TagHGroup>{startEl}{endEl}</TagHGroup>;
  }

  return (
    <div className="content-region">
      <div className="page-container">
        <div className={periodCls.join(' ')} id={'period' + period}>
          <div className='period-header'>
            <Row className='period-title'
                 style={{justifyContent: 'flex-start', alignItems: 'center'}}>
              <Col style={{flex: 0, paddingRight: '22px'}}><IconCircleText
                label={period}/>{isPeriodComplete(periodObj) ?
                <div className='complete'><StatusIconTiny type="success"/>
                </div> : null}</Col>
              <Col style={{flex: 1}}>
                <h1>{category}</h1>
                <div>
                  {tagRow}
                </div>
                {summary ? <div className="text-summary margin-top"
                                dangerouslySetInnerHTML={{__html: summary}}></div> : null}
              </Col>
            </Row>
          </div>
          <div className='period-content'>
            {children}
          </div>
        </div>
      </div>
    </div>);
};

//------------------------------------------------------------------------------
// Topic area on the card
//------------------------------------------------------------------------------

export const PeriodTopicCard = ({title, summary, children}) => {
  return (<div className="period-topic">
    {title ? <h1>{title}</h1> : null}
    {summary ? <div className="text-summary"
                    dangerouslySetInnerHTML={{__html: summary}}></div> : null}
    <table className="rh-custom-table">
      {children}
    </table>
  </div>);
};

/*
<thead>
      <tr>
        <td>Progress</td>
        <td>Activity</td>
        <td>Completion</td>
        <td>Description</td>
      </tr>
      </thead>
 */

//------------------------------------------------------------------------------
// Row in the content table
//------------------------------------------------------------------------------

export const ContentRow = props => {

  const {isRequired} = props.contentObj;

  let rowClass = [];

  if (isRequired) {
    rowClass.push('details-required-row');
  }

  return <tr className={rowClass.join(' ')}>
    <NameCell {...props} />
    <DescriptionCell {...props}/>
    <StatusCell {...props} />
  </tr>;
};

const NameCell = ({modType, modIcon, modNote, onLinkClick, contentObj}) => {
  let nameElement;

  const tagModType  = modType ?
    <Tag><i className={'fa fa-' + modIcon}/>{modType}</Tag> : null;
  const tagDuration = contentObj.duration ?
    <Tag>{contentObj.duration}</Tag> : null;
  const tagStatus   = modNote ? <Tag>{modNote}</Tag> : null;

  const required = contentObj.isRequired ?
    <i className="details-course-name-required fa fa-asterisk"/> : null;

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

  return <td className="details-course-name">
    {required}{nameElement}{newOrUpdated}
    <TagHGroup
      className="margin-top">{tagModType}{tagDuration}{tagStatus}</TagHGroup>
  </td>;
};


const StatusCell = ({onCompletedClick, contentObj, status}) => {
  let statusMarker, toggleId;

  if (status === 3) {
    statusMarker = <div className='status-group'><StatusIcon type={status}/><span className='status-label'>Completed</span></div>;
  } else {
    if (contentObj.requireConfirm) {
      if (!contentObj.contentLink) {
        // Use the "linkified" title for the link
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
      if(status === 1) {
        statusMarker = <div className='status-group'><StatusIcon type={status}/><span className='status-label'>Inprogress</span></div>;
      } else {
        statusMarker = <div className='status-group'><StatusIcon type={status}/><span className='status-label'>Not enrolled</span></div>;
      }
    } else if (contentObj.hasOwnProperty('allegoID')) {
      statusMarker = <div className='status-group'><StatusIcon type={status}/><span className='status-label'>Complete activity on Allego</span></div>;
    }
  }


  return (<td className="details-completion">
    {statusMarker}
  </td>);
};

const DescriptionCell = ({contentObj}) => {
  let reflection = null;

  if (contentObj.reflection) {
    let refId;
    if (!contentObj.contentLink) {
      // Use the "linkified" title for the link
      refId = contentTitleToLink(contentObj.title, contentObj.id);
    } else {
      // Make it unique
      refId = contentLinkWithId(contentObj.contentLink, contentObj.id);
    }

    //previousResponse={}
    reflection =
      <XAPITextArea prompt={contentObj.reflectionPrompt} disabled={false}
                    id={refId} onSave={onReflectionSaved}/>;
  }

  //
  return <td className="details-course-description">
    <p dangerouslySetInnerHTML={{__html: contentObj.summary}}></p>
    {reflection}
  </td>;
};

const onReflectionSaved = ({id, response}) => console.log('Reflection saved', id, response);
