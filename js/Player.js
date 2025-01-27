class Player extends Element {
  constructor(elementId, frameWidth, frameHeight, totalFrames) {
    const element = document.getElementById(elementId);
    super(
      element.offsetLeft,
      element.offsetTop,
      element.clientWidth,
      element.clientHeight
    );
    this.element = element;
    this.isWalking = false;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.totalFrames = totalFrames;
    this.currentFrame = 0;
    this.animationInterval = null;

    this.isJumping = false;
    this.isFalling = false;

    this.setPosition(this.x, this.y + 32);

    this.velocityX = 0;
    this.velocityY = 0;
  
    //this.deceleration = 0.9; 
    this.friction = 0.98;

    this.maxSpeed = 2;  
  }

  setFrame(frameIndex) {
    const x = frameIndex * this.frameWidth;
    this.element.style.backgroundPosition = `-${x}px 0`;
  }

  animateFrames(startFrame, endFrame, frameDuration, callback) {
    this.currentFrame = startFrame;
    clearInterval(this.animationInterval);

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
    this.x = Math.max(
      0,
      Math.min(this.x + deltaX, gameScreen.clientWidth - this.width)
    );
    this.element.style.left = `${this.x}px`;

    if (deltaX < 0) {
      this.element.style.transform = "scaleX(-1)";
    } else if (deltaX > 0) {
      this.element.style.transform = "scaleX(1)";
    }

    if (!this.isWalking) {
      this.startWalking();
    }

    clearTimeout(this.walkTimeout);
    this.walkTimeout = setTimeout(() => this.stopWalking(), 150);
  }

  jump() {
    if (this.isJumping || this.isFalling) return; 

    this.isJumping = true;

    const startFrame = 7; 
    const endFrame = 9;

    // Animate the jump frames
    this.animateFrames(startFrame, endFrame, 24, () => {
      this.setFrame(0); 
    });

    // Simulate the jump arc
    const jumpHeight = 100; 
    const jumpDuration = 500; 
    const initialY = this.y;
    const peakY = initialY - jumpHeight;


    // move up
    const upDuration = jumpDuration - 3; 
    this.element.style.transition = `top ${upDuration}ms ease-out `;
    this.setPosition(this.x, peakY);

    // move down
    setTimeout(() => {
      this.element.style.transition = `top ${upDuration}ms ease-in`;
      this.setPosition(this.x, initialY);

      //end phase
      setTimeout(() => {
        this.isJumping = false;
      }, upDuration);
    }, upDuration);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
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
  }

  explode() {
    this.element.classList.add("explode-character");

    this.animateFrames(17, 20, 170, () => {
      this.setFrame(0);
      this.element.classList.remove("explode-character");
      console.log(`Exploding frame: ${this.currentFrame}`);
    });
  }
}



