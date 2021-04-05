import React from 'react';
import Block from './block.jsx';
import Button from './button.jsx';
import Slider from './slider.jsx'
import './css/stablematching.css'

export default class StableMatching extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      leftBlocks: [],
      rightBlocks: [],
      size: 6,
      lines: null,
      algorithm: "null",
      readyAllocation : null,
      COLORS: {
        unstable: "red", 
        pending: "yellow",  
        stable: "green",
        unstableColorBlind: "blue"
      },
      colorBlind: false 
    };
    this.LEFT = [
      [3,2,5,1,4],
      [1,2,5,3,4],
      [4,3,2,1,5],
      [1,3,4,2,5],
      [1,2,4,5,3]
    ];
    this.RIGHT = [
      [3,5,2,1,4],
      [5,2,1,4,3],
      [4,3,5,1,2],
      [1,2,3,4,5],
      [2,3,4,1,5]
    ];
  } 

  componentDidMount() {
    this.generateData();
    this.adjust();
    window.addEventListener('resize', this.adjust);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.adjust);
  }

  generateData = () =>{ //set  ups empty array

    const size = parseInt(document.getElementById("slider").value);

    this.setState({
      size: size,
      algorithm: "null",
      readyAllocation: null
    });
    this.LEFT = new Array(size);
    this.RIGHT = new Array(size);
    for (let i = 0; i < size; i++) {
      this.LEFT[i] = new Array (size);
      this.RIGHT[i] = new Array (size);
    }
    setTimeout(()=>{
      this.fillArray(true);
      this.fillArray(false);   
      this.renderBlocks(); 
    },10);
    setTimeout(()=>{
      this.adjustLine(); 
    },20);
  }
 
  fillArray(left){ //fills selected Array with random preferences
    let ARR = left ? this.LEFT : this.RIGHT;
    for (let i = 0; i < this.state.size; i++) {
      let usedNumber = new Array(this.state.size);
      usedNumber.fill(false);
      for (let j = 0; j < this.state.size; j++) {
        let number = this.randomNumber(1,this.state.size);
        while (usedNumber[number-1]){
          number = this.randomNumber(1,this.state.size); 
        }
        ARR[i][j] = number;
        usedNumber[number-1] = true;
      }  
    }
  }

  randomNumber(start,end){ //puts out a ranom number 
    return (Math.floor(Math.random()*((end-start)+1))+start);
  }

  getRects (){ //gets rect objects from all blocks to generate lines
    const left = document.getElementById("leftContainer").children;
    const right = document.getElementById("rightContainer").children;
    const leftRects = [];
    const rightRects = [];
    for (let i = 0; i < left.length; i++) {
      leftRects.push(left[i].children[0].children[0].getBoundingClientRect());
    }
    leftRects.shift(); //Entfernt Boys Block
    for (let j = 0; j < right.length; j++) {
      rightRects.push(right[j].children[0].children[0].getBoundingClientRect());
    }
    rightRects.shift(); //Entfernt Girls Block
    return [leftRects,rightRects];
  } 

  getLine (rect1, rect2, color){ //returns line between selected rects in the seleced color
    const x1 = rect1.right-10;
    const y1 = (rect1.top+rect1.bottom)/2;
    const x2 = rect2.left+10;
    const y2 = (rect2.top+rect2.bottom)/2;
    const line = (
      <div className="svgContainer" key = {"Y: "+y1}>
        <svg id="svg"  width="100%" height="100%"><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="5"/></svg>
      </div>
      );
    return line;
  }  

  drawLines(allocation){ //
    const leftRects = this.getRects()[0];
    const rightRects = this.getRects()[1];
    const lines = [];
    for (let i = 0; i < allocation.length; i++) {
      const currentPartner = allocation[i].partner-1;    //index 0 
      if(allocation[i].stable === "pending"){
        console.error("Pending allocation found that not was checked if stable");
      }
      lines.push(this.getLine(leftRects[i],rightRects[currentPartner],allocation[i].color));
    }
    this.setState({lines: <div id="lines">{lines}</div>}); 
    setTimeout(()=>{
      this.adjustSvgContainer();
    },10) 
  }   
  
  adjustSvgContainer(){
    const collection = document.getElementsByClassName("svgContainer");
    const containers = Array.from(collection);
    containers.forEach(element => {
      element.style.height = document.documentElement.scrollHeight+"px";
    });
  }

  checkAllocation(allocation){  //checks the hole allocation 
    const rightallocation = new Array(this.state.size);
    for (let i = 0; i < allocation.length; i++) {
      rightallocation[allocation[i].partner-1] = {partner: i+1};   //generates allocation for girls
    }
    return this.checkAllocations(allocation,rightallocation);
  }

  checkAllocations(allocation,rightallocation){
    for (let i = 0; i < allocation.length; i++) {  //gets the preference of the partner
      allocation[i].nChoice = this.getNChoice(this.LEFT[i],allocation[i].partner);
      rightallocation[i].nChoice = this.getNChoice(this.RIGHT[i],rightallocation[i].partner);  
    }

    for (let i = 0; i < allocation.length; i++) { //checks if the match is stable
      const stable = this.isStable(i,allocation,rightallocation);
      allocation[i].stable = stable;
      if(stable){
        allocation[i].color = this.state.COLORS.stable;
      }else{
        allocation[i].color = this.state.colorBlind ? this.state.COLORS.unstableColorBlind : this.state.COLORS.unstable;
      }
      
    }
    return allocation;
  }

  getNChoice(preferences,partner){ 
    for (let i = 0; i < preferences.length; i++) {
      const choice = preferences[i]  
      if(partner === choice){
        return i+1;
      }
    }      
  }

  isStable(left,allocation,rightallocation){ //checks a match if its stable
    const countPreferdLeft = allocation[left].nChoice-1;                        //Anzahl bevorzugt links
    const right = allocation[left].partner-1;                         
    const countPreferdRight = rightallocation[right].nChoice-1;                 //Anzahl bevorzugt rechts 

    for (let prefers = 0; prefers < countPreferdLeft; prefers++) {              //prüft alle die vorgezogen wurden
      const preferdChoice = this.LEFT[left][prefers]-1;                              //bevorzugt
      const rightN = rightallocation[preferdChoice].nChoice;                    //Präferenz der bevorzugten bezogen auf den eigentlichen Partner
      let newRightN;                                                            //Präferenz der bevorzugten bezogen auf den aktuell ausgewählten
      for (let j = 0; j < this.RIGHT.length; j++) {  
        if(this.RIGHT[preferdChoice][j]-1 === left){
          newRightN = j;
        }
      }
      
      if(newRightN < rightN){ //Wenn bevorzugte auch ihn bevorzugt -> unstable
        /*console.log("LINKS: Aktuell NR "+(left+1)+" choice neu NR (0-n): "+prefers+" Choice neu: "+(preferdChoice+1)+" Rang neu rechts: "+newRightN+" Rang aktuell rechts: "+rightN);
        console.log("UNSTABLE");*/
        return false;
      }
    }
    for (let prefers = 0; prefers < countPreferdRight; prefers++) {             //REDUNDAND
      const preferdChoice = this.RIGHT[right][prefers]-1;          
      const leftN = allocation[preferdChoice].nChoice;                    
      let newLeftN;                                                          
      for (let j = 0; j < this.RIGHT.length; j++) {  
        if(this.LEFT[preferdChoice][j]-1 === right){
          newLeftN = j;
        }
      }  
      if(newLeftN < leftN){
        /*console.log("RECHTS: aktuell "+(right+1)+" new choice: "+prefers+" newN: "+newLeftN+" N: "+leftN+" preferdChoice: "+preferdChoice);
        console.log("UNSTABLE");*/
        return false;
      }
    } 

    return true; //if no unstable match found
  }


  boysFirst = () => { //creats allocation
    let allocation = new Array(this.state.size);
    const unmatched = this.RIGHT.map( 
      ()=> {return(true)
    });
    for (let i = 0; i < this.state.size; i++) {
      for (let index = 0; index < this.state.size; index++) {
        const choice = this.LEFT[i][index]-1;
        if(unmatched[choice]){
          allocation[i]={
            partner: choice+1, 
            stable: "pending",
            color: this.state.COLORS.pending,
        };
        unmatched[choice] = false;
        break;
        }
      }
    }
    const ready = this.checkAllocation(allocation);
    this.setState({
      algorithm: "boysFirst",
      readyAllocation: ready
    });
    this.drawLines(ready);
  };

  girlsFirst = () => { //creats allocation

    let allocation = new Array(this.state.size);
    const unmatched = this.RIGHT.map( 
      ()=> {return(true)
    });
    for (let i = 0; i < this.LEFT.length; i++) {
      for (let index = 0; index < this.LEFT.length; index++) {
        const choice = this.RIGHT[i][index]-1;
        if(unmatched[choice]){
          allocation[choice] = {
            partner: i+1, 
            stable: "pending",
            color: this.state.COLORS.pending,
        };
        unmatched[choice] = false;
        break;
        }
      }
    }
    const ready = this.checkAllocation(allocation);
    this.setState({
      algorithm: "girlsFirst",
      readyAllocation: ready 
    });
    this.drawLines(ready);
  }

  galeShapley = () => {
    let leftAllocation =  new Array(this.state.size).fill().map(() => ({partner: null}));
    let rightAllocation = new Array(this.state.size).fill().map(() => ({partner: null}));
    let unmatched = leftAllocation.map (
      () => {
        return(true)
      });
    let someoneUnmatched = true;
    let currentLeftIndex = 0;
    while (someoneUnmatched) {

      for (let i = 0; i < leftAllocation.length; i++) {
        if(leftAllocation[currentLeftIndex].partner!=null){
          break;
        }
        const choice = this.LEFT[currentLeftIndex][i]-1;
        //console.log("Index "+currentLeftIndex+" choice "+choice+" i "+i);
        if(rightAllocation[choice].partner===null){
          rightAllocation[choice].partner = currentLeftIndex+1;
          leftAllocation[currentLeftIndex].partner = choice+1;
          unmatched[currentLeftIndex] = false;
          break;
        }else{
          const oldPartner = rightAllocation[choice].partner;
          const nChoiceOld = this.getNChoice(this.RIGHT[choice],oldPartner)
          const nChoiceNew = this.getNChoice(this.RIGHT[choice],currentLeftIndex+1);
          //console.log("else oldpartner "+oldPartner+" oldN "+nChoiceOld+" newN "+nChoiceNew);
          if(nChoiceNew<nChoiceOld){
            rightAllocation[choice].partner = currentLeftIndex+1;
            leftAllocation[oldPartner-1].partner=null;
            leftAllocation[currentLeftIndex].partner = choice+1;
            unmatched[currentLeftIndex] = false;
            unmatched[oldPartner-1] = true;
            break;
          }
        }
      }
    
      someoneUnmatched = false;  //proofs if there is someone whos not matched yet
      for (let i = 0; i < unmatched.length; i++) {
        if(unmatched[i]){
          someoneUnmatched = true;
        }        
      }
      currentLeftIndex++;
      if(currentLeftIndex === leftAllocation.length){
        currentLeftIndex = 0;
      }
    }
    const ready = this.checkAllocations(leftAllocation,rightAllocation);
    this.setState({
      algorithm: "galeShapley",
      readyAllocation: ready 
    });
    this.drawLines(ready);
  }

  testAllocation = () => { //creats allocation
    this.setState({algorithm: "test"});
    const allocation = [  
      {partner: 4},
      {partner: 5},
      {partner: 1},
      {partner: 3},
      {partner: 2}
    ];
    this.drawLines(this.checkAllocation(allocation));
  }

  adjust = () => { 
    this.adjustLine();
    this.adjustBlocks();    
  }
  
  adjustLine () {
    if(this.state.readyAllocation!==null){
      this.drawLines(this.state.readyAllocation);
      return;
    }
    switch (this.state.algorithm) {
      case "null":
        //console.log("No algorithm choosen");
        this.setState({
          lines: null
        });
        break;
      case "boysFirst":
        this.boysFirst();
      break;
      case  "girlsFirst":
        this.girlsFirst();
      break;
      case "galeShapley":
        this.galeShapley();
      break;
      case  "test":
        this.testAllocation();
      break;
      default:
        console.error("No state Algorithm");
        break;    
    }
  };   
  adjustBlocks(){
    const rightContainer = document.getElementById('rightContainer');
    const leftContainer = document.getElementById('leftContainer');
    const menuRect = document.getElementById('menu').getBoundingClientRect();
    rightContainer.style.top = (menuRect.bottom+"px");
    leftContainer.style.top = (menuRect.bottom+"px");
  }

  renderBlocks = () =>{
   
    this.setState({leftBlocks:null,rightBlocks:null});
    
    const l = this.LEFT.map( (element,index) =>{
      return(
        <Block key ={"left"+index} name = {index+1} 
          arr={
            element.map((e) => {
              if(e > 26){ //starts with 1
                e+=6
              }
              return(String.fromCharCode(64+e)) //starts with 1
            })
        }></Block>
      );
    });
    l.unshift(<Block key="headlineL" name="Boys"></Block>)
    const r = this.RIGHT.map( (element,index) =>{
      const currIndex = [index];
      return(
        <Block key ={"right"+index} name = { currIndex.map ((value) => {
          if (value > 25){  //starts with 0
            value += 6;
          }
          return (String.fromCharCode(65+value)) //starts with 0
        })} arr={element}></Block>
      );
    });
    r.unshift(<Block key="headlineR" name="Girls"></Block>)
    setTimeout(()=>{
      this.setState({
        leftBlocks: l,
        rightBlocks: r
      });
    }, 50);
  }

  colorblindMode = () => {
    if(this.state.colorBlind){
      this.setState({colorBlind: false});
      document.getElementById("colorblind").style.backgroundImage = "linear-gradient(90deg, green 0%,red 65%)";
    }else{
      this.setState({colorBlind: true});
      document.getElementById("colorblind").style.backgroundImage = "linear-gradient(90deg, green 40%,blue 100%)";
    }
    this.setState({readyAllocation: null});
    setTimeout(()=>{
      this.adjust();
    },10);
  }

  setCounter = () => {
    let val = document.getElementById("slider").value;
    val = Math.floor(val/10) === 1 ? val: "0"+val;
    document.getElementById("counter").innerHTML = val;
  }

  render(){

    const menu = (
      <div id= 'menu'>
          <span id = 'headline'>Stable Matching</span>
          <Button onClick={this.generateData} text="Generate"></Button>
          <Slider min="2" max="15" onInput={this.setCounter}></Slider>
          <span id ="counter">07</span>
          <Button onClick={this.boysFirst} text="Boys first"></Button>
          <Button onClick={this.girlsFirst} text="Girls first"></Button>
          <Button onClick={this.galeShapley} text="Gale Shapley algorithm"></Button>
          <div className="toggle" id="colorblind" onClick = {this.colorblindMode} >Colorblind Mode</div>
        </div>
    );

    return(
      <div id ="StableMatching">
        {menu}
        <div id ="leftContainer">
          {this.state.leftBlocks}
        </div>
        <div id="rightContainer">
          {this.state.rightBlocks}
        </div>
        {this.state.lines}
      </div>
    );
  }
}

