import React from 'react'
import './css/slider.css'

export default class Slider extends React.Component{
    render(){
        return(
            <div className="slider">
                <input onInput={this.props.onInput} defaultValue ="7" id="slider" type="range" min ={this.props.min} max={this.props.max}></input>
            </div>
        );
    }
}