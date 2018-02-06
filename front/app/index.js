import 'babel-polyfill';
import 'isomorphic-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import ApplicationContainer from './js/ApplicationContainer'

// Globally available styles
import css from './sass/index.sass';

// ApplicationContainer loads config file and gets the user
// ApplicationContainer -> App -> LearningMap
ReactDOM.render(<ApplicationContainer />, document.querySelector('#app'));