let darkbg, ltbg;
let bodyFrames = [], frontLightFrames = [], backLightFrames = [];
let currentFrame = 0; // body / frontLight / backLight 三者同步的帧
let fireworksBehind = []; // "身后"烟花
let fireworksFront = [];  // "身前"烟花

function preload() {
  darkbg = loadImage('1227pics/Darkbg.png');
  ltbg   = loadImage('1227pics/Ltbg.png');
  
  for (let i = 1; i <= 4; i++) {
    bodyFrames.push(loadImage(`1227pics/Body/body0000${i}.png`));
    frontLightFrames.push(loadImage(`1227pics/Front light/frontlight0000${i}.png`));
    backLightFrames.push(loadImage(`1227pics/backlight0000${i}.png`));
  }
}

function setup() {
  createCanvas(bodyFrames[0].width, bodyFrames[0].height);
  frameRate(12);

}

function draw() {
  background(0); 


  image(darkbg, 0, 0, width, width);


  let behindData = getFireworksData(fireworksBehind);


  colorMode(HSB, 255);
  let ltbgColor = color(behindData.r, behindData.g, behindData.b);
  let ltbgHue = hue(ltbgColor);
  let ltbgSaturation = constrain(saturation(ltbgColor) * 0.5, 0, 255);
  let ltbgBrightness = constrain(brightness(ltbgColor) * 1.2, 0, 255);
  tint(ltbgHue, ltbgSaturation, ltbgBrightness, behindData.alpha);
  image(ltbg, 0, 0, width, width);
  noTint();
  colorMode(RGB, 255); 


  blendMode(HARD_LIGHT);
  for (let i = fireworksBehind.length - 1; i >= 0; i--) {
    let fw = fireworksBehind[i];
    fw.update();
    fw.show();
    if (fw.done()) {
      fireworksBehind.splice(i, 1);
    }
  }
  blendMode(BLEND);



  //tint(behindData.r*1.5, behindData.g*1.5, behindData.b*1.5, behindData.alpha);
  image(bodyFrames[currentFrame], bodyFrames[0].width * 0.05, 0);
  //noTint();


  blendMode(HARD_LIGHT);
  tint(behindData.r*1.5, behindData.g*1.5, behindData.b*1.5, behindData.alpha);
  image(backLightFrames[currentFrame], width * 0.05, 0);
  noTint();
  blendMode(BLEND);


  blendMode(HARD_LIGHT);
  for (let i = fireworksFront.length - 1; i >= 0; i--) {
    let fw = fireworksFront[i];
    fw.update();
    fw.show();
    if (fw.done()) {
      fireworksFront.splice(i, 1);
    }
  }
  blendMode(BLEND);


  let frontData = getFireworksData(fireworksFront);
  // frontData: {count, alpha, r, g, b}


  blendMode(OVERLAY);
  tint(frontData.r*1.5, frontData.g*1.5, frontData.b*1.5, frontData.alpha);
  image(frontLightFrames[currentFrame], width * 0.05, 0);
  noTint();
  blendMode(BLEND);


  if (frameCount % 2 === 0) {
    currentFrame = (currentFrame + 1) % bodyFrames.length;
  }
}

/**
 * 计算指定烟花数组 (fireworksArr) 的：
 * - 总粒子数 (count)
 * - 所有粒子的寿命(lifespan)累加 (sumLife)
 * - 所有粒子的颜色加权平均 (r, g, b)
 * - 综合透明度 alpha
 *
 * 返回一个对象： { count, alpha, r, g, b }
 */
function getFireworksData(fireworksArr) {
  let totalParticles = 0;
  let sumLife = 0;    // 用于累加所有粒子的 lifespan
  let rSum = 0, gSum = 0, bSum = 0; // 用于加权颜色

  for (let fw of fireworksArr) {
    for (let p of fw.particles) {
      totalParticles++;
      sumLife += p.lifespan;
      rSum += red(p.fireworkColor)   * p.lifespan;
      gSum += green(p.fireworkColor) * p.lifespan;
      bSum += blue(p.fireworkColor)  * p.lifespan;
    }
  }


  if (totalParticles === 0) {
    return { count: 0, alpha: 0, r: 255, g: 255, b: 255 };
  }


  let rAvg = rSum / sumLife;
  let gAvg = gSum / sumLife;
  let bAvg = bSum / sumLife;


  let factor = 0.01;
  let alphaVal = sumLife * factor;
  if (alphaVal > 255) alphaVal = 255; // 最大值不超过 255

  return {
    count: totalParticles,
    alpha: alphaVal,
    r: rAvg,
    g: gAvg,
    b: bAvg
  };
}


function windowResized() {

}

// 点击画布时，随机放置烟花在身前或身后
function mousePressed() {
  if (random(1) < 0.5) {
    fireworksBehind.push(new Firework(mouseX, mouseY));
  } else {
    fireworksFront.push(new Firework(mouseX, mouseY));
  }
}


class Firework {
  constructor(x, y) {
    this.particles = [];
    let particleCount = floor(random(150, 200));
<<<<<<< HEAD

=======
>>>>>>> 22f63c4 (1227)

    colorMode(HSB, 255);
    let c = color(
      random(0, 255), // 色相
      random(30,180), // 饱和度
      random(230,255) // 亮度
    );
    colorMode(RGB, 255); 

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(x, y, c));
    }
  }

  update() {
    for (let p of this.particles) {
      p.update();
    }
  }

  show() {
    for (let p of this.particles) {
      p.show();
    }
  }

  done() {
    return this.particles.every(p => p.finished());
  }
}

class Particle {
  constructor(x, y, c) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(15, 40));
    this.acc = createVector(0, random(1, 4));
    // 初始寿命
    this.lifespan = 255;
    this.fireworkColor = c;
    // 粒子形状
    this.shapeType = random(['square', 'circle']);
    // 粒子尺寸
    this.size = floor(random(2, 10));
    this.delay = 14;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    if (this.delay <= 0) {
      this.lifespan -= random(10, 25);
    } else {
      this.delay--;
    }
  }

  finished() {
    return this.lifespan < 0;
  }

  show() {
    let blinkAlpha = this.lifespan * (sin(frameCount * 3) * 0.5 + 0.5);

    push();
    noStroke();
    fill(
      red(this.fireworkColor),
      green(this.fireworkColor),
      blue(this.fireworkColor),
      blinkAlpha * 0.3
    );
    ellipse(this.pos.x, this.pos.y, this.size * 2, this.size * 2);
    pop();


    push();
    noStroke();
    fill(
      red(this.fireworkColor),
      green(this.fireworkColor),
      blue(this.fireworkColor),
      blinkAlpha
    );

    if (this.shapeType === 'square') {
      rectMode(CENTER);
      rect(this.pos.x, this.pos.y, this.size, this.size);
    } else {
      ellipse(this.pos.x, this.pos.y, this.size);
    }
    pop();
  }
}

