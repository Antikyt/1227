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
  // 使用人物首帧的尺寸来创建画布，保证 1:1 呈现
  createCanvas(bodyFrames[0].width, bodyFrames[0].height);
  frameRate(12);

}

function draw() {
  background(0); // 用黑色清理一下底色

  // 绘制最底层 darkbg，不留空白
  image(darkbg, 0, 0, width, width);

  // --- 1) 计算 "身后烟花" 的综合数据，用于 ltbg & backLight
  let behindData = getFireworksData(fireworksBehind);

  // --- 2) 绘制 ltbg（覆盖暗背景、在 body 后面显示）
  // 使用 HSV 模式调整颜色
  colorMode(HSB, 255);
  let ltbgColor = color(behindData.r, behindData.g, behindData.b);
  let ltbgHue = hue(ltbgColor);
  let ltbgSaturation = constrain(saturation(ltbgColor) * 0.5, 0, 255); // 调整饱和度
  let ltbgBrightness = constrain(brightness(ltbgColor) * 1.2, 0, 255); // 调整亮度
  tint(ltbgHue, ltbgSaturation, ltbgBrightness, behindData.alpha);
  image(ltbg, 0, 0, width, width);
  noTint();
  colorMode(RGB, 255); // 恢复到 RGB 模式

  // --- 3) 更新 & 绘制 “身后烟花” 粒子
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

  // --- 4) 绘制人物 (body)

  //tint(behindData.r*1.5, behindData.g*1.5, behindData.b*1.5, behindData.alpha);
  image(bodyFrames[currentFrame], bodyFrames[0].width * 0.05, 0);
  //noTint();

  // --- 5) 绘制 backLight（与 "身后烟花" 同样的色相 & 透明度）
  blendMode(HARD_LIGHT);
  tint(behindData.r*1.5, behindData.g*1.5, behindData.b*1.5, behindData.alpha);
  image(backLightFrames[currentFrame], width * 0.05, 0);
  noTint();
  blendMode(BLEND);

  // --- 6) 更新 & 绘制 “身前烟花”
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

  // --- 7) 计算 "身前烟花" 的综合数据，用于 frontLight
  let frontData = getFireworksData(fireworksFront);
  // frontData: {count, alpha, r, g, b}

  // --- 8) 绘制 frontLight（用 OVERLAY），随 "身前" 总粒子量 & 平均颜色变动
  blendMode(OVERLAY);
  tint(frontData.r*1.5, frontData.g*1.5, frontData.b*1.5, frontData.alpha);
  image(frontLightFrames[currentFrame], width * 0.05, 0);
  noTint();
  blendMode(BLEND);

  // --- 9) 同步切换帧（原逻辑：每 2 帧切一次）
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

  // 若没有任何粒子，则直接返回空数据
  if (totalParticles === 0) {
    return { count: 0, alpha: 0, r: 255, g: 255, b: 255 };
  }

  // 计算加权平均颜色
  let rAvg = rSum / sumLife;
  let gAvg = gSum / sumLife;
  let bAvg = bSum / sumLife;

  // 计算综合透明度：可以把寿命和粒子数结合，做一个系数
  // 下面是简单的示例：alphaVal = sumLife * 0.02
  // 您可根据需求调大/调小 factor
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

// 浏览器窗口大小变化时，如需自适应可以在这里处理
function windowResized() {
  // resizeCanvas(windowWidth, windowHeight);
}

// 点击画布时，随机放置烟花在身前或身后
function mousePressed() {
  if (random(1) < 0.5) {
    fireworksBehind.push(new Firework(mouseX, mouseY));
  } else {
    fireworksFront.push(new Firework(mouseX, mouseY));
  }
}

// ---------------------
// 烟花类
// ---------------------
class Firework {
  constructor(x, y) {
    this.particles = [];
    let particleCount = floor(random(150, 200));

    // 使用 HSB 模式生成高饱和度的颜色
    colorMode(HSB, 255);
    let c = color(
      random(0, 255),  // 色相
      random(30,180),            // 饱和度设为最大
      random(230,255) // 亮度
    );
    colorMode(RGB, 255); // 恢复到默认的 RGB 模式

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
    // 当所有粒子都 “finished” 就视为结束
    return this.particles.every(p => p.finished());
  }
}

// ---------------------
// 粒子类
// ---------------------
class Particle {
  constructor(x, y, c) {
    this.pos = createVector(x, y);
    // 随机喷射速度大一些
    this.vel = p5.Vector.random2D().mult(random(15, 40));
    // 简单重力，可自行再调
    this.acc = createVector(0, random(1, 4));
    // 初始寿命
    this.lifespan = 255;
    // 保存烟花的整体颜色
    this.fireworkColor = c;
    // 粒子形状
    this.shapeType = random(['square', 'circle']);
    // 粒子尺寸
    this.size = floor(random(2, 10));
    // 衰减延迟
    this.delay = 14;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    if (this.delay <= 0) {
      // 每帧衰减
      this.lifespan -= random(10, 25);
    } else {
      this.delay--;
    }
  }

  finished() {
    return this.lifespan < 0;
  }

  show() {
    // 简单闪烁
    let blinkAlpha = this.lifespan * (sin(frameCount * 3) * 0.5 + 0.5);

    // 1) 柔和光晕
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

    // 2) 主体形状
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
