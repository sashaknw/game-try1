document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  // Declare all constants first, to ensure they're ready to be used
  const startButton = document.getElementById("start-button");
  const restartButton = document.getElementById("restart-button");
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const meteorsContainer = document.getElementById("meteors");
  const livesText = document.getElementById("lives");
  const levelText = document.getElementById("level");
  const livesElement = document.getElementById("lives");
  const arrowIndicator = document.getElementById("arrow-indicator");
  const backgroundMusic = document.getElementById("background-music");
  const submitButton = document.getElementById("submit-score");
  const playerNameInput = document.getElementById("player-name");
  const scoreTable = document
    .getElementById("score-table")
    .getElementsByTagName("tbody")[0];
  let player; 
  let lives = 5;
  let currentLevel = 1;
  let activeMeteors = [];
  let meteorsInterval;
  let meteorsAvoided = 0;
  let levelPassed = false;
  let activeExplosionSounds = [];
  let activeExplosionIntervals = [];
  console.log("hiiii");

  // Event Listeners
  startButton.addEventListener("click", startGame);
  document.addEventListener("click", function () {
    alert("Start button clicked!");
    if (backgroundMusic.paused) {
      backgroundMusic.volume = 0;
      backgroundMusic.play();

      let fadeDuration = 3000;
      let fadeStep = 0.05; // increment for volume change
      let currentVolume = 0;

      let fadeInterval = setInterval(function () {
        currentVolume += fadeStep;

        if (currentVolume >= 1) {
          currentVolume = 1;
          clearInterval(fadeInterval);
        }

        backgroundMusic.volume = currentVolume;
      }, fadeDuration / (1 / fadeStep));
    }
  });

  // Event listener for key events
  document.addEventListener("keydown", (e) => movePlayer(e));
  document.addEventListener("keyup", (e) => {
    delete keyState[e.code];
  });

  // Function to start the game
  function startGame() {
    console.log("starting game...");
    switchScreens(startScreen, gameScreen);

    player = new Player("character", 45, 50, 24, gameScreen); // Create the player after screen switch

    lives = 5;
    currentLevel = 1;
    meteorsAvoided = 0;
    levelPassed = false;

    updateLevelIndicator();
    livesText.textContent = lives;
    updateLivesWithHearts(lives);

    console.log("started game");

    startLevel(); // Start the first level
  }

  // Restart the game
  function restartGame() {
    switchScreens(gameOverScreen, gameScreen);
    player = new Player("character", 45, 50, 24, gameScreen); // Reinitialize the player

    lives = 5;
    currentLevel = 1;
    meteorsAvoided = 0;
    levelPassed = false;
    updateLevelIndicator();
    livesText.textContent = lives;
    updateLivesWithHearts(lives);

    startLevel(); // Restart level
  }

  // Function to update the level indicator
  function updateLevelIndicator() {
    levelText.textContent = currentLevel;
  }

  // Function to start a new level
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

    meteorsInterval = setInterval(
      () => {
        const meteor = new Meteor(
          meteorsContainer,
          "assets/meteors/flaming_meteor.png"
        );
        activeMeteors.push(meteor);

        meteor.fall(speed, () => checkCollision(meteor, player));
        meteorsAvoided++;
        if (meteorsAvoided >= totalMeteors) {
          levelPassed = true;
          showNextLevelIndicator();
        }
      },
      1000 - currentLevel * intervalReductionPerLevel,
      minInterval
    );
  }

  // Function to move the player based on key events
  function movePlayer(e) {
    const stepSize = 30;
    if (e.key === "ArrowLeft") {
      player.move(-stepSize);
    } else if (e.key === "ArrowRight") {
      player.move(stepSize);
    } else if (e.key === "ArrowUp") {
      player.jump();
    }

    checkPlayerPosition();
  }

  // Function to check player's position and advance level if necessary
  function checkPlayerPosition() {
    if (player.x + player.width >= gameScreen.clientWidth && levelPassed) {
      advanceToNextLevel();
    }
  }

  // Advance to the next level
  function advanceToNextLevel() {
    if (!levelPassed) return;
    currentLevel++;
    updateLevelIndicator();
    arrowIndicator.style.display = "none";
    levelPassed = false;

    player.setPosition(0, player.y);
    setTimeout(() => startLevel(), 100);
  }

  // Function to show the next level indicator
  function showNextLevelIndicator() {
    arrowIndicator.style.display = "block";
  }

  // Check for collisions
  function checkCollision(meteor, player) {
    player.updatePosition();

    if (player.checkCollision(meteor)) {
      const impactSound = new Audio("assets/sounds/pain.wav");
      impactSound.volume = 0.5;
      impactSound.play();

      explodeMeteor(meteor, true);
      player.explode();
      handleCollision();
      return true;
    }
    if (meteor.y + meteor.height >= window.innerHeight) {
      explodeMeteor(meteor, false);
      return true;
    }
    return false;
  }

  // Explode meteor and play sound
  function explodeMeteor(meteor, hitByPlayer = false) {
    meteor.element.classList.add("explode");
    const numFrames = 6;
    let currentFrame = 1;
    const explosionSoundInstance = new Audio(
      "assets/sounds/distorted-abyss-explosion.wav"
    );
    explosionSoundInstance.currentTime = 0;
    explosionSoundInstance.play();

    activeExplosionSounds.push(explosionSoundInstance);

    const explosionInterval = setInterval(() => {
      if (currentFrame > numFrames) {
        clearInterval(explosionInterval);
        if (hitByPlayer) {
          meteor.remove();
        } else {
          setTimeout(() => meteor.remove(), 200);
        }
      } else {
        meteor.element.style.backgroundImage = `url('./assets/explosion/PNG/Smoke/Smoke${currentFrame}.png')`;
        currentFrame++;
      }
    }, 45);

    activeExplosionIntervals.push(explosionInterval);
  }

  // Update lives with heart images
  function updateLivesWithHearts(numOfLives, hit) {
    console.log(`Updating hearts: lives=${numOfLives}, hit=${hit}`);
    livesElement.innerHTML = "";

    for (let i = 0; i < numOfLives; i++) {
      const heartImg = document.createElement("img");
      heartImg.className = "heart-image";
      heartImg.src = "/assets/heart-pixel-art-32x32.png";
      heartImg.alt = "Heart";

      if (hit && i === numOfLives - 1) {
        console.log(`Blinking and hiding heart ${i + 1}`);
        heartImg.classList.add("blink-heart");
      }

      livesElement.appendChild(heartImg);
    }
    console.log(`Hearts rendered: ${numOfLives}`);
  }

  // Handle collisions and decrease lives
  function handleCollision() {
    lives--;
    livesText.textContent = lives;
    player.explode();

    updateLivesWithHearts(lives, true);
    console.log(lives);
    if (lives <= 0) {
      endGame();
    }
  }

  // End the game when lives reach 0
  function endGame() {
    const backgroundMusic = document.getElementById("background-music");
    backgroundMusic.pause();

    const gameOverSound = new Audio("assets/sounds/game-over.wav");
    gameOverSound.play();
    gameOverSound.loop = false;
    gameOverSound.volume = 0.7;
    switchScreens(gameScreen, gameOverScreen);
    clearInterval(meteorsInterval);

    activeExplosionSounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
    activeExplosionSounds = [];

    activeExplosionIntervals.forEach((interval) => clearInterval(interval));
    activeExplosionIntervals = [];

    activeMeteors.forEach((meteor) => {
      meteor.remove();
    });
    activeMeteors = [];

    gameOverScreen.style.backgroundImage = `url('./assets/background3.png')`;
    gameOverScreen.style.backgroundSize = "cover";
  }

  // Switch between screens
  function switchScreens(hideScreen, showScreen) {
     console.log("Switching screens:", hideScreen, showScreen);
    hideScreen.classList.add("hidden");
    showScreen.classList.remove("hidden");
  }

  // Function to get scores from localStorage
  function getTopScores() {
    const scores = JSON.parse(localStorage.getItem("topScores")) || [];
    return scores;
  }

  // Function to save a new score to localStorage
  function saveScore(playerName, level) {
    const scores = getTopScores();
    scores.push({ name: playerName, level: level });
    scores.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

    if (scores.length > 5) {
      scores.length = 5;
    }

    localStorage.setItem("topScores", JSON.stringify(scores));
  }

  // Function to display the top scores
  function displayTopScores() {
    const scores = getTopScores();
    scoreTable.innerHTML = "";
    scores.forEach((score, index) => {
      const row = scoreTable.insertRow();
      const rankCell = row.insertCell(0);
      const nameCell = row.insertCell(1);
      const levelCell = row.insertCell(2);

      rankCell.textContent = index + 1; // Rank
      nameCell.textContent = score.name;
      levelCell.textContent = score.level;
    });
  }

  // Submit score when button clicked
  submitButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    const playerLevel = currentLevel;

    if (playerName && playerLevel) {
      saveScore(playerName, playerLevel);
      displayTopScores();
    } else {
      alert("Please enter a valid name and level.");
    }
  });

  // Reset the scores table
  function resetScoreTable() {
    localStorage.removeItem("topScores");
    scoreTable.innerHTML = "";
    console.log("Score table reset");
  }

  // Show game over screen
  function showGameOverScreen() {
    switchScreens(gameScreen, gameOverScreen);
    displayTopScores();
  }

  
  // resetScoreTable();
});
