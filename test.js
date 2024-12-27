function preload() {
  // 尝试加载图像
  let img = loadImage('1227pics/Darkbg.png', 
    () => {
      console.log('Image loaded successfully');
    }, 
    () => {
      console.error('Failed to load image. Please check the file path and ensure the file exists.');
    }
  );
}

function setup() {
  createCanvas(400, 400);
  // 仅用于测试，不需要在画布上绘制任何内容
}

function draw() {
  // 保持空白，因为我们只关心图像加载
}
