const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const meteorsContainer = document.getElementById("meteors");
const livesText = document.getElementById("lives");
const levelText = document.getElementById("level");
const arrowIndicator = document.getElementById("arrow-indicator");

let player;
let lives = 5;
let currentLevel = 1;
let meteorsInterval;
let meteorsAvoided = 0;
let levelPassed = false;

// Event Listeners
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
document.addEventListener("keydown", (e) => movePlayer(e));

function updateLevelIndicator() {
  levelText.textContent = currentLevel;
}

function startGame() {
  switchScreens(startScreen, gameScreen);
  player = new Player("character");
  lives = 5;
  currentLevel = 1;
  meteorsAvoided = 0;
  levelPassed = false;
  updateLevelIndicator();
  livesText.textContent = lives;
  startLevel();
}

function restartGame() {
  switchScreens(gameOverScreen, gameScreen);
  player = new Player("character");
  

  lives = 5;
  currentLevel = 1;
  meteorsAvoided = 0;
  levelPassed = false;
  updateLevelIndicator();
  livesText.textContent = lives;
  startLevel();

}

function startLevel() {
  const backgroundNumber = ((currentLevel - 1) % 4) + 1; 
  gameScreen.style.backgroundImage = `url('./assets/background${backgroundNumber}.png')`;
  gameScreen.style.backgroundSize = "cover";

  const totalMeteors = 5 * currentLevel; 
  const speed = 5 + currentLevel; 
  meteorsAvoided = 0;
  levelPassed = false;
  arrowIndicator.style.display = "none";

  if (meteorsInterval) {
    clearInterval(meteorsInterval);
  }
  const baseInterval = 800; 
  const intervalReductionPerLevel = 100; 
  const minInterval = 500; 

  meteorsInterval = setInterval(() => {
    const meteor = new Meteor(
      meteorsContainer,
      "assets/meteors/flaming_meteor.png"
    );
    meteor.fall(speed, () => checkCollision(meteor, player));
    meteorsAvoided++;
    if (meteorsAvoided >= totalMeteors) {
      levelPassed = true;
      showNextLevelIndicator();
    }
  }, 1000 - currentLevel * intervalReductionPerLevel, minInterval); 
}

function movePlayer(e) {
  const stepSize = 30;
  if (e.key === "ArrowLeft") {
    player.move(-stepSize);
  } else if (e.key === "ArrowRight") {
    player.move(stepSize);
  }
  checkPlayerPosition();
}

function checkPlayerPosition() {
  if (player.x + player.width >= gameScreen.clientWidth && levelPassed) {
    advanceToNextLevel();
  }
}

function advanceToNextLevel() {
  if (!levelPassed) return;
  currentLevel++;
  updateLevelIndicator();
  arrowIndicator.style.display = "none";
  levelPassed = false;

  
  player.setPosition(0, player.y);
  setTimeout(() => startLevel(), 500);
}

function showNextLevelIndicator() {
  arrowIndicator.style.display = "block";
}

function checkCollision(meteor, player) {
  player.updatePosition();
  if (player.checkCollision(meteor)) {
    handleCollision();
    return true;
  } else if (meteor.y + meteor.height >= window.innerHeight) {
    explodeMeteor(meteor);
    return true;
  }
  return false;
}

function explodeMeteor(meteor) {
  //const explosionSound = document.getElementById("explosion-sound");
  //explosionSound.play();
  meteor.element.classList.add("explode"); 
   const numFrames = 6; 
  let currentFrame = 1;

  const explosionInterval = setInterval(() => {
    if (currentFrame > numFrames) {
      clearInterval(explosionInterval);
      meteor.remove(); 
    } else {
      meteor.element.style.backgroundImage = `url('./assets/explosion/PNG/Smoke/Smoke${currentFrame}.png')`; 
      currentFrame++;
    }
  }, 120);
}

function handleCollision() {
  lives--;
  livesText.textContent = lives;
  if (lives <= 0) {
    endGame();
  }
}

function endGame() {
  switchScreens(gameScreen, gameOverScreen);
  clearInterval(meteorsInterval);


   gameOverScreen.style.backgroundImage = `url('./assets/background3.png')`;
   gameOverScreen.style.backgroundSize = "cover";
}

function switchScreens(hideScreen, showScreen) {
  hideScreen.classList.add("hidden");
  showScreen.classList.remove("hidden");
}
