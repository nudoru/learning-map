import Task from 'data.task';
import { configSelector, userProfileSelector } from '../store/selectors';
import {
  requestAggregate,
  createAggregateQuery
}   from '../utils/learningservices/lrs/LRS';

/*
Allego is a video based platform for sales. All interactions on that platform are
also recorded to a store on the LRS
 */

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