import React from 'react';
import Toggle from 'react-toggle';
import { isPeriodComplete } from '../store/selectors';
import { Tag, TagHGroup } from '../rh-components/rh-Tag';
import { StatusIcon, StatusIconTiny } from '../rh-components/rh-StatusIcon';
import IconCircleText from '../rh-components/rh-IconCircleText';

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
          <div className="margin-bottom-triple">
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

  let {contentObj} = props,
      rowClass     = [];

  if (contentObj.isRequired) {
    rowClass.push('details-required-row');
  }

  return (
    <tr className={rowClass.join(' ')}>
      <StatusCell {...props} />
      <NameCell {...props} />
      <ToggleCell {...props} />
      <DescriptionCell summary={contentObj.summary}/>
    </tr>
  );
};

const StatusCell = ({status}) => {
  return (<td className='details-course-status'>
    <StatusIcon type={status}/>
  </td>);
};

const NameCell = ({modType, modIcon, modNote, onLinkClick, contentObj}) => {
  let nameElement, required, newOrUpdated,
      tagModType  = modType ?
        <Tag><i className={'fa fa-' + modIcon}/>{modType}</Tag> : null,
      tagDuration = contentObj.duration ?
        <Tag>{contentObj.duration}</Tag> : null,
      tagStatus   = modNote ? <Tag>{modNote}</Tag> : null;

  if (contentObj.contentLink) {
    // TODO should it send a statement anyway?
    //contentObj.requireConfirm ? null :
    nameElement = <a href={contentObj.contentLink} target="_blank"
                     data-contenturl={contentObj.contentLink}
                     data-contentname={contentObj.title}
                     data-contentid={contentObj.id}
                     onClick={onLinkClick}
                     dangerouslySetInnerHTML={{__html: contentObj.title}}></a>;
  } else {
    nameElement = <p data-contentid={contentObj.id}
                     dangerouslySetInnerHTML={{__html: contentObj.title}}></p>;
  }

  if (contentObj.isRequired) {
    required = <i className="details-course-name-required fa fa-asterisk"/>;
  }

  newOrUpdated = <span
    className="details-course-name-newOrUpdated">{contentObj.isNew ? ' (New) ' : (contentObj.isUpdated ? ' (Updated) ' : null)}</span>;

  return (<td className="details-course-name">
    {nameElement}{newOrUpdated}{required}
    <TagHGroup className="margin-top">{tagModType}{tagDuration}{tagStatus}</TagHGroup>
  </td>);
};

const ToggleCell = ({onCompletedClick, contentObj}) => {
  let completionToggle;

  if (contentObj.requireConfirm) {
    completionToggle = (<div>
      <label>
        <Toggle
          data-contenturl={contentObj.contentLink}
          data-contentname={contentObj.title}
          data-contentid={contentObj.id}
          defaultChecked={contentObj.isComplete}
          disabled={contentObj.isComplete}
          onChange={onCompletedClick}/>
        <span
          className="toggle-label">{contentObj.isComplete ? 'Completed' : 'Mark complete'}</span>
      </label>
    </div>);
  } else if (contentObj.lmsID) {
    completionToggle =
      <p className="small">Completion determined on the LMS.</p>;
  }

  return (<td className="details-completion">
    {completionToggle}
  </td>);
};

const DescriptionCell = ({summary}) => {
  return (<td className="details-course-description">
    <p dangerouslySetInnerHTML={{__html: summary}}></p>
  </td>);
};

