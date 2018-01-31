import 'babel-polyfill';
import 'isomorphic-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import Bootstrap from './js/Bootstrap'

// Globally available styles
import css from './sass/index.sass';

// Application container optionally loads config.json and sets up routing
ReactDOM.render(<Bootstrap />, document.querySelector('#app'));