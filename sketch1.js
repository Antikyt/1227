// 用来存放当前所有正在“燃放”的烟花
let fireworks = [];

function setup() {
  // 创建自适应画布
  createCanvas(windowWidth, windowHeight);
  // 帧率：原先你指定为6，可以改大一些以获得更流畅效果
  frameRate(12);

  // 关闭平滑，增强像素感
  noSmooth();
}

function draw() {
  // 半透明背景，用来产生“拖尾”效果
  background(0, 70);

  // 更新并渲染所有烟花
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    // 如果烟花完成（所有粒子都结束了），就移除
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

// 浏览器窗口大小发生变化时，重新设定画布尺寸
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 点击画布时，在鼠标位置创建一个新的烟花
function mousePressed() {
  fireworks.push(new Firework(mouseX, mouseY));
}

// ---------------------
// 烟花类
// ---------------------
class Firework {
  constructor(x, y) {
    // 先为整朵烟花生成一个随机颜色
    this.c = color(
      random(128, 255),
      random(128, 255),
      random(128, 255)
    );

    // 随机粒子数量
    let particleCount = floor(random(60, 80));
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      // 传递统一颜色给每个粒子
      this.particles.push(new Particle(x, y, this.c));
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

  // 所有粒子都消失才算这朵烟花结束
  done() {
    return this.particles.every(p => p.finished());
  }
}

// ---------------------
// 粒子类
// ---------------------
class Particle {
  constructor(x, y, c) {
    // 粒子的初始位置
    this.pos = createVector(x, y);

    // 随机方向和速度，增大范围来加快“爆炸”速度
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(20, 40));  // 原先是 random(1,6)，这里调大

    // 在低帧率下，希望移动更明显就减少“重力”，或者让它更明显看起来较快
    // 我这里取一个中间值，用户可自行再调
    this.acc = createVector(0, random(1, 2));
    
    // 用于粒子渐隐的生命值
    this.lifespan = 255;

    // 保存颜色（整个烟花的统一颜色）
    this.fireworkColor = c;

    // 保留形状随机的特性
    this.shapeType = random(['square', 'circle']);
    // 像素感更强，可以让尺寸大一些
    this.size = floor(random(2, 10));

    // 添加一个延迟时间，单位为帧
    this.delay = 14; // 例如，延迟30帧
  }

  update() {
    // 不断累加重力
    this.vel.add(this.acc);
    // 更新位置
    this.pos.add(this.vel);

    // 只有在延迟时间过后才开始衰减
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
    // 加快闪烁速度
    let blinkAlpha = this.lifespan * (sin(frameCount * 3) * 0.5 + 0.5);

    // 1) 绘制比较柔和的椭圆“光晕”，透明度非常低
    push();
    noStroke();
    fill(
      red(this.fireworkColor),
      green(this.fireworkColor),
      blue(this.fireworkColor),
      blinkAlpha * 0.1 // 使用闪烁透明度
    );
    ellipse(this.pos.x, this.pos.y, this.size * 2, this.size * 2);
    pop();

    // 2) 再绘制主要的“像素”形状
    push();
    noStroke();
    fill(
      red(this.fireworkColor),
      green(this.fireworkColor),
      blue(this.fireworkColor),
      blinkAlpha // 使用闪烁透明度
    );

    switch (this.shapeType) {
      case 'square':
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.size, this.size);
        break;
      case 'circle':
        ellipse(this.pos.x, this.pos.y, this.size);
        break;
    }
    pop();
  }
}
