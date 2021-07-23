import {Button} from "./Button.js"



const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,      
    maximumFractionDigits: 2,
});
  
const formatter_long = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,      
    maximumFractionDigits: 6,
});
  
const textStyle = new PIXI.TextStyle({
    fontFamily: 'Open Sans',
    fontWeight: 300,
    fontSize: 13
});



/**MAGIC NUMBERS**/

//var highest = window.innerHeight/10;
//var buffer = window.innerHeight/20;
var inputWidth=100;
var inputHeight=100;

var neuronWidth=50;
var neuronHeight=100;

var buffer= 50;
var upperlim = 100;
var leftlim = 150;

var postraise = -50; //move weightline up a smidge
var postgap = 20 ; //separate out weightlines a smidge

export const layout = {
  INPUT_WIDTH: 50,
  INPUT_HEIGHT: 100,
  
  NEURON_WIDTH: 50,
  NEURON_HEIGHT: 50,
  
  WEIGHTS_WIDTH: 150, //random
  BUFFER: 20,
  UPPERLIM: 80,
  LEFTLIM: 200,
  
  WEIGHT_RAISE: -25, //move weightline up a smidge
  WEIGHT_GAP: 100 //separate out weightlines a smidge

}

//type of controller
export class Slide{
  data; // dataset to use
  
  slideNet; // bind working net to slide
  maxLayers = 4; //needed for buttons
  maxNeurons = 4; //needed for buttons


  slideContainer; // holds it ALL
  inputContainer; // inputs to draw
  buttonContainer; // all buttons to draw -to delete?
  buttonLayerContainer;
  buttonNeuronAddContainer;
  buttonNeuronRemContainer;

    
  netContainer; // net to draw 
  weightsContainer; // weight graphics to draw
  neuronOverContainer;
  neuronSensorContainer;
  labelsContainer; 

  constructor(){
    this.data=[];
      this.buttonContainer = new PIXI.Container();
        this.buttonLayerContainer  = new PIXI.Container();
        this.buttonNeuronAddContainer = new PIXI.Container();
        this.buttonNeuronRemContainer = new PIXI.Container();
//      this.buttonContainer.addChild(this.buttonLayerContainer);   maybe do this
      this.inputContainer = new PIXI.Container();
      this.netContainer = new PIXI.Container();
        this.neuronOverContainer = new PIXI.Container();
        this.neuronSensorContainer = new PIXI.Container();
      this.weightsContainer = new PIXI.Container();
      this.labelsContainer = new PIXI.Container();
      this.slideContainer=new PIXI.Container();
      this.slideContainer.addChild(this.buttonLayerContainer,this.buttonNeuronAddContainer,this.buttonNeuronRemContainer,this.weightsContainer,this.inputContainer,this.netContainer, this.labelsContainer);
    }



  /**** helper functions ****/
  formatList(list){
      var nums2print =[];
      for(var n=0; n<list.length; n++){
        nums2print.push(formatter.format(list[n]));
      }
      return nums2print;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**** *************** ****/


  setData(){

  }

  drawButtons(net){
    var slide = this;
    
    this.buttonLayerContainer.addChild(new Button("addlayer",PIXI.Texture.from('images/buttons/button_layer.png'), 100,140,true));
    
    this.buttonLayerContainer.getChildAt(0).on('click', function(e){
      if(net.layers.length<slide.maxLayers){
        net.addLayer();
        slide.updateDraw(net);
      }
    });
    
    this.buttonLayerContainer.addChild(new Button("remlayer",PIXI.Texture.from('images/buttons/button_removelayer.png'), 100,200,true));
    
    this.buttonLayerContainer.getChildAt(1).on('click', function(e){
      if(net.layers.length>1){
        net.removeLayer();
        slide.updateDraw(net);
      }
    });

    for (var i =0; i<this.maxLayers; i++){
      this.buttonNeuronAddContainer.addChild(new Button("addneuron",PIXI.Texture.from('images/buttons/button_addneuron.png'),350+ (i*150),80, false));
      this.buttonNeuronRemContainer.addChild(new Button("remneuron",PIXI.Texture.from('images/buttons/button_removeneuron.png'),350+ (i*150),105, false));
      this.setNeuronButtons(net,i);
    }

    this.buttonLayerContainer.addChild(new Button("learn_step",PIXI.Texture.from('images/buttons/button_learnstep.png'), 100,275,true));
    
    this.buttonLayerContainer.getChildAt(2).on('click', function(e){
      net.learn();
      slide.updateDraw(net);
    });

    this.buttonLayerContainer.addChild(new Button("learn",PIXI.Texture.from('images/buttons/button_learn.png'), 100,350,true));
    
    this.buttonLayerContainer.getChildAt(3).on('click', async function(e){
      var loopcount = 0;
      pauselearn=0;
      while(loopcount<500 && pauselearn==0){
        net.learn();
        slide.updateDraw(net);
        await slide.sleep(10); //pause to see updates - 100 seems good
        loopcount=loopcount+1;
        //console.log(loopcount);
      }
    });

    this.buttonLayerContainer.addChild(new Button("pause",PIXI.Texture.from('images/buttons/treasure.png'), 100,400,true));
      var pauselearn=0;
    this.buttonLayerContainer.getChildAt(4).on('click', function(e){
      pauselearn=1;
    });


  }

  setNeuronButtons(net,layernum){
    var slide = this;

    this.buttonNeuronAddContainer.getChildAt(layernum).on('click', function(e){
      if(net.getLayer(layernum).neurons.length<slide.maxNeurons){
        net.getLayer(layernum).addNeuron();
        slide.updateDraw(net);
      }
    });

    this.buttonNeuronRemContainer.getChildAt(layernum).on('click', function(e){
      net.getLayer(layernum).removeNeuron();
      slide.updateDraw(net);
    });

  }




  addButtontemp(button){
    this.buttonContainer.addChild(button);
  }

  addButton(name, textureimg, x, y, vis){
      var newb = new Button(name,PIXI.Texture.from(textureimg),x,y,vis)
      this.buttonContainer.addChild(newb);
  }

  
  addButtons(buttonlist){
    for(var i =0; i<buttonlist.length; i++){
      this.buttonContainer.addChild(buttonlist[i]);
    }
    
  }

  isVis(name){
    return this.buttonContainer.getChildByName(name).visible;
  }

  /*setVis(name,bool){
    if(bool==false){this.buttonContainer.getChildByName(name).visible=false;}
    else if(bool==true){this.buttonContainer.getChildByName(name).visible=true;}
  }*/

  setVis(container,idx,bool){
    if(bool==false){container.getChildAt(idx).visible=false;}
    else if(bool==true){container.getChildAt(idx).visible=true;}
  }

//  Slide0.buttonContainer.getChildByName("btest").on('click', function(e){
//    net.getLayer(0).addNeuron();
//    net.update();
//    Slide0.draw(net);
//  });
  onClick(buttonname,thisnet,funct){
    var slide = this;
    slide.buttonContainer.getChildByName(buttonname).on('click', function(e){
    //  thisnet.getLayer(0).addNeuron();
      thisnet.update();
      slide.draw(thisnet);
    });
  }

  getNet(){
    return this.net;
  }

  updateDraw(net){
    net.update();
    this.draw(net);

    if(net.layers.length>1){
      this.setVis(this.buttonNeuronAddContainer,net.layers.length-2,true);
      this.setVis(this.buttonNeuronRemContainer,net.layers.length-2,true);
    }

    this.setVis(this.buttonNeuronAddContainer,net.layers.length-1,false);
    this.setVis(this.buttonNeuronRemContainer,net.layers.length-1,false);
  }

  clearButtons(){}
  clearInputs(){}
  clearNet(){}
  clear(){}
  clearExceptButtons(){}

  draw(net){
      this.drawInputs(net);
      this.drawNeurons(net);
      this.drawWeights(net);

  }

  drawBig(net){
    this.drawInputs(net);
    this.drawNeurons(net);
    this.drawWeights(net);
    
    //get layers
    for(var i = 0; i<this.netContainer.children.length; i++){
      
      //get neurons
      for(var k = 0; k<this.netContainer.getChildAt(i).children.length; k++){
        this.netContainer.getChildAt(i).getChildAt(k).scale.set(2);
      }
    }
  }

  drawInputs(net){
      this.inputContainer.removeChildren();
    
      for(var i = 0; i<net.netInput.length; i++){
          var inputSprite = new PIXI.Sprite(PIXI.Texture.from('images/input.png'));
              inputSprite.anchor.set(0.5);
              inputSprite.x= 200;//leftlim;
              inputSprite.y= (i*100) +200;//(i*(inputHeight+buffer))+upperlim+buffer;
      
          var inputSpriteText = new PIXI.Text(net.netInput[i]);
              inputSpriteText.anchor.set(0.5);

      
          inputSprite.addChild(inputSpriteText);
          this.inputContainer.addChild(inputSprite);
      }
  }

  drawWeights(net){
    this.weightsContainer.removeChildren();


    for(var i = 0; i<net.layers.length; i++){
        for(var j = 0; j<net.getLayer(i).neurons.length; j++){
            for(var k = 0; k<net.getLayer(i).neurons[j].weights.length; k++){
                var weightSprite=new PIXI.Graphics();
                
                //weightSprite.hitArea = new PIXI.Rectangle(0, 0, 100, 100);

                  //magnitude of weight determines thickness
                  var thickness = Math.abs(net.getLayer(i).neurons[j].weights[k] * 10);
                    if(thickness<1){ var thickness =3 }
                  var color = 0x000000;

                  //positive weight = blue, neagtive = orange
                  if(net.getLayer(i).neurons[j].weights[k] < 0){
                    color = 0xFF5733;
                  }else if(net.getLayer(i).neurons[j].weights[k] > 0){
                    color = 0x344EE8;
                  } else if(net.getLayer(i).neurons[j].weights[k] == 0){
                    color = 0xAAADB3;
                  }

                  weightSprite.lineStyle(thickness, color);
                  var startx = 350 + (i*150);
                  var starty = 150 + (j*100);
                  var endx = 350 + (i*150) - 150;
                  var endy0 = 200 + (k*100);
                  var endy =  150 + (k*100);

                  if (i==0){
                    weightSprite.drawPolygon(startx, starty, 
                                             endx, endy0);
                  } else {
                    weightSprite.drawPolygon(startx, starty, 
                                             endx, endy);
                  }
                  
                  // use to view weight hitbox
                  var f=new PIXI.Graphics();
                  f.lineStyle(3, 0x000000);
                  if (i==0){
                    f.drawPolygon(startx, starty +10, 
                      endx, endy0 +10,
                      endx, endy0 -10,
                      startx, starty -10);
                  } else {
                    f.drawPolygon(startx, starty +10, 
                                  endx, endy +10,
                                  endx, endy -10,
                                  startx, starty -10);
                  }

                  if(i==0){
                    weightSprite.hitArea = new PIXI.Polygon(
                      startx, starty +10, 
                      endx, endy0 +10,
                      endx, endy0 -10,
                      startx, starty -10);
                  } else {

                    weightSprite.hitArea = new PIXI.Polygon(startx, starty +10, 
                      endx, endy +10,
                      endx, endy -10,
                      startx, starty -10);
                  
                  }

                  
                  weightSprite.interactive=true;

                  //weightSprite.buttonmode=true;
                  var self=this;
                  weightSprite.on('mouseover', function(e){
                  //  this.alpha=0;
                  //  this.getChildAt(0).alpha=0;
                    this.getChildAt(0).scale.set(1.5);
                    //come back to this
                //    var temp = new PIXI.Polygon(this.currentPath.points[0]+20,this.currentPath.points[1]+20,this.currentPath.points[2]+20,this.currentPath.points[3]+20);
                  });
                  
        
                  weightSprite.on('mouseout', function(e){
                  //  this.alpha=1;
                  
                  this.getChildAt(0).scale.set(1);
                  

                  });
                this.weightsContainer.addChild(weightSprite);
                //this.weightsContainer.addChild(f);

                  

                //cpme back to this
                var weightSpriteText=new PIXI.Text(formatter.format(net.getLayer(i).neurons[j].weights[k]), textStyle);
              //  weightSpriteText.anchor.set(0.5)
                 weightSpriteText.x= startx-50 //weightSprite.x// ((i*200)+350 + (i*200)+150 +100)/2 -50;
                  weightSpriteText.y= starty-10 + (k*20) - (j*10)// (j*120+150 +50 -5 + i+300+k*100 -100)/2-50;

                  var slope = (endy-starty)/(endx-startx);
                //    weightSpriteText.rotation=Math.atan(slope);
                //  console.log("slope"+slope)
                 weightSprite.addChild(weightSpriteText);
            }
        }
    }
}

  drawNeurons(net){

  //clear old stuff first
  //this.inputContainer.removeChildren();
  this.netContainer.removeChildren();
  this.labelsContainer.removeChildren();
  this.neuronOverContainer.removeChildren();
  this.neuronSensorContainer.removeChildren();

  //for each layer
  for(var i = 0; i<net.layers.length; i++){
    var layerContainer = new PIXI.Container();
    this.netContainer.addChild(layerContainer);

      //for each neuron
    for(var j = 0; j<net.getLayer(i).neurons.length; j++){

        var neuronBase = new PIXI.Sprite(PIXI.Texture.from('images/neuron.png'));
        neuronBase.anchor.set(0.5);
        neuronBase.x=350+ (i*150);
        neuronBase.y=150 + (j*100);
          
        //set tint depending on how much neuron is activated
        var finout = net.getLayer(i).neurons[j].output;
        if(finout>=0.9){
          neuronBase.tint= 0xfff000
        } else if (finout>=0.8){
          neuronBase.tint= 0xfdee3b
        } else if (finout>=0.7){
          neuronBase.tint= 0xfbeb56
        } else if (finout>=0.6){
          neuronBase.tint= 0xf9e96d
        } else if (finout>=0.5){
          neuronBase.tint= 0xf6e781
        } else if (finout>=0.4){
          neuronBase.tint= 0xf2e494
        } else if (finout>=0.3){
          neuronBase.tint= 0xeee2a7
        } else if (finout>=0.2){
          neuronBase.tint= 0xe9e0b9
        } else if (finout>=0.1){
          neuronBase.tint= 0xe3deca
        }  else if (finout>=0.0){
          neuronBase.tint= 0xdcdcdc
        }

        var neuronMainText = new PIXI.Text(formatter.format(net.getLayer(i).neurons[j].output));
          neuronMainText.scale.set(0.8);
          neuronMainText.anchor.set(0.5);
          neuronBase.addChild(neuronMainText);


        var overText = new PIXI.Text(
            "i: " + this.formatList(net.getLayer(i).neurons[j].inputs) + '\n'
              + "w: " + this.formatList(net.getLayer(i).neurons[j].weights) + '\n'
              + "b: " + formatter.format(net.getLayer(i).neurons[j].bias) +'\n'
              + "o: " + formatter.format(net.getLayer(i).neurons[j].output_nofn) + '\n'
              + "   " + formatter.format(net.getLayer(i).neurons[j].output) + '\n',
            textStyle)
          overText.anchor.set(.5);
          
        var overNeuron = new PIXI.Sprite(PIXI.Texture.from('images/overneuron.png'));
          overNeuron.anchor.set(0.5);
          overNeuron.scale.set(1.5);

          overNeuron.x=neuronBase.x;
          overNeuron.y=neuronBase.y;
          overNeuron.idx= [i,j];
          overNeuron.alpha=0;
          overNeuron.addChild(overText);

        //detection for showing overneuron
        var sensor= new PIXI.Sprite(PIXI.Texture.from('images/neuron.png'));
          sensor.anchor.set(0.5);
          sensor.x=neuronBase.x;
          sensor.y=neuronBase.y;
          sensor.tint=0xFFA500;
          sensor.alpha=0;
          sensor.interactive=true;

          var self = this;
          sensor.on('mouseover', function(e){
            self.neuronOverContainer.getChildAt(this.parent.getChildIndex(this)).alpha=1;
          });

          sensor.on('mouseout', function(e){
            self.neuronOverContainer.getChildAt(this.parent.getChildIndex(this)).alpha=0;
          });

        this.neuronOverContainer.addChild(overNeuron);
        this.neuronSensorContainer.addChild(sensor);

            
        //neuronContainer.addChild(neuronBase);
        // neuronContainer.addChild(overNeuron);
        //neuronContainer.addChild(sensor);
        layerContainer.addChild(neuronBase);
        
      }
    }

    this.netContainer.addChild(this.neuronOverContainer, this.neuronSensorContainer)

    //add text after final layer
    for(var i = 0; i<net.targetText.length; i++){
      var targetTextText = new PIXI.Text(net.targetText[i]);
      targetTextText.x=380+((net.layers.length-1)*150);
      targetTextText.y=135+(i*100);

      this.labelsContainer.addChild(targetTextText);
    }

  }      
}