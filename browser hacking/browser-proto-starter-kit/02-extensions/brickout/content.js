// Brickout - Play Breakout on any webpage!

(function() {
  // Prevent multiple injections
  if (window.brickoutInitialized) {
    return;
  }
  window.brickoutInitialized = true;

  let gameActive = false;
  let paddle = null;
  let ball = null;
  let ballVelocity = { x: 3, y: -3 };
  let animationFrame = null;
  let targetMode = 'text'; // 'text' or 'images'

  // Paddle configuration
  const PADDLE_WIDTH = 140;
  const PADDLE_HEIGHT = 18;
  const PADDLE_OFFSET = 20;

  // Ball configuration
  const BALL_SIZE = 18;
  const BALL_SPEED = 3;

  // Create the paddle element
  function createPaddle() {
    if (paddle) return;
    
    paddle = document.createElement('div');
    paddle.id = 'brickout-paddle';
    paddle.style.cssText = `
      position: fixed;
      width: ${PADDLE_WIDTH}px;
      height: ${PADDLE_HEIGHT}px;
      background: #0066ff;
      border: 2px solid #000;
      border-radius: 0;
      bottom: ${PADDLE_OFFSET}px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483646;
      box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
      cursor: none;
      pointer-events: none;
    `;
    document.body.appendChild(paddle);
  }

  // Create the ball element
  function createBall() {
    if (ball) {
      ball.remove();
    }
    
    ball = document.createElement('div');
    ball.id = 'brickout-ball';
    ball.style.cssText = `
      position: fixed;
      width: ${BALL_SIZE}px;
      height: ${BALL_SIZE}px;
      background: #ff0000;
      border: 2px solid #000;
      border-radius: 50%;
      z-index: 2147483646;
      box-shadow: 3px 3px 0 rgba(0,0,0,0.8);
      pointer-events: none;
    `;
    
    const paddleRect = paddle.getBoundingClientRect();
    ball.style.left = `${paddleRect.left + PADDLE_WIDTH / 2 - BALL_SIZE / 2}px`;
    ball.style.bottom = `${PADDLE_OFFSET + PADDLE_HEIGHT + 2}px`;
    
    document.body.appendChild(ball);
  }

  // Launch the ball
  function launchBall() {
    if (!ball || !paddle) return;
    
    const angle = (Math.random() * 120 - 60) * Math.PI / 180;
    ballVelocity = {
      x: BALL_SPEED * Math.sin(angle),
      y: -BALL_SPEED * Math.cos(angle)
    };
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    animationFrame = requestAnimationFrame(updateGame);
  }

  // Move paddle based on mouse position
  function updatePaddlePosition(e) {
    if (!paddle) return;
    
    const x = e.clientX;
    const maxX = window.innerWidth - PADDLE_WIDTH / 2;
    const minX = PADDLE_WIDTH / 2;
    const clampedX = Math.max(minX, Math.min(maxX, x));
    
    paddle.style.left = `${clampedX}px`;
    paddle.style.transform = 'translateX(-50%)';
  }

  // Hide element when hit
  function hitElement(element) {
    if (!element || element === paddle || element === ball) {
      return;
    }
    
    element.style.transition = 'opacity 0.3s, transform 0.3s';
    element.style.opacity = '0';
    element.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, 300);
  }

  // Main game loop
  function updateGame() {
    if (!ball || !paddle) {
      animationFrame = null;
      return;
    }
    
    const ballRect = ball.getBoundingClientRect();
    let x = ballRect.left;
    let y = ballRect.top;
    
    x += ballVelocity.x;
    y += ballVelocity.y;
    
    // Check wall collisions
    if (x <= 0 || x + BALL_SIZE >= window.innerWidth) {
      ballVelocity.x *= -1;
      x = Math.max(0, Math.min(window.innerWidth - BALL_SIZE, x));
    }
    
    if (y <= 0) {
      ballVelocity.y *= -1;
      y = 0;
    }
    
    // Check if ball fell off bottom
    if (y > window.innerHeight) {
      ball.remove();
      ball = null;
      animationFrame = null;
      createBall();
      setTimeout(() => {
        launchBall();
      }, 300);
      return;
    }
    
    // Check paddle collision
    const paddleRect = paddle.getBoundingClientRect();
    const newBallRect = {
      left: x,
      right: x + BALL_SIZE,
      top: y,
      bottom: y + BALL_SIZE
    };
    
    if (!(newBallRect.right < paddleRect.left || 
          newBallRect.left > paddleRect.right || 
          newBallRect.bottom < paddleRect.top || 
          newBallRect.top > paddleRect.bottom)) {
      
      const paddleCenter = paddleRect.left + paddleRect.width / 2;
      const ballCenter = x + BALL_SIZE / 2;
      const hitPosition = (ballCenter - paddleCenter) / (paddleRect.width / 2);
      
      ballVelocity.y = -Math.abs(ballVelocity.y);
      ballVelocity.x = hitPosition * BALL_SPEED * 0.8;
      
      y = paddleRect.top - BALL_SIZE;
    }
    
    // Check collisions with page elements
    const elementsAtPoint = document.elementsFromPoint(
      newBallRect.left + BALL_SIZE / 2,
      newBallRect.top + BALL_SIZE / 2
    );
    
    const validElements = elementsAtPoint.filter(element => {
      return element !== ball && element !== paddle && 
             element.id !== 'brickout-paddle' && element.id !== 'brickout-ball' &&
             element !== document.body && element !== document.documentElement;
    });
    
    let targetElement = null;
    
    for (const element of validElements) {
      const elementRect = element.getBoundingClientRect();
      
      if (elementRect.width >= 5 && elementRect.height >= 5) {
        let isValidTarget = false;
        
        if (targetMode === 'text') {
          isValidTarget = element.textContent && element.textContent.trim().length > 0;
        } else if (targetMode === 'images') {
          const tagName = element.tagName.toLowerCase();
          const style = window.getComputedStyle(element);
          const hasBackgroundImage = style.backgroundImage && style.backgroundImage !== 'none';
          
          isValidTarget = tagName === 'img' || tagName === 'svg' || tagName === 'video' || 
                         tagName === 'canvas' || hasBackgroundImage ||
                         (tagName === 'img' && element.src && element.src.toLowerCase().includes('.gif'));
        }
        
        if (isValidTarget) {
          targetElement = element;
          break;
        }
      }
    }
    
    if (targetElement) {
      const elementRect = targetElement.getBoundingClientRect();
      
      const ballCenterX = newBallRect.left + BALL_SIZE / 2;
      const ballCenterY = newBallRect.top + BALL_SIZE / 2;
      const elementCenterX = elementRect.left + elementRect.width / 2;
      const elementCenterY = elementRect.top + elementRect.height / 2;
      
      const dx = ballCenterX - elementCenterX;
      const dy = ballCenterY - elementCenterY;
      
      if (Math.abs(dx / elementRect.width) > Math.abs(dy / elementRect.height)) {
        ballVelocity.x *= -1;
      } else {
        ballVelocity.y *= -1;
      }
      
      hitElement(targetElement);
    }
    
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
    
    animationFrame = requestAnimationFrame(updateGame);
  }

  // Start the game
  function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    createPaddle();
    createBall();
    
    const style = document.createElement('style');
    style.id = 'brickout-cursor-hide';
    style.textContent = '* { cursor: none !important; }';
    document.head.appendChild(style);
    
    document.addEventListener('mousemove', updatePaddlePosition);
    
    setTimeout(() => {
      launchBall();
    }, 500);
  }

  // Stop the game
  function stopGame() {
    if (!gameActive) return;
    
    gameActive = false;
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    
    const cursorStyle = document.getElementById('brickout-cursor-hide');
    if (cursorStyle) {
      cursorStyle.remove();
    }
    
    document.removeEventListener('mousemove', updatePaddlePosition);
    
    if (paddle) {
      paddle.remove();
      paddle = null;
    }
    
    if (ball) {
      ball.remove();
      ball = null;
    }
  }

  // Export toggle function
  window.brickoutToggle = function(mode) {
    if (mode) {
      targetMode = mode;
    }
    
    if (gameActive) {
      stopGame();
      return { active: false };
    } else {
      startGame();
      return { active: true };
    }
  };

})();
