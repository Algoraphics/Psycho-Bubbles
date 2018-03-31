/* global AFRAME */

// Convert rgb value map to hex rgb string
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Convert rgb input values to hex rgb string
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Convert hex rgb string to rgb value map
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Cycle through rainbow based on previous state and rgb color
function rainbowCycle(state, color, speed) {
  var rgb = hexToRgb(color);
  var r = rgb.r;
  var g = rgb.g;
  var b = rgb.b;
  if(state == 0){
    g = g + speed;
      if(g >= 255) {
        g = 255; 
        state = 1;
      }
  }
  if(state == 1){
    r = r - speed;
    if(r <= 0) {
      r = 0; 
      state = 2;
    }
  }
  if(state == 2){
    b = b + speed;
    if(b >= 255) {
      b = 255; 
      state = 3;
    }
  }
  if(state == 3){
    g = g - speed;
    if(g <= 0) {
      g = 0; 
      state = 4;
    }
  }
  if(state == 4){
    r = r + speed;
    if(r >= 255) {
      r = 255;
      state = 5;
    }
  }
  if(state == 5){
    b = b - speed;
    if(b <= 0) {
      b = 0; 
      state = 0;
    }
  }
  return [state, rgbToHex(r, g, b)];
}


// Pick a random color
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/*
  Ganzfeld simulator component.
  
  Creates a simple sphere with uniform color, intended to surround the user.
  Manages keyboard controls to play/pause white noise and cycle colors.
*/
AFRAME.registerComponent('ganzfeld', {
  schema: {
    radius: {default: 5},
    color: {default: "#F90000"},
  },
  init: function () {
    var el = this.el;
    var data = this.data;
    
    var sphere = document.createElement('a-entity');
    sphere.setAttribute('geometry', "primitive: sphere; radius: " + data.radius);
    sphere.setAttribute('material', "shader: flat; side: double; color: " + data.color);
    sphere.setAttribute('state', 0);
    this.el.appendChild(sphere);
    
    window.addEventListener("keydown", function(e){
      if(e.keyCode === 71) { // g key to cycle colors
        var color = document.querySelector('#ganzfeld').children[0].getObject3D('mesh').material.color;
        var state = parseInt(document.querySelector('#ganzfeld').children[0].getAttribute('state'));
        // Gets a little silly with the math here. Pulling directly from the object3D (darn you, global scope) required a couple conversions
        var hexcolor = rgbToHex(color.r * 255, color.g * 255, color.b * 255);
        // Cycle the rainbow
        var res = rainbowCycle(state, hexcolor, 10);
        // Convert back to fractional values
        var nextcolor = hexToRgb(res[1]);
        nextcolor.r /= 255; nextcolor.g /= 255; nextcolor.b /= 255;
        document.querySelector('#ganzfeld').children[0].getObject3D('mesh').material.color = nextcolor;
        document.querySelector('#ganzfeld').children[0].setAttribute('state', res[0]);
      }
      if(e.keyCode === 72) { // h key to pause music
        var noise = document.querySelector("#noise");
        if (noise.paused) {
          noise.play();
        }
        else {
          noise.pause();
        }
      }
    });
  }
});

// Cycle through a rainbow for a single simple entity
AFRAME.registerComponent('rainbowcycle', {
  schema: {
    offset: {default: 0},
    speed: {default: 5}
  },
  init: function () {
    var el = this.el;
    var material = el.getAttribute('material');
    material.color = rgbToHex(255, this.data.offset % 255, 0);
    el.setAttribute('material', material);
    this.state = 0;
  },
  tick: function () {
    var el = this.el;
    var material = el.getAttribute('material');
    var color = material.color;
    var speed = this.data.speed;
    var ret = rainbowCycle(this.state, color, speed);
    this.state = ret[0];
    material.color = ret[1];
    el.setAttribute('material', material);
  }
});