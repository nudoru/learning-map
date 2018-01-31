import React from 'react';
import throttle from 'lodash/throttle';
import { getNextId } from '../utils/ElementIDCreator';

const NOOP = () => {
};

const ONCHANGE_THROTTLE = 500;

//------------------------------------------------------------------------------
// Groups
//------------------------------------------------------------------------------

export const VForm = ({children}) => <form
  className="rh-vform">{children}</form>;

export const HForm = ({children, className=''}) => <form
  className={"rh-hform "+className}>{children}</form>;

export const Fieldset = ({legend, children}) => {
  return (
    <fieldset>
      {legend ? <legend>{legend}</legend> : null}
      {children}
    </fieldset>
  );
};

export const FormGroup = ({children}) => <div
  className="rh-form-group">{children}</div>;

export const FormVGroup = ({children, label}) => {
  return (<div className="rh-form-v-group">
      {label ? <Label>{label}</Label> : null}
      <div className="rh-form-v-group-controls">{children}</div>
    </div>
  );
};

export const FormHGroup = ({children, label}) => {
  return (<div className="rh-form-h-group">
      {label ? <Label>{label}</Label> : null}
      <div className="rh-form-h-group-controls">{children}</div>
    </div>
  );
};

export const HInputGroup = ({children}) => <div
  className="rh-form-inline-controls">{children}</div>;

export const HInputDecorator = ({icon, children}) => <div
  className="group-addon">{icon ?
  <i className={'fa fa-' + icon}/> : null}{children}</div>;

export const FormHGroupRow = ({children, label}) => {
  let labelEl = label ?
    <label className="rh-form-inline-label">{label}</label> : null;
  return (<div className="rh-form-group">
    {labelEl}
    <HInputGroup>{children}</HInputGroup>
  </div>);
};

//------------------------------------------------------------------------------
// Elements
//------------------------------------------------------------------------------

/*
 required
 active
 pristine
 normalized
 focus -> touched -> active
 blur -> validateFn -> error
 */

//https://hackernoon.com/10-react-mini-patterns-c1da92f068c5#.jnip3uvdo

export const Label = ({children, htmlFor, ...other}) => <label
  htmlFor={htmlFor} {...other}>{children}</label>;

export const Help = ({children}) => <span
  className="rh-form-help">{children}</span>;

//------------------------------------------------------------------------------

export class TextInput extends React.Component {

  constructor (props) {
    super(props);
    this.id       = getNextId();
    this.active   = false;
    this.pristine = true;
    this.touched  = false;
    this.error    = false;
    this.onElChange = throttle(this.onElChange, ONCHANGE_THROTTLE);
  }

  componentDidMount() {
    if(this.props.preventDefault) {
      this.el.addEventListener('keypress', this.nativeOnKeyPress, false);
    }
  }

  componentWillUnmount() {
    if(this.props.preventDefault) {
      this.el.removeEventListener('keypress', this.nativeOnKeyPress);
    }
  }

  nativeOnKeyPress(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
    }
  }

  focus () {
    this.el.focus();
  }

  value () {
    return this.el.value;
  }

  onElFocus () {
    //console.log('focus', this.el);
    this.touched = true;
    this.active  = true;
  }

  onElBlur () {
    //console.log('blur', this.el);
    this.active = false;
  }

  onElChange () {
    //console.log('change', this.value(), this.el);
    this.pristine = false;
  }

  render () {
    let {label, help, datalist, error, className = '', ...other} = this.props;

    if (error) {
      className += ' isError';
    }

    return (<div className="rh-form-component">
        {label ? <Label htmlFor={this.id}>{label}</Label> : null }
        <div className="rh-form-control"
             onBlur={this.onElBlur.bind(this)}
             onFocus={this.onElFocus.bind(this)}
             onChange={this.onElChange.bind(this)}>
          <input
            type='text'
            id={this.id}
            list={this.id}
            ref={el => { this.el = el; }} //eslint-disable-line brace-style
            className={className}
            {...other}>
          </input>

          {help ? <Help>{help}</Help> : null}
        </div>
      </div>
    );
  }
}

/* Disabled
 {datalist ? (
 <Datalist id={this.id}>
 {datalist.split(',').map(d => <DatalistOption value={d}/>)}
 </Datalist>
 ) : null}
 export const Datalist = ({children, id, ...other}) => <datalist
 id={id} {...other}>{children}</datalist>;

 export const DatalistOption = ({value, children, ...other}) => <option
 value={value}>{children}</option>;
 */

//------------------------------------------------------------------------------

export class TextArea extends React.Component {

  constructor (props) {
    super(props);
    this.id       = getNextId();
    this.active   = false;
    this.pristine = true;
    this.touched  = false;
    this.error    = false;
    this.onElChange = throttle(this.onElChange, ONCHANGE_THROTTLE);
  }

  componentDidMount() {
    if(this.props.preventDefault) {
      this.el.addEventListener('keypress', this.nativeOnKeyPress, false);
    }
  }

  componentWillUnmount() {
    if(this.props.preventDefault) {
      this.el.removeEventListener('keypress', this.nativeOnKeyPress);
    }
  }

  nativeOnKeyPress(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
    }
  }

  focus () {
    this.el.focus();
  }

  value () {
    return this.el.value;
  }

  onElFocus () {
    //console.log('focus', this.el);
    this.touched = true;
    this.active  = true;
  }

  onElBlur () {
    //console.log('blur', this.el);
    this.active = false;
  }

  onElChange () {
    //console.log('change', this.value(), this.el);
    this.pristine = false;
  }

  render () {
    let {label, children, error, className = '', help, ...other} = this.props;

    if (error) {
      className += ' isError';
    }

    return (<div className="rh-form-component">
        {label ? <Label htmlFor={this.id}>{label}</Label> : null }
        <div className="rh-form-control"
             onBlur={this.onElBlur.bind(this)}
             onFocus={this.onElFocus.bind(this)}
             onChange={this.onElChange.bind(this)}>
          <textarea
            id={this.id}
            ref={el => { this.el = el; }} //eslint-disable-line brace-style
            className={className}
            {...other}>
            {children}
          </textarea>
          {help ? <Help>{help}</Help> : null}
        </div>
      </div>
    );
  }
}

//------------------------------------------------------------------------------

export class DropDown extends React.Component {

  constructor (props) {
    super(props);
    this.id       = getNextId();
    this.active   = false;
    this.pristine = true;
    this.touched  = false;
    this.error    = false;
  }

  componentDidMount() {
    if(this.props.preventDefault) {
      this.el.addEventListener('keypress', this.nativeOnKeyPress, false);
    }
  }

  componentWillUnmount() {
    if(this.props.preventDefault) {
      this.el.removeEventListener('keypress', this.nativeOnKeyPress);
    }
  }

  nativeOnKeyPress(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
    }
  }

  focus () {
    this.el.focus();
  }

  value () {
    return this.el.value;
  }

  onElFocus () {
    //console.log('focus', this.el);
    this.touched = true;
    this.active  = true;
  }

  onElBlur () {
    //console.log('blur', this.el);
    this.active = false;
  }

  onElChange () {
    //console.log('change', this.value(), this.el);
    this.pristine = false;
  }

  render () {
    let {label, children, error, className = '', help, ...other} = this.props;

    if (error) {
      className += ' isError';
    }

    return (<div className="rh-form-component">
        {label ? <Label htmlFor={this.id}>{label}</Label> : null }
        <div className="rh-form-control"
             onBlur={this.onElBlur.bind(this)}
             onFocus={this.onElFocus.bind(this)}
             onChange={this.onElChange.bind(this)}>
          <select
            id={this.id}
            ref={el => { this.el = el; }} //eslint-disable-line brace-style
            className={className}
            {...other}>
            {children}
          </select>
          {help ? <Help>{help}</Help> : null}
        </div>
      </div>
    );
  }
}

export class ListBox extends React.Component {

  constructor (props) {
    super(props);
    this.id       = getNextId();
    this.active   = false;
    this.pristine = true;
    this.touched  = false;
    this.error    = false;
  }

  componentDidMount() {
    if(this.props.preventDefault) {
      this.el.addEventListener('keypress', this.nativeOnKeyPress, false);
    }
  }

  componentWillUnmount() {
    if(this.props.preventDefault) {
      this.el.removeEventListener('keypress', this.nativeOnKeyPress);
    }
  }

  nativeOnKeyPress(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
    }
  }

  focus () {
    this.el.focus();
  }

  value () {
    //return this.el.value;
    return this.props.children.reduce((acc, c, i) => {
      let opt = this.refs[i];
      if (opt.el.selected) {
        acc.push(opt.props.children);
      }
      return acc;
    }, []);
  }

  onElFocus () {
    //console.log('focus', this.el);
    this.touched = true;
    this.active  = true;
  }

  onElBlur () {
    //console.log('blur', this.el);
    this.active = false;
  }

  onElChange () {
    //console.log('change', this.value(), this.el);
    this.pristine = false;
  }

  render () {
    let {label, children, error, className = '', help, ...other} = this.props;

    className = 'rh-form-control-listbox ' + className;

    if (error) {
      className += ' isError';
    }

    return (<div className="rh-form-component">
        {label ? <Label htmlFor={this.id}>{label}</Label> : null }
        <div className="rh-form-control"
             onBlur={this.onElBlur.bind(this)}
             onFocus={this.onElFocus.bind(this)}
             onChange={this.onElChange.bind(this)}>
          <select
            multiple
            size="3"
            id={this.id}
            ref={el => { this.el = el; }} //eslint-disable-line brace-style
            className={className}
            {...other}>
            {React.Children.map(this.props.children, (element, idx) => {
              return React.cloneElement(element, {ref: idx});
            })}
          </select>
          {help ? <Help>{help}</Help> : null}
        </div>
      </div>
    );
  }
}

export const OptionGroup = ({children, label, ...other}) => <optgroup
  label={label} {...other}>{children}</optgroup>;

export class Option extends React.Component {
  constructor (props) {
    super(props);
    this.id = getNextId();
  }

  render () {
    let {children, value, ...other} = this.props;
    return (
      <option ref={el => { this.el = el; }} //eslint-disable-line brace-style
              value={value}
              id={this.id}
              {...other}>
        {children}
      </option>
    );
  }
}

//------------------------------------------------------------------------------

export class CheckGroup extends React.Component {

  constructor (props) {
    super(props);
    this.id       = getNextId();
    this.active   = false;
    this.pristine = true;
    this.touched  = false;
    this.error    = false;
  }

  focus () {
    //this.el.focus();
  }

  value () {
    return this.props.children.reduce((acc, c, i) => {
      let cbox = this.refs[i];
      if (cbox.el.checked) {
        acc.push(cbox.props.children);
      }
      return acc;
    }, []);
  }

  onElFocus () {
    //console.log('focus', this.el);
    this.touched = true;
    this.active  = true;
  }

  onElBlur () {
    //console.log('blur', this.el);
    this.active = false;
  }

  onElChange () {
    //console.log('change', this.value(), this.el);
    this.pristine = false;
  }

  render () {
    let {label, children, error, className = '', help, disabled} = this.props;

    className = 'rh-form-label-large ' + className;

    if (error) {
      className += ' isError';
    }

    children.forEach(c => c.props.className = className);

    if (disabled) {
      children.forEach(c => c.props.disabled = true);
    }

    return (<div className="rh-form-component">
        {label ? <Label htmlFor={this.id}>{label}</Label> : null }
        <div className="rh-form-control"
             ref={el => { this.el = el; }} //eslint-disable-line brace-style
             onBlur={this.onElBlur.bind(this)}
             onFocus={this.onElFocus.bind(this)}
             onChange={this.onElChange.bind(this)}>
          {React.Children.map(this.props.children, (element, idx) => {
            return React.cloneElement(element, {ref: idx});
          })}
          {help ? <Help>{help}</Help> : null}
        </div>
      </div>
    );
  }
}

export class Checkbox extends React.Component {
  constructor (props) {
    super(props);
    this.id = getNextId();
  }

  render () {
    let {children, className, ...other} = this.props;
    return (
      <Label htmlFor={this.id} className={className}>
        <input ref={el => { this.el = el; }} //eslint-disable-line brace-style
               type='checkbox'
               id={this.id}
               {...other} />
        {children}
      </Label>
    );
  }
}

//------------------------------------------------------------------------------

export class RadioGroup extends React.Component {

  constructor (props) {
    super(props);
    this.id       = getNextId();
    this.active   = false;
    this.pristine = true;
    this.touched  = false;
    this.error    = false;
  }

  focus () {
    //this.el.focus();
  }

  value () {
    return this.props.children.reduce((acc, c, i) => {
      let cbox = this.refs[i];
      if (cbox.el.checked) {
        acc = cbox.props.children;
      }
      return acc;
    }, '');
  }

  onElFocus () {
    //console.log('focus', this.el);
    this.touched = true;
    this.active  = true;
  }

  onElBlur () {
    //console.log('blur', this.el);
    this.active = false;
  }

  onElChange () {
    //console.log('change', this.value(), this.el);
    this.pristine = false;
  }

  render () {
    let {label, children, error, className = '', disabled, help} = this.props;

    className = 'rh-form-label-large ' + className;

    if (error) {
      className += ' isError';
    }

    children.forEach(c => c.props.className = className);

    // Assign the same name so they group properly
    children.forEach(c => c.props.name = this.id);

    if (disabled) {
      children.forEach(c => c.props.disabled = true);
    }

    return (<div className="rh-form-component">
        {label ? <Label htmlFor={this.id}>{label}</Label> : null }
        <div ref={el => { this.el = el; }} //eslint-disable-line brace-style
             className="rh-form-control"
             onBlur={this.onElBlur.bind(this)}
             onFocus={this.onElFocus.bind(this)}
             onChange={this.onElChange.bind(this)}>
          {React.Children.map(this.props.children, (element, idx) => {
            return React.cloneElement(element, {ref: idx});
          })}
          {help ? <Help>{help}</Help> : null}
        </div>
      </div>
    );
  }
}

export class Radio extends React.Component {
  constructor (props) {
    super(props);
    this.id = getNextId();
  }

  render () {
    let {children, className, ...other} = this.props;
    return (
      <Label htmlFor={this.id} className={className}>
        <input ref={el => { this.el = el; }} //eslint-disable-line brace-style
               type='radio'
               id={this.id}
               {...other} />
        {children}
      </Label>
    );
  }
}