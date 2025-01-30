

export class Meteor extends Element {
  constructor(container, imageSrc) {
    const meteor = document.createElement("div");
    meteor.style.width = "60px";
    meteor.style.height = "80px";
    meteor.style.background = `url('${imageSrc}') no-repeat center center / cover`;
    meteor.style.position = "absolute";
    meteor.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
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
  }

  fall(speed, onImpact) {
    this.fallInterval = setInterval(() => {
      this.y += speed;
      this.element.style.top = `${this.y}px`;
      this.element.style.left = `${this.x}px`;

      if (this.y > window.innerHeight - 150) {
        this.explodeMeteor();
        clearInterval(this.fallInterval);
      } else if (onImpact(this)) {
        clearInterval(this.fallInterval);
      }
    }, 50);
  }

  // Explosion logic moved inside the class
  explodeMeteor(hitByPlayer = false) {
    this.element.classList.add("explode");
    const numFrames = 6;
    let currentFrame = 1;
    const explosionSoundInstance = new Audio(
      "assets/sounds/distorted-abyss-explosion.wav"
    );
    explosionSoundInstance.currentTime = 0;
    explosionSoundInstance.play();

    // Add sound to the instance's active explosion sounds
    this.activeExplosionSounds.push(explosionSoundInstance);

    const explosionInterval = setInterval(() => {
      if (currentFrame > numFrames) {
        clearInterval(explosionInterval);
        if (hitByPlayer) {
          this.remove();
        } else {
          setTimeout(() => this.remove(), 200);
        }
      } else {
        this.element.style.backgroundImage = `url('./assets/explosion/PNG/Smoke/Smoke${currentFrame}.png')`;
        currentFrame++;
      }
    }, 45);

    // Add interval to the instance's active explosion intervals
    this.activeExplosionIntervals.push(explosionInterval);
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
