import { Meteor } from "./Meteor.js";

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
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
  const resetButton = document.getElementById("reset-scores");
  const persistentTable = document.querySelector(
    "#persistent-score-table tbody"
  );
  const persistentContainer = document.querySelector(
    ".persistent-score-container"
  );

  // Game state variables
  let player;
  let keyState = {};
  let lives = 5;
  let currentLevel = 1;
  let activeMeteors = [];
  let meteorsInterval;
  let meteorsAvoided = 0;
  let levelPassed = false;
  let activeExplosionSounds = [];
  let activeExplosionIntervals = [];
  let isGameOver = false;

  // Score handling functions
  function getTopScores() {
    const scores = JSON.parse(localStorage.getItem("topScores")) || [];
    return scores;
  }

  function updateAllScoreTables() {
    const scores = getTopScores();

    const populateTable = (table) => {
      if (!table) return;
      table.innerHTML = "";

      if (scores.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 3;
        cell.textContent = "No scores yet";
        cell.style.textAlign = "center";
        return;
      }

      scores.forEach((score, index) => {
        const row = table.insertRow();
        const rankCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        const levelCell = row.insertCell(2);

        rankCell.textContent = index + 1;
        nameCell.textContent = score.name;
        levelCell.textContent = score.level;
      });
    };

    populateTable(scoreTable);
    populateTable(persistentTable);

    if (persistentContainer) {
      persistentContainer.style.display = scores.length > 0 ? "block" : "none";
    }
  }

  function saveScore(playerName, level) {
    const scores = getTopScores();
    scores.push({ name: playerName, level: level });
    scores.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

    if (scores.length > 3) {
      scores.length = 3;
    }

    localStorage.setItem("topScores", JSON.stringify(scores));
    updateAllScoreTables();
  }

  function resetScoreTable() {
    localStorage.removeItem("topScores");
    updateAllScoreTables();
  }

  // Game functions
  function startGame() {
    console.log("starting game...");
    isGameOver = false;
    if (backgroundMusic.paused) {
      backgroundMusic.volume = 0;
      backgroundMusic.play();
      fadeInBackgroundMusic();
    }

    switchScreens(startScreen, gameScreen);
    player = new Player("character", 54, 60, 24);
    lives = 5;
    currentLevel = 1;
    meteorsAvoided = 0;
    levelPassed = false;

    updateLevelIndicator();
    updateLivesWithHearts(lives);
    startLevel();
  }

  function fadeInBackgroundMusic() {
    let fadeDuration = 3000;
    let fadeStep = 0.05;
    let currentVolume = 0;
    const maxBackgroundVolume = 0.4;

    const fadeInterval = setInterval(() => {
      if (isGameOver) {
        clearInterval(fadeInterval);
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        return;
      }

      currentVolume += fadeStep;
      if (currentVolume >= maxBackgroundVolume) {
        currentVolume = maxBackgroundVolume;
        clearInterval(fadeInterval);
      }
      backgroundMusic.volume = currentVolume;
    }, fadeDuration / (1 / fadeStep));
  }

  function restartGame() {
    isGameOver = false;
    switchScreens(gameOverScreen, gameScreen);
    player = new Player("character", 54, 60, 24);

    if (backgroundMusic.paused) {
      backgroundMusic.volume = 0;
      backgroundMusic.play();
      fadeInBackgroundMusic();
    }

    lives = 5;
    currentLevel = 1;
    meteorsAvoided = 0;
    levelPassed = false;
    updateLevelIndicator();
    updateLivesWithHearts(lives);
    startLevel();
  }

  function updateLevelIndicator() {
    levelText.textContent = currentLevel;
  }

  function startLevel() {
    const backgroundNumber = ((currentLevel - 1) % 4) + 1;
    gameScreen.style.backgroundImage = `url('./assets/background${backgroundNumber}.png')`;
    gameScreen.style.backgroundSize = "cover";

    const totalMeteors = Math.ceil(5.5 * currentLevel);
    const speed = 6 + currentLevel;
    meteorsAvoided = 0;
    levelPassed = false;
    arrowIndicator.style.display = "none";

    if (meteorsInterval) {
      clearInterval(meteorsInterval);
    }

    const baseInterval = 720;
    const intervalReductionPerLevel = 100;
    const minInterval = 450;

    const spawnInterval = Math.max(
      minInterval,
      baseInterval - (currentLevel - 1) * intervalReductionPerLevel
    );

    meteorsInterval = setInterval(() => {
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
    }, spawnInterval);
  }

  function movePlayer(e) {
    if (!player) return;

    const stepSize = 10;

    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        player.move(-stepSize);
        break;
      case "ArrowRight":
      case "KeyD":
        player.move(stepSize);
        break;
      case "ArrowUp":
      case "Space":
      case "KeyW":
        player.jump();
        break;
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

    const levelUpSound = new Audio("assets/sounds/cartoon-boink.wav");
    levelUpSound.volume = 0.8;
    levelUpSound.play();
    currentLevel++;
    updateLevelIndicator();
    arrowIndicator.style.display = "block";
    levelPassed = false;

    player.setPosition(0, player.y);
    setTimeout(() => startLevel(), 100);
  }

  function showNextLevelIndicator() {
    arrowIndicator.style.display = "block";
  }

  function checkCollision(meteor, player) {
    player.updatePosition();

    if (player.checkCollision(meteor)) {
      const impactSound = new Audio("assets/sounds/pain.wav");
      impactSound.volume = 0.4;
      impactSound.play();

      meteor.explodeMeteor(true);
      player.explode();
      handleCollision();
      return true;
    }
    if (meteor.y + meteor.height >= window.innerHeight) {
      meteor.explodeMeteor(false);
      return true;
    }
    return false;
  }

  function updateLivesWithHearts(numOfLives, hit) {
    livesElement.innerHTML = "";

    for (let i = 0; i < numOfLives; i++) {
      const heartImg = document.createElement("img");
      heartImg.className = "heart-image";
      heartImg.src = "./assets/heart-pixel-art-32x32.png";
      heartImg.alt = "Heart";

      if (hit && i === numOfLives - 1) {
        heartImg.classList.add("blink-heart");
      }

      livesElement.appendChild(heartImg);
    }
  }

  function handleCollision() {
    lives--;
    livesText.textContent = lives;
    player.explode();
    updateLivesWithHearts(lives, true);

    if (lives <= 0) {
      endGame();
    }
  }

  function endGame() {
    isGameOver = true;
    clearInterval(meteorsInterval);

    activeMeteors.forEach((meteor) => {
      if (meteor.activeExplosionSounds) {
        meteor.activeExplosionSounds.forEach((sound) => {
          sound.pause();
          sound.currentTime = 0;
        });
      }
      if (meteor.explosionInterval) {
        clearInterval(meteor.explosionInterval);
      }
      meteor.remove();
    });
    activeMeteors = [];

    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }

    activeExplosionIntervals.forEach((interval) => clearInterval(interval));
    activeExplosionIntervals = [];

    activeExplosionSounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
    activeExplosionSounds = [];

    setTimeout(() => {
      const gameOverSound = new Audio("assets/sounds/game-over.wav");
      gameOverSound.volume = 0.7;
      gameOverSound.play();

      gameOverSound.addEventListener(
        "ended",
        () => {
          gameOverSound.pause();
          gameOverSound.currentTime = 0;
        },
        { once: true }
      );
    }, 100);

    switchScreens(gameScreen, gameOverScreen);
    gameOverScreen.style.backgroundImage = `url('./assets/background3.png')`;
    gameOverScreen.style.backgroundSize = "cover";
  }

  function switchScreens(hideScreen, showScreen) {
    startScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    showScreen.classList.remove("hidden");
  }

  // Event Listeners
  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);
  resetButton.addEventListener("click", resetScoreTable);

  document.addEventListener("keydown", (e) => {
    keyState[e.code] = true;
    movePlayer(e);
  });

  document.addEventListener("keyup", (e) => {
    keyState[e.code] = false;
  });

  submitButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    if (playerName && currentLevel) {
      saveScore(playerName, currentLevel);
      playerNameInput.value = "";
    } else {
      alert("Please enter a valid name.");
    }
  });

  playerNameInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const playerName = playerNameInput.value.trim();
      if (playerName && currentLevel) {
        saveScore(playerName, currentLevel);
        playerNameInput.value = "";
      } else {
        alert("Please enter a valid name.");
      }
    }
  });

  // Initialize scores
  updateAllScoreTables();
});
