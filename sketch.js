function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}/**
 * Program Name: p5_audio_visualizer
 * Description: 結合 p5.js 與 p5.sound，產生隨音樂振幅縮放的動態多邊形視覺效果。
 */

// --- 全域變數 (Global Variables) ---

// 用來儲存畫面上所有多邊形物件的陣列
let shapes = [];

// 用來儲存水泡物件的陣列
let bubbles = [];

// 儲存載入的音樂檔案
let song;

// p5.Amplitude 物件，用來解析音樂的音量振幅
let amplitude;

// 外部定義的二維陣列，做為多邊形頂點"魚"的基礎座標
let points = [[-3, 5], [3, 7], [1, 5],[2,4],[4,3],[5,2],[6,2],[8,4],[8,-1],[6,0],[0,-3],[2,-6],[-2,-3],[-4,-2],[-5,-1],[-6,1],[-6,2]];//這些座標圖形像是一隻隻魚

// --- Preload 函式 ---
function preload() {
  // 目的：在程式開始前預載入外部音樂資源
  // 邏輯：使用 loadSound() 載入音檔並賦值給 song
  // 請確保專案目錄下有此音樂檔案，或替換為您自己的檔案路徑
  song = loadSound('sunset-beach-259654.mp3');
}

// --- Setup 函式 ---
function setup() {
  // 目的：初始化畫布、音樂播放狀態與生成多邊形物件
  
  // 1. 使用 createCanvas 建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 2. 將變數 amplitude 初始化為 new p5.Amplitude()
  amplitude = new p5.Amplitude();

  // (補充邏輯) 播放音樂並設定循環
  // 注意：由於瀏覽器自動播放策略，音樂可能需要使用者互動（點擊）後才會開始播放
  if (song.isLoaded()) {
    song.loop();
  }

  // 3. 使用 for 迴圈產生 10 個形狀物件，並 push 到 shapes 陣列中
  for (let i = 0; i < 10; i++) {
    
    // 根據 JSON 的 shape_object_structure 產生屬性
    
    // points: 透過 map() 讀取全域陣列 points，產生變形
    let shapeScale = random(10, 30);
    let shapePoints = points.map(pt => {
      // 將每個頂點的 x 與 y 乘上相同的縮放倍率以保持形狀
      return [pt[0] * shapeScale, pt[1] * shapeScale];
    });

    let shape = {
      // x, y: 0 到 windowWidth/windowHeight 之間的隨機亂數
      x: random(0, windowWidth),
      y: random(0, windowHeight),
      
      // dx, dy: -3 到 3 之間的隨機亂數
      dx: random(-3, 3),
      dy: random(-3, 3),
      
      // scale: 1 到 10 之間的隨機亂數 (雖然 JSON 定義了此屬性，但 draw 中主要使用音量來縮放)
      scale: random(1, 10),
      
      // color: 隨機生成的 RGB 顏色
      color: color(random(255), random(255), random(255)),
      
      // points: 上面計算好的變形頂點
      points: shapePoints
    };

    shapes.push(shape);
  }
}

// --- Draw 函式 ---
function draw() {
  // 目的：每幀重複執行，處理背景更新、抓取音量與繪製動態圖形

  // 1. 設定背景顏色為 '#ffcdb2'
  background('#ffcdb2');

  // 2. 設定邊框粗細 strokeWeight(2)
  strokeWeight(2);

  // 3. 透過 amplitude.getLevel() 取得當前音量大小 (0 ~ 1)
  let level = amplitude.getLevel();

  // 4. 使用 map() 將 level 映射到 (0.5, 2) 做為縮放倍率
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // --- 水泡產生與繪製 ---
  if (frameCount % 20 === 0) {
    bubbles.push(new Bubble());
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.move();
    b.checkPop();
    b.display();
    if (b.isFinished()) {
      bubbles.splice(i, 1);
    }
  }

  // 5. 使用 for...of 迴圈走訪 shapes 陣列
  for (let shape of shapes) {
    
    // --- 形狀更新與繪製迴圈 (shape_update_and_render_loop) ---

    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放
    push(); // 儲存當前繪圖狀態
    
    translate(shape.x, shape.y); // 移動原點到形狀位置
    if (shape.dx > 0) {
      scale(-sizeFactor, -sizeFactor); // 往右移動時，左右相反，且上下顛倒
    } else {
      scale(sizeFactor, -sizeFactor); // 往左移動時，維持原狀，且上下顛倒
    }

    // 繪製多邊形
    beginShape();
    for (let pt of shape.points) {
      vertex(pt[0], pt[1]);
    }
    endShape(CLOSE); // 封閉圖形

    pop(); // 還原繪圖狀態
  }
}

// --- 輔助函式 (非 JSON 強制要求，但建議加入以優化體驗) ---

// 處理瀏覽器視窗大小改變
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 處理瀏覽器自動播放限制：點擊畫面時確保 AudioContext 啟動並播放音樂
function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  if (song.isLoaded()) {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.loop();
    }
  }
}

// --- Bubble 類別 ---
class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 20;
    this.size = random(10, 30);
    this.speed = random(1, 4);
    this.popped = false;
    this.popY = random(0, height / 2); // 在上半部隨機位置破掉
    this.alpha = 150;
  }

  move() {
    if (!this.popped) {
      this.y -= this.speed;
      this.x += random(-1, 1); // 左右輕微晃動
    }
  }

  checkPop() {
    if (this.y <= this.popY) {
      this.popped = true;
    }
  }

  display() {
    noStroke();
    if (this.popped) {
      // 破掉的效果：變大並淡出
      this.size += 2;
      this.alpha -= 10;
      fill(255, this.alpha);
      ellipse(this.x, this.y, this.size);
    } else {
      // 正常水泡
      fill(255, 100);
      ellipse(this.x, this.y, this.size);
      // 高光
      fill(255, 200);
      ellipse(this.x + this.size * 0.25, this.y - this.size * 0.25, this.size * 0.2);
    }
  }

  isFinished() {
    return this.popped && this.alpha <= 0;
  }
}
