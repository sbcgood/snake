// 游戏常量
const GRID_SIZE = 20; // 网格大小
const GAME_SPEED = 150; // 游戏速度（毫秒）
const SPRINT_SPEED = 50; // 冲刺速度（毫秒，值越小速度越快）
const SPRINT_DELAY = 1; // 长按多久后开始冲刺（毫秒）
const FOOD_CD = 15;

// 游戏变量
let canvas, ctx;
let snake, food;
let direction, nextDirection;
let gameInterval;
let score, highScore;
let gameRunning = false;
let currentSpeed = GAME_SPEED;
let keyDownTime = 0;
let lastKeyPressed = null;
let isSprinting = false;
let fruits;
let growth=0;
// 添加食物生成计数器
let foodGenerationCounter = 0;
// DOM元素
let gameOverElement, gameStartElement;
let scoreElement, highScoreElement, finalScoreElement;
let powerupSelectionElement; // 添加这一行

// 初始化游戏
window.onload = function() {
    // 获取Canvas和上下文
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 获取DOM元素
    gameOverElement = document.getElementById('gameOver');
    gameStartElement = document.getElementById('gameStart');
    scoreElement = document.getElementById('score');
    highScoreElement = document.getElementById('highScore');
    finalScoreElement = document.getElementById('finalScore');
    powerupSelectionElement = document.getElementById('powerupSelection'); // 添加这一行
    
    // 设置按钮事件监听器
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    
    // 设置键盘事件监听器
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyUp);
    
    // 设置触摸事件监听器（用于移动设备）
    setupTouchControls();
    
    // 从本地存储加载最高分
    highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // 显示开始界面
    gameStartElement.style.display = 'block';
};



// 开始游戏
function startGame() {
    // 重置游戏状态
    snake = [
        {x: 10, y: 10}, // 头部
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];

    console.log('snakeok');

    fruits = [
        'apple',
        'apple',
        'apple',
        'apple',
        'apple',
        'apple',
        'apple',
        'apple',
        'apple',
        'apple',
        'pear',
        'pear',
        'pear',
        'pear',
        'pear',
        'package',
        'package',
        'package',
        'gold',
        'gold',
    ]

    console.log('fruitok');

    // 生成第一个食物
    food=[];
    generateFood();
    
    // 重置食物生成计数器
    foodGenerationCounter = 0;
    
    console.log('foodok');

    // 设置初始方向（向右）
    direction = 'right';
    nextDirection = 'right';

    console.log('directionok');
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;

    console.log('scoreok');
    
    // 隐藏开始和结束界面
    gameStartElement.style.display = 'none';
    gameOverElement.style.display = 'none';
    powerupSelectionElement.style.display = 'none'; // 添加这一行
    console.log('displayok');

    // 重置速度相关变量
    currentSpeed = GAME_SPEED;
    isSprinting = false;
    keyDownTime = 0;
    lastKeyPressed = null;
    
    console.log('setok');

    growth=0;
    // 开始游戏循环
    gameRunning = true;
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
    
    console.log('loopok');
    // 绘制初始状态
    draw();
}

// 游戏主循环
function gameLoop() {
    // 如果游戏暂停，不执行游戏逻辑
    if (isPaused) return;
    
    console.log("currentSpeed",currentSpeed)
    // 更新方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    for (let i = 0; i < food.length; i++) {
        if (snake[0].x === food[i].x && snake[0].y === food[i].y) {
            eatFood(food[i]);
            // Remove the eaten food from the array
            food.splice(i, 1);
            break;
        }
    }
    
    // 每2次循环生成一个食物，无论场上是否已有食物
    foodGenerationCounter++;
    if (foodGenerationCounter >= FOOD_CD) {
        generateFood(false);
        foodGenerationCounter = 0;
        console.log("生成新食物，当前食物数量:", food.length);
    }
    
    if(!growth){
        snake.pop();
    }else{
        growth--;
    }
    // 绘制游戏
    draw();
}

// 移动蛇
function moveSnake() {
    // 根据当前方向计算新的头部位置
    if(!gameRunning)return;

    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新头部添加到蛇身体的前面
    snake.unshift(head);
    
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= canvas.width / GRID_SIZE ||
        head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
        return true;
    }
    
    // 检查是否撞到自己（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood(package) {
    // 随机位置
    let foodX, foodY ,fruit;
    let foodOnSnake;
    
    // 确保食物不会生成在蛇身上
    do {
        foodOnSnake = false;
        foodOnFood = false;
        foodX = Math.floor(Math.random() * (canvas.width / GRID_SIZE));
        foodY = Math.floor(Math.random() * (canvas.height / GRID_SIZE));
        
        // 如果是package生成的食物，则不再生成package类型
        if (package) {
            // 从fruits数组中过滤掉'package'，只从其他类型中选择
            const availableFruits = fruits.filter(f => f !== 'package');
            fruit = availableFruits[Math.floor(Math.random() * availableFruits.length)];
        } else {
            // 正常随机选择所有类型
            fruit = fruits[Math.floor(Math.random() * fruits.length)];
        }
        
        // 检查是否与蛇身重叠
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                foodOnSnake = true;
                break;
            }
        }
        for (let segment of food) {
            if (segment.x === foodX && segment.y === foodY) {
                foodOnFood = true;
                break;
            }
        }
    } while (foodOnSnake || foodOnFood || (fruit==='package' && package) );
    
    console.log('foodgenerated');

    food.push({x: foodX, y: foodY ,fruit: fruit,packaged: package});

    console.log('foodplaced');
}

// 吃食物
// 添加全局变量
let isPaused = false;

// 在window.onload中添加获取选择界面元素



// 在eatFood函数中添加宝箱处理逻辑
function eatFood(fruit) {
    // 增加分数
    if(fruit.fruit==='apple'){
        score += 10;
        growth += 1;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 删除这行代码
        // if(!fruit.packaged)generateFood(false);
        
        // 加速游戏（可选，根据分数提高难度）
        if (score % 50 === 0 && GAME_SPEED > 50) {
            // 计算新的基础速度
            let newBaseSpeed = GAME_SPEED - Math.floor(score / 50) * 5;
            
            // 如果当前处于冲刺状态，保持冲刺速度与基础速度的比例
            if (isSprinting) {
                // 更新冲刺速度，保持与基础速度的比例关系
                currentSpeed = Math.floor(newBaseSpeed * (SPRINT_SPEED / GAME_SPEED));
            } else {
                // 正常速度
                currentSpeed = newBaseSpeed;
            }
            
            // 更新游戏循环
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, currentSpeed);
        }
    }
    if(fruit.fruit==='package'){
        score += 10;
        growth += 1;
        for(let i = 1; i <= 3;i++)generateFood(true);
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 删除这行代码
        // if(!fruit.packaged)generateFood(false);
        
        // 加速游戏（可选，根据分数提高难度）
        if (score % 50 === 0 && GAME_SPEED > 50) {
            // 计算新的基础速度
            let newBaseSpeed = GAME_SPEED - Math.floor(score / 50) * 5;
            
            // 如果当前处于冲刺状态，保持冲刺速度与基础速度的比例
            if (isSprinting) {
                // 更新冲刺速度，保持与基础速度的比例关系
                currentSpeed = Math.floor(newBaseSpeed * (SPRINT_SPEED / GAME_SPEED));
            } else {
                // 正常速度
                currentSpeed = newBaseSpeed;
            }
            
            // 更新游戏循环
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, currentSpeed);
        }
    }
    if(fruit.fruit==='pear'){
        score += 20;
        growth += 2;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 删除这行代码
        // if(!fruit.packaged)generateFood(false);
        
        // 加速游戏（可选，根据分数提高难度）
        if (score % 50 === 0 && GAME_SPEED > 50) {
            // 计算新的基础速度
            let newBaseSpeed = GAME_SPEED - Math.floor(score / 50) * 5;
            
            // 如果当前处于冲刺状态，保持冲刺速度与基础速度的比例
            if (isSprinting) {
                // 更新冲刺速度，保持与基础速度的比例关系
                currentSpeed = Math.floor(newBaseSpeed * (SPRINT_SPEED / GAME_SPEED));
            } else {
                // 正常速度
                currentSpeed = newBaseSpeed;
            }
            
            // 更新游戏循环
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, currentSpeed);
        }
    }
    if(fruit.fruit==='gold'){
        score += 100;
        growth += 5;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 删除这行代码
        // if(!fruit.packaged)generateFood(false);
        
        // 加速游戏（可选，根据分数提高难度）
        if (score % 50 === 0 && GAME_SPEED > 50) {
            // 计算新的基础速度
            let newBaseSpeed = GAME_SPEED - Math.floor(score / 50) * 5;
            
            // 如果当前处于冲刺状态，保持冲刺速度与基础速度的比例
            if (isSprinting) {
                // 更新冲刺速度，保持与基础速度的比例关系
                currentSpeed = Math.floor(newBaseSpeed * (SPRINT_SPEED / GAME_SPEED));
            } else {
                // 正常速度
                currentSpeed = newBaseSpeed;
            }
            
            // 更新游戏循环
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, currentSpeed);
        }
    }
    if(fruit.fruit==='chest'){
        score += 50;
        growth += 3;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 暂停游戏并显示加成选择界面
        pauseGame();
        showPowerupSelection();
    }
}

function hidePowerupSelection() {
    powerupSelectionElement.style.display = 'none';
}
// 暂停游戏
function pauseGame() {
    isPaused = true;
    clearInterval(gameInterval);
}

// 恢复游戏
function resumeGame() {
    if (!gameRunning) return;
    
    isPaused = false;
    gameInterval = setInterval(gameLoop, currentSpeed);
}

// 显示加成选择界面

// 隐藏加成选择界面
function hidePowerupSelection() {
    powerupSelectionElement.style.display = 'none';
}

// 选择加成
function selectPowerup(index) {
    hidePowerupSelection();
    
    // 根据选择应用不同的加成效果
    switch(index) {
        case 0: // 速度加成
            // 提高蛇的移动速度
            currentSpeed = Math.max(currentSpeed - 30, 50);
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, currentSpeed);
            break;
            
        case 1: // 分数加成
            // 增加额外分数
            score += 200;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            break;
            
        case 2: // 长度加成
            // 增加蛇的长度
            growth += 10;
            break;
    }
    
    // 恢复游戏
    resumeGame();
}

// 修改gameLoop函数，添加暂停检查


// 移动蛇
function moveSnake() {
    // 根据当前方向计算新的头部位置
    if(!gameRunning)return;

    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新头部添加到蛇身体的前面
    snake.unshift(head);
    
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= canvas.width / GRID_SIZE ||
        head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
        return true;
    }
    
    // 检查是否撞到自己（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood(package) {
    // 随机位置
    let foodX, foodY ,fruit;
    let foodOnSnake;
    
    // 确保食物不会生成在蛇身上
    do {
        foodOnSnake = false;
        foodOnFood = false;
        foodX = Math.floor(Math.random() * (canvas.width / GRID_SIZE));
        foodY = Math.floor(Math.random() * (canvas.height / GRID_SIZE));
        
        // 如果是package生成的食物，则不再生成package类型
        if (package) {
            // 从fruits数组中过滤掉'package'，只从其他类型中选择
            const availableFruits = fruits.filter(f => f !== 'package');
            fruit = availableFruits[Math.floor(Math.random() * availableFruits.length)];
        } else {
            // 正常随机选择所有类型
            fruit = fruits[Math.floor(Math.random() * fruits.length)];
        }
        
        // 检查是否与蛇身重叠
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                foodOnSnake = true;
                break;
            }
        }
        for (let segment of food) {
            if (segment.x === foodX && segment.y === foodY) {
                foodOnFood = true;
                break;
            }
        }
    } while (foodOnSnake || foodOnFood || (fruit==='package' && package) );
    
    console.log('foodgenerated');

    food.push({x: foodX, y: foodY ,fruit: fruit,packaged: package});

    console.log('foodplaced');
}

// 绘制游戏
function draw() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格（可选）
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格（可选）
function drawGrid() {
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    for (let i = 1; i < snake.length; i++) {
        // 蛇身使用渐变色
        const gradient = ctx.createLinearGradient(
            snake[i].x * GRID_SIZE,
            snake[i].y * GRID_SIZE,
            (snake[i].x + 1) * GRID_SIZE,
            (snake[i].y + 1) * GRID_SIZE
        );
        gradient.addColorStop(0, '#0f4c75');
        gradient.addColorStop(1, '#3282b8');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            snake[i].x * GRID_SIZE,
            snake[i].y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
        
        // 添加边框
        ctx.strokeStyle = '#bbe1fa';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            snake[i].x * GRID_SIZE,
            snake[i].y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
    }
    
    // 绘制蛇头（使用不同的颜色）
    const headGradient = ctx.createLinearGradient(
        snake[0].x * GRID_SIZE,
        snake[0].y * GRID_SIZE,
        (snake[0].x + 1) * GRID_SIZE,
        (snake[0].y + 1) * GRID_SIZE
    );
    headGradient.addColorStop(0, '#e94560');
    headGradient.addColorStop(1, '#ff6b81');
    
    ctx.fillStyle = headGradient;
    ctx.fillRect(
        snake[0].x * GRID_SIZE,
        snake[0].y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE
    );
    
    // 添加蛇头边框
    ctx.strokeStyle = '#bbe1fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        snake[0].x * GRID_SIZE,
        snake[0].y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE
    );
    
    // 添加眼睛
    const eyeSize = GRID_SIZE / 5;
    ctx.fillStyle = 'white';
    
    // 根据方向调整眼睛位置
    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
    
    switch(direction) {
        case 'up':
            leftEyeX = snake[0].x * GRID_SIZE + GRID_SIZE / 4;
            leftEyeY = snake[0].y * GRID_SIZE + GRID_SIZE / 4;
            rightEyeX = snake[0].x * GRID_SIZE + GRID_SIZE * 3/4;
            rightEyeY = snake[0].y * GRID_SIZE + GRID_SIZE / 4;
            break;
        case 'down':
            leftEyeX = snake[0].x * GRID_SIZE + GRID_SIZE / 4;
            leftEyeY = snake[0].y * GRID_SIZE + GRID_SIZE * 3/4;
            rightEyeX = snake[0].x * GRID_SIZE + GRID_SIZE * 3/4;
            rightEyeY = snake[0].y * GRID_SIZE + GRID_SIZE * 3/4;
            break;
        case 'left':
            leftEyeX = snake[0].x * GRID_SIZE + GRID_SIZE / 4;
            leftEyeY = snake[0].y * GRID_SIZE + GRID_SIZE / 4;
            rightEyeX = snake[0].x * GRID_SIZE + GRID_SIZE / 4;
            rightEyeY = snake[0].y * GRID_SIZE + GRID_SIZE * 3/4;
            break;
        case 'right':
            leftEyeX = snake[0].x * GRID_SIZE + GRID_SIZE * 3/4;
            leftEyeY = snake[0].y * GRID_SIZE + GRID_SIZE / 4;
            rightEyeX = snake[0].x * GRID_SIZE + GRID_SIZE * 3/4;
            rightEyeY = snake[0].y * GRID_SIZE + GRID_SIZE * 3/4;
            break;
    }
    
    // 绘制眼睛
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制瞳孔
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(rightEyeX, rightEyeY, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制食物
function drawFood() {
    // 为每种水果绘制不同的图案
    for(let i = 0; i < food.length; i++) {
        const obj = food[i];
        
        switch(obj.fruit) {
            case 'apple':
                drawApple(obj);
                break;
            case 'pear':
                drawPear(obj);
                break;
            case 'package':
                drawPackage(obj);
                break;
            case 'gold':
                drawGold(obj);
                break;
            case 'chest':
                drawChest(obj);
                break;
            default:
                drawApple(obj); // 默认使用苹果图案
        }
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    
    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
    
    // 确保其他界面元素被隐藏
    powerupSelectionElement.style.display = 'none';
}

// 绘制苹果
function drawApple(obj) {
    // 主体 - 红色
    ctx.fillStyle = '#ff6b81';
    ctx.beginPath();
    ctx.arc(
        obj.x * GRID_SIZE + GRID_SIZE / 2,
        obj.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2.5,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 茎
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 2 - 2,
        obj.y * GRID_SIZE + 2,
        4,
        5
    );
    
    // 叶子
    ctx.beginPath();
    ctx.ellipse(
        obj.x * GRID_SIZE + GRID_SIZE / 2 + 5,
        obj.y * GRID_SIZE + GRID_SIZE / 2,
        4,
        2,
        Math.PI / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 光晕效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
        obj.x * GRID_SIZE + GRID_SIZE / 2 - GRID_SIZE / 6,
        obj.y * GRID_SIZE + GRID_SIZE / 2 - GRID_SIZE / 6,
        GRID_SIZE / 8,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 绘制梨
function drawPear(obj) {
    // 主体 - 黄绿色
    ctx.fillStyle = '#badc58';
    
    // 梨的底部（椭圆形）
    ctx.beginPath();
    ctx.ellipse(
        obj.x * GRID_SIZE + GRID_SIZE / 2,
        obj.y * GRID_SIZE + GRID_SIZE / 2 + GRID_SIZE / 6,
        GRID_SIZE / 3,
        GRID_SIZE / 2.2,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 梨的顶部（圆形）
    ctx.beginPath();
    ctx.arc(
        obj.x * GRID_SIZE + GRID_SIZE / 2,
        obj.y * GRID_SIZE + GRID_SIZE / 2 - GRID_SIZE / 6,
        GRID_SIZE / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 茎
    ctx.fillStyle = '#6ab04c';
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 2 - 1.5,
        obj.y * GRID_SIZE + GRID_SIZE / 2 - 2,
        3,
        4
    );
    
    // 光晕效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
        obj.x * GRID_SIZE + GRID_SIZE / 2 - GRID_SIZE / 6,
        obj.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 10,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 绘制礼包
function drawPackage(obj) {
    // 主体 - 礼盒
    ctx.fillStyle = '#3498db';
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 6,
        obj.y * GRID_SIZE + GRID_SIZE / 6,
        GRID_SIZE * 2/3,
        GRID_SIZE * 2/3
    );
    
    // 礼盒带子 - 垂直
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 2 - 2,
        obj.y * GRID_SIZE + GRID_SIZE / 6,
        4,
        GRID_SIZE * 2/3
    );
    
    // 礼盒带子 - 水平
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 6,
        obj.y * GRID_SIZE + GRID_SIZE / 2 - 2,
        GRID_SIZE * 2/3,
        4
    );
    
    // 礼盒结 - 圆形
    ctx.beginPath();
    ctx.arc(
        obj.x * GRID_SIZE + GRID_SIZE / 2,
        obj.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 8,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 绘制金币
function drawGold(obj) {
    // 主体 - 金色圆形
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(
        obj.x * GRID_SIZE + GRID_SIZE / 2,
        obj.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2.5,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 金币内部图案 - "$" 符号
    ctx.fillStyle = '#d35400';
    ctx.font = `bold ${GRID_SIZE/1.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        '$',
        obj.x * GRID_SIZE + GRID_SIZE / 2,
        obj.y * GRID_SIZE + GRID_SIZE / 2
    );
    
    // 光晕效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(
        obj.x * GRID_SIZE + GRID_SIZE / 2 - GRID_SIZE / 6,
        obj.y * GRID_SIZE + GRID_SIZE / 2 - GRID_SIZE / 6,
        GRID_SIZE / 10,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 绘制宝箱
function drawChest(obj) {
    // 宝箱主体 - 棕色
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 6,
        obj.y * GRID_SIZE + GRID_SIZE / 3,
        GRID_SIZE * 2/3,
        GRID_SIZE * 2/3 - GRID_SIZE / 6
    );
    
    // 宝箱盖 - 深棕色
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 6,
        obj.y * GRID_SIZE + GRID_SIZE / 6,
        GRID_SIZE * 2/3,
        GRID_SIZE / 6
    );
    
    // 宝箱锁 - 金色
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 2 - GRID_SIZE / 10,
        obj.y * GRID_SIZE + GRID_SIZE / 4,
        GRID_SIZE / 5,
        GRID_SIZE / 8
    );
    
    // 宝箱高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(
        obj.x * GRID_SIZE + GRID_SIZE / 4,
        obj.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 3,
        GRID_SIZE / 10
    );
}

// 处理键盘按键
function handleKeyPress(event) {
    // 如果游戏未运行或已暂停，忽略按键
    if (!gameRunning || isPaused) return;
    
    // 根据按键设置下一个方向
    let directionChanged = false;
    
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
            // 防止180度转弯（如果当前方向是向下，则不能直接向上）
            if (direction !== 'up') {
                nextDirection = 'up';
                directionChanged = true;
            }
            break;
        case 'ArrowDown':
        case 's':
            if (direction !== 'down') {
                nextDirection = 'down';
                directionChanged = true;
            }
            break;
        case 'ArrowLeft':
        case 'a':
            if (direction !== 'left') {
                nextDirection = 'left';
                directionChanged = true;
            }
            break;
        case 'ArrowRight':
        case 'd':
            if (direction !== 'right') {
                nextDirection = 'right';
                directionChanged = true;
            }
            break;
    }
    
    // 记录按键和时间，无论方向是否改变
    lastKeyPressed = event.key;
    keyDownTime = Date.now();
    
    // 如果方向改变，并且正在冲刺中，重置为正常速度
    if (directionChanged && isSprinting) {
        resetSprintSpeed();
    }
    
    // 设置长按检测
    setTimeout(checkForSprint, SPRINT_DELAY);
}

// 处理键盘松开事件
function handleKeyUp(event) {
    // 如果松开的是当前按下的键，重置冲刺状态
    if (event.key === lastKeyPressed) {
        lastKeyPressed = null;
        resetSprintSpeed();
    }
}

// 检查是否应该开始冲刺
function checkForSprint() {
    // 如果按键仍然被按下且是同一个按键，开始冲刺
    if (gameRunning && Date.now() - keyDownTime >= SPRINT_DELAY && isKeyStillDown(lastKeyPressed)) {
        startSprint();
        
        // 持续检查冲刺状态，每100毫秒检查一次
        if (gameRunning && !isSprinting) {
            setTimeout(checkForSprint, 100);
        }
    } else if (gameRunning && lastKeyPressed) {
        // 如果按键仍然存在但还没达到冲刺条件，继续检查
        setTimeout(checkForSprint, 100);
    }
}

// 检查按键是否仍然被按下
function isKeyStillDown(key) {
    // 使用更可靠的方法检测按键状态
    // 只有当lastKeyPressed存在且与传入的key相同，且时间间隔合理时才认为按键仍被按下
    if (!key || !lastKeyPressed) return false;
    
    // 检查是否是同一个按键
    if (lastKeyPressed !== key) return false;
    
    // 检查时间间隔是否合理（防止误判）
    const currentTime = Date.now();
    const timeSinceKeyDown = currentTime - keyDownTime;
    
    // 如果时间间隔太长（例如超过5秒），可能是检测出错，按键可能已经松开
    if (timeSinceKeyDown > 5000) return false;
    
    return true;
}

// 开始冲刺
function startSprint() {
    if (!isSprinting && gameRunning) {
        isSprinting = true;
        currentSpeed = SPRINT_SPEED;
        
        // 重新设置游戏循环间隔
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);
    }
}

// 重置为正常速度
function resetSprintSpeed() {
    if (isSprinting) {
        isSprinting = false;
        currentSpeed = GAME_SPEED;
        
        // 重新设置游戏循环间隔
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);
    }
}

// 设置触摸控制（用于移动设备）
function setupTouchControls() {
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    
    let xDown = null;
    let yDown = null;
    
    function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    }
    
    function handleTouchMove(evt) {
        if (!xDown || !yDown || !gameRunning) {
            return;
        }
        
        evt.preventDefault();
        
        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;
        
        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;
        
        // 确定主要的滑动方向
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            // 水平滑动
            if (xDiff > 0) {
                // 向左滑动
                if (direction !== 'right') nextDirection = 'left';
            } else {
                // 向右滑动
                if (direction !== 'left') nextDirection = 'right';
            }
        } else {
            // 垂直滑动
            if (yDiff > 0) {
                // 向上滑动
                if (direction !== 'down') nextDirection = 'up';
            } else {
                // 向下滑动
                if (direction !== 'up') nextDirection = 'down';
            }
        }
        
        // 重置触摸点
        xDown = null;
        yDown = null;
    }
}

// 辅助函数：绘制圆角矩形
function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}
