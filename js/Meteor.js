class Meteor extends Element {
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
  }

  fall(speed, onImpact) {
    this.fallInterval = setInterval(() => {
      this.y += speed;
      this.element.style.top = `${this.y}px`;
      this.element.style.left = `${this.x}px`;

      if (this.y > window.innerHeight - 150) {
        explodeMeteor(this);
        clearInterval(this.fallInterval); // Stop falling once explosion happens
      } else if (onImpact(this)) {
        clearInterval(this.fallInterval);
      }
    }, 50);
  }

  remove() {
    if (this.fallInterval) clearInterval(this.fallInterval); // Stop falling interval
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element); // Remove meteor from DOM
    }
  }
}
