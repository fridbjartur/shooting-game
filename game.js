"use strict";

window.addEventListener("DOMContentLoaded", init);
const game = document.querySelector("#game");
const stage = document.querySelector("#stage");
const crosshair = document.querySelector("#crosshair_rect");
const crosshair_touch = document.querySelector("#crosshair");
const gun = document.querySelector("#gun");
const gunFlash = document.querySelector("#gun_flash");
const smoke = document.querySelector("#smoke");
const form = document.querySelector("form");
let target;
let latestTarget = null;
let pointCounter = 0;
let seconds = document.querySelector("#countdown span").textContent;

function init() {
  document.querySelector("#start_game").addEventListener("click", startGame);
}

function startGame() {
  document.querySelector("#startgame").style.display = "none";
  document.querySelector("#startTimer").style.display = "block";

  let elem = document.documentElement;
  console.log("requestFullscreen");
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }

  startCountdown();
}

function startCountdown() {
  console.log("counter");
  let startSeconds = document.querySelector("#startTimer").textContent;
  countDownSound();
  let startCount = setInterval(function() {
    startSeconds--;
    countDownSound();

    document.querySelector("#startTimer").textContent = startSeconds;
    if (startSeconds <= 0) clearInterval(startCount);
    if (startSeconds === 0) {
      setTimeout(() => {
        console.log("setTimeout start");
        document.querySelector("#startScreen").style.display = "none";
        start();
      }, 1000);
    }
  }, 1000);
}

function countDownSound() {
  console.log("countSound");
  let countSound = document.createElement("audio");
  countSound.src = "assets/sounds/beep.mp3";
  countSound.play();
  countSound.volume = 0.05;
}

function startSound() {
  let startSound = document.createElement("audio");
  startSound.src = "assets/sounds/startsound.mp3";
  startSound.play();
  startSound.volume = 0.08;
}

function start() {
  startSound();
  setTimeout(newTarget, 1000);
  setTimeout(countdown, 1000);
  // check for mouse
  game.addEventListener("mousemove", mouseInput, false);
  // check for touch device
  game.addEventListener("touchstart", touchInput);
}

function mouseInput() {
  // mouse is moved - set mouse event listners
  game.addEventListener("mousemove", mouseMove, false);
  game.addEventListener("mousedown", checkShot);
}

function touchInput() {
  game.removeEventListener("touchstart", touchInput);
  game.addEventListener("touchstart", touchShot, false);

  // the user is touching the screen for interaction - remove scene-displacement
  game.removeEventListener("mousemove", mouseInput, false);

  // Free curser from center
  crosshair_touch.classList.add("crosshair_absolute");
  touchShot();

  //hide gun
  document.querySelector("#gun").classList.add("hidden");
}

function touchShot(event) {
  // get touch x & y coordinates
  let x = event.touches[0].clientX;
  let y = event.touches[0].clientY;
  checkShot(x, y);

  // set center of crosshair
  x -= game.offsetLeft + 16;
  y -= game.offsetTop + 16;
  // move crosshair to touched spot
  crosshair_touch.style.left = 0 + "px";
  crosshair_touch.style.top = 0 + "px";
  crosshair_touch.style.transform = `translate(${x}px,${y}px)`;
}

function mouseMove(event) {
  // get mouse position
  let x = event.x;
  let y = event.y;
  x -= game.offsetLeft;
  y -= game.offsetTop;
  setMouseCenter(x, y);
}

function setMouseCenter(x, y) {
  // get #game container dimentions
  const gameWidth = game.offsetWidth;
  const gameHeight = game.offsetHeight;

  // get positions values from center of box
  // -1 to 1 ratio (x / imageWidth * range - center )
  const mouseXratio = (x / gameWidth) * 2 - 1;
  const mouseYratio = (y / gameHeight) * 2 - 1;
  moveStage(mouseXratio, mouseYratio);
}

function moveStage(mouseXratio, mouseYratio) {
  // move #stage based on mouse position
  const moveX = -mouseXratio * 25;
  const moveY = -mouseYratio * 25;
  stage.style.transform = `translate(${moveX}%,${moveY}%)`;
}

function newTarget() {
  let targetNumber = Math.floor(Math.random() * 12);

  if (latestTarget === targetNumber) {
    newTarget();
    return;
  }
  latestTarget = targetNumber;

  target = document.querySelector("#target-" + targetNumber);
  if (
    target.id === "target-4" ||
    target.id === "target-8" ||
    target.id === "target-10" ||
    target.id === "target-11"
  ) {
    target.classList.add("activeAlt");
  } else {
    target.classList.add("active");
  }

  setTimeout(flipSound, 100);
}

function checkShot(x, y) {
  console.log("checkShot");

  // get positions of elements with boundingClientRect
  const element_1 = crosshair.getBoundingClientRect();
  let element_2 = target.getBoundingClientRect();

  //check touch coordinats
  let touchX = x;
  let touchY = y;

  gun.classList.add("gun-animation");
  gun.addEventListener("animationend", removeGunClass);

  gunFlash.classList.add("flash-animation");
  gunFlash.addEventListener("animationend", removeGunClass);
  smoke.classList.add("smoke-animation");
  smoke.addEventListener("animationend", removeGunClass);

  function removeGunClass() {
    gun.classList.remove("gun-animation");
    gun.removeEventListener("animationend", removeGunClass);
    gunFlash.classList.remove("flash-animation");
    gunFlash.removeEventListener("animationend", removeGunClass);
    smoke.classList.remove("smoke-animation");
    smoke.removeEventListener("animationend", removeGunClass);
  }

  hitSound();

  // check for overlap of boxes
  if (
    (element_1.x > element_2.x &&
      element_1.y > element_2.y &&
      element_1.x < element_2.x + element_2.width &&
      element_1.y < element_2.y + element_2.height) ||
    (touchX > element_2.x &&
      touchY > element_2.y &&
      touchX < element_2.x + element_2.width &&
      touchY < element_2.y + element_2.height)
  ) {
    // START TARGET ANIMATION DOWN

    if (
      target.id === "target-4" ||
      target.id === "target-8" ||
      target.id === "target-10" ||
      target.id === "target-11"
    ) {
      const localTarget = target;
      localTarget.classList.remove("activeAlt");
      localTarget.classList.add("hideAlt");
      localTarget.addEventListener("animationend", removeHideAlt);

      function removeHideAlt() {
        localTarget.removeEventListener("animationend", removeHideAlt);
        localTarget.classList.remove("hideAlt");
      }
    } else {
      const localTarget = target;
      localTarget.classList.remove("active");
      localTarget.classList.add("hide");
      localTarget.addEventListener("animationend", removeHide);

      function removeHide() {
        localTarget.removeEventListener("animationend", removeHide);
        localTarget.classList.remove("hide");
      }
    }
    pointCounter++;
    document.querySelector("#pointSystem span").textContent = pointCounter;
    newTarget();
  }
}

function hitSound() {
  console.log("hitSound");
  let hitShot = document.createElement("audio");
  hitShot.src = "assets/sounds/deagle-shot.mp3";
  hitShot.play();
  hitShot.volume = 0.03;
}

function flipSound() {
  console.log("flipSound");
  let flipBoard = document.createElement("audio");
  flipBoard.src = "assets/sounds/flip2.mp3";
  flipBoard.play();
}

function countdown() {
  let countdown = setInterval(function() {
    seconds--;
    document.querySelector("#countdown span").textContent = seconds;
    if (seconds <= 5) {
      document.querySelector("#countdown span").style.color = "red";
      countDownSound();
    }
    if (seconds <= 0) {
      clearInterval(countdown);
      setTimeout(() => {
        game.removeEventListener("mousemove", mouseInput, false);
        // check for touch device
        game.removeEventListener("touchstart", touchInput);
        game.removeEventListener("touchstart", touchShot, false);
        game.removeEventListener("mousemove", mouseMove, false);
        game.removeEventListener("mousedown", checkShot);
        game.style.pointerEvents = "all";
        document.querySelector(
          ".points_placeholder_1"
        ).textContent = pointCounter;
        startSound();
        setTimeout(endScreen, 1000);
      }, 1000);
    }
  }, 1000);
}

function endScreen() {
  console.log("endscreen");
  document.exitFullscreen();
  document.querySelector("#endgame").style.visibility = "visible";
}
