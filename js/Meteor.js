

export class Meteor extends Element {
  constructor(container, imageSrc) {
    const meteor = document.createElement("div");
    meteor.style.width = "60px";
    meteor.style.height = "80px";
    meteor.style.background = `url('${imageSrc}') no-repeat center center / cover`;
    meteor.style.position = "absolute";
    //meteor.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    //meteor.style.top = "0px";

    const gameScreen = document.getElementById("game-screen");
    const maxX = gameScreen.clientWidth - 60; // Subtract meteor width to keep fully in bounds
    meteor.style.left = `${Math.random() * maxX}px`;
    meteor.style.top = "0px";

    container.appendChild(meteor);

    super(
      meteor.offsetLeft,
      meteor.offsetTop,
      meteor.clientWidth,
      meteor.clientHeight
    );
    this.element = meteor;
    this.fallInterval = null;

    // Initialize explosion sound and interval arrays as instance variables
    this.activeExplosionSounds = [];
    this.activeExplosionIntervals = [];

    this.gameScreen = gameScreen;
  }

  fall(speed, onImpact) {
    const floor = this.gameScreen.clientHeight - 68; // Floor position, adjusted for game screen

    this.fallInterval = setInterval(() => {
      this.y += speed;
      this.element.style.top = `${this.y}px`;
      this.element.style.left = `${this.x}px`;

    
      if (this.y + this.height >= floor) {
        this.explodeMeteor(false);
        clearInterval(this.fallInterval);
        if (onImpact) onImpact(this);
      } else if (onImpact && onImpact(this)) {
        clearInterval(this.fallInterval);
      }
    }, 50);
  }

  
  explodeMeteor(hitByPlayer = false) {
    this.element.classList.add("explode");
    const numFrames = 6;
    let currentFrame = 1;
    const explosionSoundInstance = new Audio(
      "assets/sounds/distorted-abyss-explosion.wav"
    );
    explosionSoundInstance.volume = 0.5;
    explosionSoundInstance.currentTime = 0;
    explosionSoundInstance.play();
    
    this.activeExplosionSounds.push(explosionSoundInstance);

    this.loopCount = 0;

       if (this.explosionInterval) {
         clearInterval(this.explosionInterval);
       }
    

   this.explosionInterval = setInterval(() => {
     this.element.style.backgroundImage = `url('./assets/explosion/PNG/Smoke/Smoke${currentFrame}.png')`;
     currentFrame++;

     if (currentFrame > numFrames) {
       currentFrame = 1; 
       this.loopCount++; 

       if (this.loopCount >= 3) {
         setTimeout(() => this.remove(), 100);
         clearInterval(this.explosionInterval);
         return;
       }
     }
   }, 100);
   
    if (hitByPlayer) {
      setTimeout(() => this.remove(), 300);
    }
  
  }

  remove() {
    if (this.fallInterval) clearInterval(this.fallInterval); // Stop falling interval
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element); // Remove meteor from DOM
    }

    // Clean up any active explosion sounds and intervals
    this.activeExplosionSounds.forEach((sound) => sound.pause());
    this.activeExplosionIntervals.forEach((interval) =>
      clearInterval(interval)
    );
  }
}
