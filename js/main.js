window.onload = function() {
  canvas = document.getElementById("pacman_canvas");
  canvasContext = canvas.getContext("2d");

  window.addEventListener('keydown', function(e){
    keyState[e.keyCode || e.which] = true;
  }, true);
  window.addEventListener('keyup', function(e){
      keyState[e.keyCode || e.which] = false;
  }, true);

  setInterval(pacmanGame, 1000/16.67);
}

// Key being pressed.
let keyState = {};

// Pacman position.
let px = 10;
let py = 10;

// Pacman direction. 0 -> none, 1 -> up, 2 -> right, 3 -> down, 4 -> left.
let direction = 0;

// Pacman size.
const objectSize = 30;

// Position interval.
const positionInterval = 10;

// Pills. Array of x, y, type. type: 1 -> blue pill, 0 -> normal pill.
let pills = [];

// Pill distance.
const pillDistance = 40;

// Pill size.
const pillSize = 4;

// Rendered pill.
let canvasPill = document.createElement("canvas"),
pillContext = canvasPill.getContext("2d");
canvasPill.width = canvasPill.height = pillSize;
pillContext.fillStyle = 'yellow';
pillContext.fillRect(0, 0, pillSize, pillSize);
pillContext.stroke();

// Blue pill.
let canvasBluePill = document.createElement("canvas"),
pillBlueContext = canvasBluePill.getContext("2d");
canvasBluePill.width = canvasBluePill.height = pillSize * 2;
pillBlueContext.fillStyle = 'blue';
pillBlueContext.fillRect(0, 0, pillSize * 2, pillSize * 2);
pillBlueContext.stroke();

// True if the blue pill is active.
let bluePillIsActive = false;

// Ghosts position. x, y, direction, color.
let ghostsPosition = [
  {x: 10 + pillDistance * 6, y: 10 + pillDistance * 6, direction: 0, color: "blue"},
  {x: 10 + pillDistance * 7, y: 10 + pillDistance * 6, direction: 0, color: "red"},
  {x: 10 + pillDistance * 8, y: 10 + pillDistance * 6, direction: 0, color: "pink"},
];

// Wall that ghosts can pass through. [x, y], width, height.
let canvasGhostGate = document.createElement("canvas"),
ghostGateContext = canvasGhostGate.getContext("2d");
canvasGhostGate.width = 10 + pillDistance;
canvasGhostGate.height = 2;
ghostGateContext.fillStyle = 'yellow';
ghostGateContext.fillRect(0, 0, 10 + pillDistance, 2);
ghostGateContext.stroke();

// Helper constant for ghosts to get out.
const ghostGate = [[pillDistance * 7, pillDistance * 6], 10 + pillDistance, 2];

// Initialize walls.
const walls = [
  // Outer walls.
  [[0, 0], 570, 10],
  [[560, 0], 10, 570],
  [[0, 560], 570, 10],
  [[0, 0], 10, 570],
  [[0, 0], 10, 570],
  // Ghost wall.
  [[pillDistance * 6, pillDistance * 6], 10 + pillDistance * 3, 10 + pillDistance],
  // Other walls.
  // Upper-left.
  [[pillDistance, 0], 10, 10 + pillDistance * 7],
  [[pillDistance * 2, pillDistance], 10 + pillDistance * 5, 10],
  [[pillDistance, pillDistance * 2], 10 + pillDistance * 3, 10],
  [[pillDistance * 5, pillDistance * 2], 10 + pillDistance * 3, 10],
  [[pillDistance * 2, pillDistance * 3], 10 + pillDistance * 5, 10],
  [[pillDistance * 2, pillDistance * 4], 10, 10 + pillDistance * 5],
  [[pillDistance * 3, pillDistance * 4], 10, 10 + pillDistance * 3],
  [[pillDistance * 8, 0], 10, 10 + pillDistance * 5],
  [[pillDistance * 4, pillDistance * 4], 10 + pillDistance * 3, 10],
  [[pillDistance * 5, pillDistance * 5], 10 + pillDistance * 3, 10],
  [[pillDistance * 4, pillDistance * 5], 10, 10 + pillDistance * 2],
  [[pillDistance * 4, pillDistance * 8], 10, 10 + pillDistance],
  [[pillDistance * 3, pillDistance * 8], 10, 10 + pillDistance],
  [[pillDistance * 3, pillDistance * 9], 10 + pillDistance * 3, 10],
  [[pillDistance * 5, pillDistance * 6], 10, 10 + pillDistance * 2],
];

// Initial value to create walls only once.
let wallsCreated = false;

// Wall canvas.
var canvasWall = document.createElement("canvas"),
wallContext = canvasWall.getContext("2d");
canvasWall.width = canvasWall.height = 580;
wallContext.strokeStyle = '#0000FF';

function pacmanGame() {

  // Change direction based on keystate.
  if (keyState[38]) {
    if (detectObjectWallCollision(px, py - 10) == false) {
      direction = 1;
    }
  }
  else if (keyState[39]) {
    if (detectObjectWallCollision(px + 10, py) == false) {
      direction = 2;
    }
  }
  else if (keyState[40]) {
    if (detectObjectWallCollision(px, py + 10) == false) {
      direction = 3;
    }
  }
  else if (keyState[37]) {
    if (detectObjectWallCollision(px - 10, py) == false) {
      direction = 4;
    }
  }

  // Set background.
  canvasContext.fillStyle = "black";
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  // Set movement based on direction.
  switch(direction) {
    case 1:
      py = py - positionInterval;
      break;
    case 2:
      px = px + positionInterval;
      break;
    case 3:
      py = py + positionInterval;
      break;
    case 4:
      px = px - positionInterval;
      break;
  }

  // Set pacman position.
  canvasContext.fillStyle = "yellow";
  canvasContext.fillRect(px, py, objectSize, objectSize);

  // Create walls.
  createWalls();

  // Create pills.
  createPills();

  // Detect wall collision.
  detectWallCollision();

  // Detect pill collision.
  detectPillCollision();

  // Create ghosts.
  createGhosts();
}

// Create walls.
function createWalls() {
  if (wallsCreated == false) {
    for (var i = 0; i < walls.length; i++) {

      // Get line.
      x = walls[i][0][0];
      y = walls[i][0][1];
      width = walls[i][1];
      height = walls[i][2];

      wallContext.rect(x, y, width, height);
      wallContext.stroke();
    }
    wallsCreated = true;
  }
  else {
    canvasContext.drawImage(wallContext.canvas, 0, 0);

    // Create ghost gate.
    canvasContext.drawImage(ghostGateContext.canvas, ghostGate[0][0], ghostGate[0][1]);
  }
}

// Create pills.
function createPills() {
  // Initialize.
  if (pills.length == 0) {
    // Get all x,y values.
    for (var x = 23; x <= 570; x = x + pillDistance) {
      for (var y = 23; y <= 570; y = y + pillDistance) {

        // Create pills everywhere at the begining.

        // Randomly generate blue pill.
        if (Math.floor((Math.random() * 100) + 1) > 94) {
          var pill = [x - 3, y - 3, 1];
        }
        else {
          var pill = [x, y, 0];
        }

        pills.push(pill);
      }
    }

    // Remove pills based on collision with walls.
    for (var i = 0; i < pills.length; i++) {
      for (var w = 0; w < walls.length; w++) {
        if (pills[i][0] < walls[w][0][0] + walls[w][1] &&
          pills[i][0] + pillSize > walls[w][0][0] &&
          pills[i][1] < walls[w][0][1] + walls[w][2] &&
          pillSize + pills[i][1] > walls[w][0][1]) {

          // Set to -1000 to keep length and remove from viewport.
          pills[i][0] = -1000;
        }
      }
    }
  }
  else {
    for (var i = 0; i < pills.length; i++) {
      if (pills[i][2] == 1) {
        canvasContext.drawImage(pillBlueContext.canvas, pills[i][0], pills[i][1]);
      }
      else {
        canvasContext.drawImage(pillContext.canvas, pills[i][0], pills[i][1]);
      }
    }
  }
}

// Detect wall collision and stop pacman.
function detectWallCollision() {
  // Get if pacman is in path.
  if (direction != 0) {

    switch(direction) {
      case 1:
        if (detectObjectWallCollision(px, py - 10) == true) {
          direction = 0;
        }
        break;
      case 2:
        if (detectObjectWallCollision(px + 10, py) == true) {
          direction = 0;
        }
        break;
      case 3:
        if (detectObjectWallCollision(px, py + 10) == true) {
          direction = 0;
        }
        break;
      case 4:
        if (detectObjectWallCollision(px - 10, py) == true) {
          direction = 0;
        }
        break;
    }
  }
}
/**
 * Detect object collision with walls.
 *
 * @param integer x
 *   x position.
 * @param integer y
 *   y position.
 *
 * @returns boolean
 *   True if there is collision.
 */
function detectObjectWallCollision(x, y) {

  for (var i = 0; i < walls.length; i++) {
    // Collision detection.
    // rect1.x < rect2.x + rect2.w &&
    // rect1.x + rect1.w > rect2.x &&
    // rect1.y < rect2.y + rect2.h &&
    // rect1.h + rect1.y > rect2.y
    if (x < walls[i][0][0] + walls[i][1] &&
       x + objectSize > walls[i][0][0] &&
       y < walls[i][0][1] + walls[i][2] &&
       objectSize + y > walls[i][0][1]) {

       return true;
    }
  }

  return false;
}

// Detect pill collision.
function detectPillCollision() {

  for (var i = 0; i < pills.length; i++) {
    if (px < pills[i][0] + pillSize &&
      px + objectSize > pills[i][0] &&
      py < pills[i][1] + pillSize &&
      objectSize + py > pills[i][1]) {

      // Set to -1000 to keep length and remove from viewport.
      pills[i][0] = -1000;

      // If it is blue pill set chase mode on.
      if (pills[i][2] == 1) {
        bluePillIsActive = true;
        setTimeout(function(){ bluePillIsActive = false; },
          Math.floor((Math.random() * 3000) + 3000));
      }
    }
  }
}

// Create ghosts.
function createGhosts() {
  // Set ghosts position.
  setGhostsPosition();

  // Render ghosts.
  ghostsPosition.forEach(ghostPosition => {
    canvasContext.fillStyle = ghostPosition.color;
    canvasContext.fillRect(ghostPosition.x, ghostPosition.y, objectSize, objectSize);
  });
}

// Set ghosts potition.
function setGhostsPosition() {

}
