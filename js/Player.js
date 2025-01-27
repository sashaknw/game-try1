class Player extends Element {
  constructor(elementId) {
    const element = document.getElementById(elementId);
    super(
      element.offsetLeft,
      element.offsetTop,
      element.clientWidth,
      element.clientHeight
    );
    this.element = element;
    this.isWalking = false;

    this.setPosition(this.x, this.y + 32);
  }

  move(deltaX) {
    this.x = Math.max(
      0,
      Math.min(this.x + deltaX, gameScreen.clientWidth - this.width)
    );
    this.element.style.left = `${this.x}px`;

    if (!this.isWalking) {
      this.startWalking();
    }

    clearTimeout(this.walkTimeout);
    this.walkTimeout = setTimeout(() => this.stopWalking(), 200);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px` ;
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
    this.element.classList.add("explode");
    this.element.style.backgroundImage = `url('./assets/explosion/PNG/Smoke/Smoke${currentFrame}.png')`;
    currentFrame++;
    
   
}
}
