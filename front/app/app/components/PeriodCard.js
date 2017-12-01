import React from 'react';
import {
  contentLinkWithId, contentTitleToLink,
  isPeriodComplete
} from '../store/selectors';
import {Tag, TagHGroup} from '../rh-components/rh-Tag';
import {StatusIcon, StatusIconTiny} from '../rh-components/rh-StatusIcon';
import IconCircleText from '../rh-components/rh-IconCircleText';
import {TextArea} from "../rh-components/rh-Form";
import {Col, Grid, Row} from "../rh-components/rh-Grid";
import {Button} from "../rh-components/rh-Button";
import {XAPILink} from "./xAPILink";
import {XAPIToggle} from "./xAPIToggle";

//------------------------------------------------------------------------------
// Card showing the week information, overall completion icon, and courses
//------------------------------------------------------------------------------

export const PeriodCard = (periodObj) => {
  let {
        config,
        currentStructure,
        title,
        category,
        period,
        summary,
        activities,
        startDateDisplay,
        endDateDisplay,
        children,
        timePeriod
      }               = periodObj,
      cardStyle       = ['period'],
      activitiesLabel = activities === 1 ? 'Activity' : 'Activities',
      tagRow          = null,
      activitiesEl    = activities ? (
        <Tag><em>{activities}</em> {activitiesLabel}</Tag>) : null,
      startEl         = startDateDisplay ? (
        <Tag>Begins <em>{startDateDisplay}</em></Tag>) : null,
      endEl           = endDateDisplay ? (
        <Tag>Ends <em>{endDateDisplay}</em></Tag>) : null;

  if (timePeriod === -1) {
    cardStyle.push('period-past');
  } else if (timePeriod === 0) {
    cardStyle.push('period-current');
  } else if (timePeriod === 1) {
    cardStyle.push('period-future');
  }

  if (config.setup.interface.showDateOnPeriod) {
    tagRow = <TagHGroup>{startEl}{endEl}{activitiesEl}</TagHGroup>;
  } else {
    tagRow = <TagHGroup>{activitiesEl}</TagHGroup>;
  }

  return (
    <div className="content-region">
      <div className="page-container">

        <div className={cardStyle.join(' ')} id={'period' + period}>
          <div className="period-indicator">
            <IconCircleText label={period}/>
            <span className="period-indicator-label">{category}</span>
          </div>
          <h1>{title}{isPeriodComplete(periodObj) ?
            <StatusIconTiny type="success"/> : ''}</h1>
          <div className="margin-bottom">
            {tagRow}
          </div>
          <div className="text-summary"
               dangerouslySetInnerHTML={{__html: summary}}></div>
          <div className="instructions"
               dangerouslySetInnerHTML={{__html: currentStructure.instructions}}></div>
          {children}
        </div>
      </div>
    </div>);
};

//------------------------------------------------------------------------------
// Topic area on the card
//------------------------------------------------------------------------------

export const PeriodTopicCard = (topicObj) => {
  let {title, summary, children} = topicObj;

  return (<div className="period-topic">
    <h1>{title}</h1>
    <div className="text-summary"
         dangerouslySetInnerHTML={{__html: summary}}></div>
    <table className="rh-custom-table">
      <thead>
      <tr>
        <td>Progress</td>
        <td>Activity</td>
        <td>Completion</td>
        <td>Description</td>
      </tr>
      </thead>
      {children}
    </table>
  </div>);
};

//------------------------------------------------------------------------------
// Row in the content table
//------------------------------------------------------------------------------

export const ContentRow = (props) => {

  const {isRequired, summary, reflection, reflectionPrompt} = props.contentObj;
  let rowClass                                              = [];

  if (isRequired) {
    rowClass.push('details-required-row');
  }

  return <tr className={rowClass.join(' ')}>
    <StatusCell {...props} />
    <NameCell {...props} />
    <ToggleCell {...props} />
    <DescriptionCell summary={summary} reflection={reflection}
                     reflectionPrompt={reflectionPrompt}/>
  </tr>;
};

const StatusCell = ({status}) => {
  return <td className='details-course-status'>
    <StatusIcon type={status}/>
  </td>;
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
    nameElement = <p data-contentid={contentObj.id}
                     dangerouslySetInnerHTML={{__html: contentObj.title}}></p>;
  }

  return <td className="details-course-name">
    {nameElement}{newOrUpdated}{required}
    <TagHGroup
      className="margin-top">{tagModType}{tagDuration}{tagStatus}</TagHGroup>
  </td>;
};

const ToggleCell = ({onCompletedClick, contentObj}) => {
  let completionToggle, toggleId;

  if (contentObj.requireConfirm) {
    if (!contentObj.contentLink) {
      // Use the "linkified" title for the link
      toggleId = contentTitleToLink(contentObj.title, contentObj.id);
    } else {
      // Make it unique
      toggleId = contentLinkWithId(contentObj.contentLink, contentObj.id);
    }

    completionToggle = (<div>
      <XAPIToggle
        id={toggleId}
        title={contentObj.title}
        disabled={contentObj.isComplete}
        complete={contentObj.isComplete}
        onClick={onCompletedClick}
      />
    </div>);
  } else if (contentObj.lmsID) {
    completionToggle =
      <p className="small">Completion determined on the LMS.</p>;
  } else if (contentObj.hasOwnProperty('allegoID')) {
    completionToggle =
      <p className="small">Completion determined on Allego.</p>;
  }

  return (<td className="details-completion">
    {completionToggle}
  </td>);
};

const DescriptionCell = ({summary, reflection, reflectionPrompt}) => {
  const reflectionInput = reflection ? <ReflectionInput disabled={false}
                                                        reflectionPrompt={reflectionPrompt}/> : null;

  return <td className="details-course-description">
    <p dangerouslySetInnerHTML={{__html: summary}}></p>
    {reflectionInput}
  </td>;
};

const ReflectionInput = ({reflectionPrompt, disabled}) => {
  return <Grid className='reflection-group padding-top'><Row>
    <Col>
      <p className='reflection-prompt'>{reflectionPrompt}</p>
      <TextArea className='reflection-text-area'/>
    </Col>
  </Row>
    <Row><Col
      className='text-right padding-top'><Button>Save</Button></Col></Row>
  </Grid>
};

