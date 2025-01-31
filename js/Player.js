class Player extends Element {
  constructor(elementId, frameWidth, frameHeight, totalFrames, gameScreen) {
    const element = document.getElementById(elementId);
    super(
      element.offsetLeft,
      element.offsetTop,
      element.clientWidth,
      element.clientHeight
    );
    this.gameScreen = document.getElementById("game-screen") || gameScreen;
    this.element = element;
    this.isWalking = false;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.totalFrames = totalFrames;
    this.currentFrame = 0;
    this.animationInterval = null;
    this.walkTimeout = null;

    this.isJumping = false;
    this.isFalling = false;

    const floorHeight = 62;

    this.screenMargin = 30;
    this.minX = this.screenMargin;
    this.maxX = this.gameScreen.clientWidth - this.screenMargin;

    this.setPosition(
      this.gameScreen.clientWidth / 2,
      this.gameScreen.clientHeight - floorHeight - this.height
    );

    this.element.style.position = "absolute";
    this.element.style.bottom = `${floorHeight}px`;
    this.element.style.transform = "translateX(-50%)";

    // Movement smoothing properties - adjusted for faster movement
    this.currentVelocity = 0;
    this.targetVelocity = 0;
    this.acceleration = 0.8; // Increased from 0.6
    this.deceleration = 0.8;
    this.maxVelocity = 4; // Increased from 3
    this.movementScale = 0.4; // Increased from 0.3

    // Start movement update loop
    this.updateMovement();
  }

  setFrame(frameIndex) {
    const x = frameIndex * (this.frameWidth * 1.2);
    this.element.style.backgroundPosition = `-${x}px 0`;
  }

  animateFrames(startFrame, endFrame, frameDuration, callback) {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    this.currentFrame = startFrame;
    this.animationInterval = setInterval(() => {
      this.setFrame(this.currentFrame);

      if (this.currentFrame >= endFrame) {
        clearInterval(this.animationInterval);
        if (callback) callback();
      } else {
        this.currentFrame++;
      }
    }, frameDuration);
  }

  move(deltaX) {
    if (!this.gameScreen) return;

    // Set target velocity based on input
    this.targetVelocity = deltaX * this.movementScale;

    if (!this.isWalking) {
      this.startWalking();
    }

    // Update character direction
    if (deltaX < 0) {
      this.element.style.transform = "translateX(-50%) scaleX(-1)";
    } else if (deltaX > 0) {
      this.element.style.transform = "translateX(-50%) scaleX(1)";
    }

    clearTimeout(this.walkTimeout);
    this.walkTimeout = setTimeout(() => {
      this.stopWalking();
      this.targetVelocity = 0;
    }, 150);
  }

  updateMovement() {
    // Smoothly interpolate current velocity towards target
    const velocityDiff = this.targetVelocity - this.currentVelocity;
    if (Math.abs(velocityDiff) > 0.1) {
      this.currentVelocity +=
        velocityDiff *
        (this.targetVelocity === 0 ? this.deceleration : this.acceleration);
    } else {
      this.currentVelocity = this.targetVelocity;
    }

    // Apply movement with boundary checking
    if (Math.abs(this.currentVelocity) > 0.1) {
      const newX = Math.max(
        this.minX,
        Math.min(this.x + this.currentVelocity, this.maxX)
      );
      this.setPosition(newX, this.y);
    }

    // Continue the movement update loop
    requestAnimationFrame(() => this.updateMovement());
  }

  jump() {
    if (this.isJumping || this.isFalling) return;

    this.isJumping = true;

    const jumpHeight = 110;
    const jumpDuration = 400; // Increased from 400 for softer animation
    const initialY = this.y;
    const peakY = initialY - jumpHeight;

    const upDuration = jumpDuration / 2;
    this.element.style.transition = `top ${upDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`; // Smoother transition
    this.setPosition(this.x, peakY);

    setTimeout(() => {
      this.element.style.transition = `top ${upDuration}ms cubic-bezier(0.4, 0.2, 0.2, 1)`; // Softer landing
      this.setPosition(this.x, initialY);

      setTimeout(() => {
        this.isJumping = false;
      }, upDuration);
    }, upDuration);
  }

  setPosition(x, y) {
    // Ensure x position stays within bounds
    x = Math.max(this.minX, Math.min(x, this.maxX));

    this.x = x;
    this.y = y;
    this.element.style.left = `${x}px`;
    const bottomPosition = this.gameScreen.clientHeight - y - this.height;
    this.element.style.bottom = `${bottomPosition}px`;
  }

  startWalking() {
    this.isWalking = true;
    this.element.classList.add("walk");
  }

  stopWalking() {
    this.isWalking = false;
    this.element.classList.remove("walk");
  }

  updatePosition() {
    this.x = this.element.offsetLeft;
    this.y =
      this.gameScreen.clientHeight -
      parseInt(this.element.style.bottom) -
      this.height;
  }

  checkCollision(meteor) {
    const playerRect = this.element.getBoundingClientRect();
    const meteorRect = meteor.element.getBoundingClientRect();

    return !(
      playerRect.right < meteorRect.left ||
      playerRect.left > meteorRect.right ||
      playerRect.bottom < meteorRect.top ||
      playerRect.top > meteorRect.bottom
    );
  }

  explode() {
    this.element.classList.add("explode-character");

    this.animateFrames(14, 16, 170, () => {
      this.setFrame(0);
      this.element.classList.remove("explode-character");
    });
  }
}
