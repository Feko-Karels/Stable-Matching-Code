import React from 'react';
import './css/block.css'

export default class Block extends React.Component{  //visual only
    constructor(props){
      super(props);
      this.state = {arr: props.arr};
    }
  
    render(){
  
      if (this.props.arr == null && this.props.name == null){
        return(
          <span className = "Block">Props missing</span>
        );
      }
      if(this.props.name == null){
        return(
          <span className = "Block">Name missing</span>
        );
      }
      if(this.props.arr == null){
        return(
          <table className = "Block">
            <tbody>
              <tr>
                <th>{this.props.name}</th>
              </tr>
            </tbody>
          </table>
        );
      }
  
      return(
        <div className ="ComponentBlock">
          <table className = "Block">
            <tbody>
              <tr >
                <th className="Name">{this.props.name}</th>
                <th>{this.state.arr.map((item, index) => (
                  <div key={index} className="element">&nbsp;{item}&nbsp;</div>
                  ))}
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  }