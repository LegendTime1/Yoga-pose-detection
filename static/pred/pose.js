// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
KNN Classification on Webcam Images with poseNet. Built with p5.js
=== */
let video;


// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier(); 
/*This line creates a new instance of the KNNClassifier class from the ml5 library. 
The KNNClassifier is used for training and running K-nearest neighbors classification algorithms.*/



let poseNet;
let poses = [];
let canvas;
let width = 700;
let height = 500;
/*These variables are declared to store the video capture element, 
the poseNet model, the detected poses, and the dimensions of the video feed and canvas.*/


let ctx;
let res_conf;
var audio=null;
var twenty_frames=[];
var counts = {};
var pose_arr=['A','B','C','D','E','F','G'];
let prev_sound='K';
counts['A']=0;
counts['B']=0;
counts['C']=0;
counts['D']=0;
counts['E']=0;
counts['F']=0;
counts['G']=0;
var p_name=null;



poses_name=['Tadasana','Urdhva Hastasana','Uttanasana','Ardha Uttanasana','Chaturanga','Urdhva Mukha Svanasana','Adho Mukha Svanasana']


/*This function is a callback that is called when the poseNet model is loaded and ready to be used. 
It simply logs a message to the console indicating that the model is ready.*/
function modelReady() {
  console.log('model ready');
}


/* 
sets up the canvas using the p5.js createCanvas() function and positions it on the web page. 
It also creates a video capture element using createCapture(VIDEO) and sets its size to match the specified width and height. 
The video.hide() function hides the video element so that it is not visible on the page.
*/
function setup() {
    let cnv=createCanvas(700, 500);
    cnv.position(330, 70);

      video = createCapture(VIDEO);
      video.size(width, height);
      video.hide();




/*The poseNet object is initialized using ml5.poseNet(video, modelReady), which creates a new poseNet model and associates it with the video element. 
The modelReady() function is passed as a callback to be executed when the model is ready.*/
 /*An event listener is set up using poseNet.on('pose', function(results) { poses = results; })
  to detect and store poses in the poses array whenever new poses are detected.*/
  
// Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  knnClassifier.load(pred_json,classifierReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
 
  
  requestAnimationFrame(draw)
}





function classifierReady()
{ 
     console.log("Classifier model is ready!");
//     document.querySelector('#status').textContent = 'Classifier loaded!'
}




/* 
The draw() function is continuously called by requestAnimationFrame() to update the canvas and display the video feed, keypoints, and skeletons.
It uses the p5.js image() function to draw the video frame on the canvas. 
Then, it calls the drawKeypoints() and drawSkeleton() functions to visualize the detected keypoints and skeletons, respectively. 
If p_name (the name of the predicted pose) is not null, it displays the pose name on the canvas using the text() function.
*/

function draw() {
 

  image(video, 0, 0, width, height);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
  if(p_name!=null){
    textSize(32);
    text(p_name, 10, 30);
  }
}


// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  if(poses.length>0){

    console.log("Got pose length!");
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);

  // Use knnClassifier to classify which label do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(poseArray, gotResults);
  }
}


// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    console.log(confidences);

    let c_a = confidences['A'] * 100;
    let c_b = confidences['B'] * 100;
    let c_c = confidences['C']*100;

    let c_d = confidences['D']*100;
    let c_e = confidences['E']*100;
    let c_f = confidences['F']*100;
    let c_g = confidences['G']*100;

    console.log(c_a,c_b,c_c,c_d,c_e,c_f,c_g);


   var conf = [];
   conf.push(c_a);
   conf.push(c_b);
   conf.push(c_c);
   conf.push(c_d);
   conf.push(c_e);
   conf.push(c_f);
   conf.push(c_g);



   
   let mx_indx = conf.indexOf(Math.max(...conf));
   console.log(mx_indx);

   twenty_frames.push(pose_arr[mx_indx]);
   console.log(pose_arr[mx_indx]);
   counts[pose_arr[mx_indx]]+=1;

   if(twenty_frames.length>100){
    
    let maxi=0;
    let res;

    for(var i=0;i<twenty_frames.length;i++){
      console.log(twenty_frames[i]);
      console.log(counts[twenty_frames[i]]);

      if(counts[twenty_frames[i]]>maxi){
         maxi=counts[twenty_frames[i]];
         res=twenty_frames[i];
      }  
    }
    last_frame=twenty_frames.shift();
    console.log(res);

    sound_no=pose_arr.indexOf(res)+1;
    console.log('Sound number'+sound_no);

    counts[last_frame]-=1;

    if(prev_sound!=res){
      if(audio!=null){
      audio.pause();
      }
      audio = new Audio('assets/'+sound_no.toString()+'.mp3');
      audio.play();
      prev_sound=res;
      p_name= poses_name[sound_no-1];

      console.log("poses"+p_name);


      

    }



   }
  }

  
}



//=======Draw skeleton and keypoints ===/

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {


    if(poses.length>0){
      console.log("Got pose in drawing function!");
      classify();
    }
   // Loop through all the poses detected
   for (let i = 0; i < poses.length; i++) {
     // For each pose detected, loop through all the keypoints
     for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
       // A keypoint is an object describing a body part (like rightArm or leftShoulder)
       let keypoint = poses[i].pose.keypoints[j];
       // Only draw an ellipse is the pose probability is bigger than 0.2
       if (keypoint.score > 0.1) {
         fill(255, 0, 0);
         noStroke();
         ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
 
         
       }
     }
   }
 }
 
 // A function to draw the skeletons
 function drawSkeleton() {
   // Loop through all the skeletons detected
   for (let i = 0; i < poses.length; i++) {
     // For every skeleton, loop through all body connections
     for (let j = 0; j < poses[i].skeleton.length; j++) {
       let partA = poses[i].skeleton[j][0];
       let partB = poses[i].skeleton[j][1];
       stroke(255, 0, 0);
       line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
     }
   }
 }
