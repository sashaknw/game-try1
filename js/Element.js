class Element {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  getRect() {
    const padding = 7;
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y + padding,
      bottom: this.y + this.height,
    };
  }

  checkCollision(otherElement) {
    const rect1 = this.getRect();
    const rect2 = otherElement.getRect();

    return (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    );
  }
}
