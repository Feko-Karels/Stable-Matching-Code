import React from 'react';
import './css/button.css'

export default class Button extends React.Component{
  
  render(){
      return( 
        <div className="button" onClick = {this.props.onClick}>{this.props.text}</div>
      );
    }
}