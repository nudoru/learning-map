import Task from 'data.task';
import { configSelector, userProfileSelector } from '../store/selectors';
import {
  requestAggregate,
  createAggregateQuery
}   from '../utils/learningservices/lrs/LRS';

export const fetchAllegoLRSStatements = () => {
  let config  = configSelector(),
      profile = userProfileSelector();

  if(config.webservice.hasOwnProperty('allegolrs')) {
    return requestAggregate(config.webservice.allegolrs, createAggregateQuery({
      ['statement.actor.mbox']: 'mailto:' + profile.email
    }));
  } else {
    return Task.of([]);
  }

};