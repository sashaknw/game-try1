import { Meteor } from "./Meteor.js";
document.addEventListener("DOMContentLoaded", function () {
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

  // Event Listeners
  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);
  //  document.addEventListener("click", function () {
  //    if (!isGameOver && backgroundMusic.paused) {
  //      backgroundMusic.volume = 0;
  //      backgroundMusic.play();

  //      let fadeDuration = 3000;
  //      let fadeStep = 0.05;
  //      let currentVolume = 0;
  //      const maxBackgroundVolume = 0.4;

  //      let fadeInterval = setInterval(function () {
  //        if (isGameOver) {
  //          clearInterval(fadeInterval);
  //          backgroundMusic.pause();
  //          backgroundMusic.currentTime = 0;
  //          return;
  //        }

  //        currentVolume += fadeStep;
  //        if (currentVolume >= maxBackgroundVolume) {
  //          currentVolume = maxBackgroundVolume;
  //          clearInterval(fadeInterval);
  //        }
  //        backgroundMusic.volume = currentVolume;
  //      }, fadeDuration / (1 / fadeStep));
  //    }
  //  });

  // document.addEventListener("click", function () {
  //   if (backgroundMusic.paused) {
  //     backgroundMusic.volume = 0;
  //     backgroundMusic.play();

  //     let fadeDuration = 3000;
  //     let fadeStep = 0.05; // increment for volume change
  //     let currentVolume = 0;

  //     let fadeInterval = setInterval(function () {
  //       currentVolume += fadeStep;

  //       if (currentVolume >= 1) {
  //         currentVolume = 1;
  //         clearInterval(fadeInterval);
  //       }

  //       backgroundMusic.volume = currentVolume;
  //     }, fadeDuration / (1 / fadeStep));
  //   }
  // });

  // Event listener for key events
  document.addEventListener("keydown", (e) => {
    keyState[e.code] = true;
    movePlayer(e);
  });

  document.addEventListener("keyup", (e) => {
    keyState[e.code] = false;
  });

  resetButton.addEventListener("click", resetScoreTable);

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
    ///livesText.textContent = lives;
    updateLivesWithHearts(lives);

    console.log("started game");

    startLevel(); // Start the first level
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
  // Restart the game
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
    //livesText.textContent = lives;
    updateLivesWithHearts(lives);

    startLevel();
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

    // Increase initial meteor count by 10%
    const totalMeteors = Math.ceil(5.5 * currentLevel); // 5.5 instead of 5 for 10% increase
    const speed = 5 + currentLevel;
    meteorsAvoided = 0;
    levelPassed = false;
    arrowIndicator.style.display = "none";

    if (meteorsInterval) {
      clearInterval(meteorsInterval);
    }

    // Decrease base interval by 10% to spawn meteors more frequently
    const baseInterval = 720; // Reduced from 800 for 10% faster spawning
    const intervalReductionPerLevel = 100;
    const minInterval = 450; // Reduced from 500 for consistent scaling

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
    isGameOver = true;

    clearInterval(meteorsInterval);

    activeMeteors.forEach((meteor) => {
      // Stop explosion sounds
      if (meteor.activeExplosionSounds) {
        meteor.activeExplosionSounds.forEach((sound) => {
          sound.pause();
          sound.currentTime = 0;
        });
      }
      // Clear explosion intervals
      if (meteor.explosionInterval) {
        clearInterval(meteor.explosionInterval);
      }
      meteor.remove();
    });
    activeMeteors = [];

    // Stop background music
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }

    // Clear any remaining intervals
    activeExplosionIntervals.forEach((interval) => clearInterval(interval));
    activeExplosionIntervals = [];

    // Clear any remaining sounds
    activeExplosionSounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
    activeExplosionSounds = [];

    activeExplosionSounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
    activeExplosionSounds = [];

    // Add a small delay before playing game over sound
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

    // Switch screens and update background
    switchScreens(gameScreen, gameOverScreen);
    gameOverScreen.style.backgroundImage = `url('./assets/background3.png')`;
    gameOverScreen.style.backgroundSize = "cover";
  }

  // Switch between screens
  function switchScreens(hideScreen, showScreen) {
    console.log("Switching screens:", hideScreen, showScreen);
    startScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    // Then show only the target screen
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

    if (scores.length > 3) {
      scores.length = 3;
    }

    localStorage.setItem("topScores", JSON.stringify(scores));
  }

  // Function to display the top scores
 function displayTopScores() {
   const scores = getTopScores();
   const scoreTable = document.querySelector("#score-table tbody");
   const persistentTable = document.querySelector(
     "#persistent-score-table tbody"
   );

   // Function to populate a table
   const populateTable = (table) => {
     if (!table) return;
     table.innerHTML = "";

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

   // Update both tables
   populateTable(scoreTable);
   populateTable(persistentTable);
 }

  
  submitButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();

    if (playerName && currentLevel) {
    
      saveScore(playerName, currentLevel);
      displayTopScores();
  
      playerNameInput.value = "";
    } else {
      alert("Please enter a valid name.");
    }
  });

  //  Enter key press
  playerNameInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const playerName = playerNameInput.value.trim();

      if (playerName && currentLevel) {
       
        saveScore(playerName, currentLevel);
        displayTopScores(); 

        playerNameInput.value = "";
      } else {
        alert("Please enter a valid name.");
      }
    }
  });

  function resetScoreTable() {
    console.log("Reset button clicked");
    localStorage.removeItem("topScores");
    console.log("Local storage cleared:", localStorage.getItem("topScores")); // Should be null
    scoreTable.innerHTML = "";
    displayTopScores();
    console.log("Score table reset and updated");
  }

  // Show game over screen
  function showGameOverScreen() {
    switchScreens(gameScreen, gameOverScreen);
    displayTopScores();
  }

  // resetScoreTable();
});


// Add these functions to your existing script.js

function updateAllScoreTables() {
    const scores = getTopScores();
    const gameOverTable = document.querySelector('#score-table tbody');
    const persistentTable = document.querySelector('#persistent-score-table tbody');
    const persistentContainer = document.querySelector('.persistent-score-container');
    
    // Helper function to populate a table
    const populateTable = (table) => {
        if (!table) return;
        table.innerHTML = '';
        
        if (scores.length === 0) {
            const row = table.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 3;
            cell.textContent = 'No scores yet';
            cell.style.textAlign = 'center';
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

    // Update both tables
    populateTable(gameOverTable);
    populateTable(persistentTable);
    
    // Show/hide persistent score container based on scores
    persistentContainer.style.display = scores.length > 0 ? 'block' : 'none';
}

// Modify the existing saveScore function
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

// Modify the existing resetScoreTable function
function resetScoreTable() {
    localStorage.removeItem("topScores");
    updateAllScoreTables();
}

// Add to your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ... your existing code ...
    
    // Initial load of scores
    updateAllScoreTables();
    
    // Update your existing submit button event listener
    submitButton.addEventListener("click", () => {
        const playerName = playerNameInput.value.trim();
        if (playerName && currentLevel) {
            saveScore(playerName, currentLevel);
        } else {
            alert("Please enter a valid name.");
        }
    });
});