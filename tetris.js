const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8000'];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPiece;
let gameInterval;
let score = 0;
let gameOver = false;

const shapes = [
    [[1, 1, 1], [0, 1, 0]], // T-shape
    [[1, 1], [1, 1]], // Square
    [[1, 0, 0], [1, 1, 1]], // L-shape
    [[0, 0, 1], [1, 1, 1]], // Reverse L-shape
    [[0, 1, 1], [1, 1, 0]], // S-shape
    [[1, 1, 0], [0, 1, 1]], // Z-shape
    [[1, 1, 1, 1]] // I-shape
];

function randomShape() {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return { shape, color, row: 0, col: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2) };
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                ctx.fillStyle = board[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#ccc';
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); // Adding grid lines
            }
        }
    }
}

function drawPiece(piece) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                ctx.fillStyle = piece.color;
                ctx.fillRect((piece.col + col) * BLOCK_SIZE, (piece.row + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#ccc';
                ctx.strokeRect((piece.col + col) * BLOCK_SIZE, (piece.row + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function movePiece(piece, newRow, newCol) {
    piece.row = newRow;
    piece.col = newCol;
}

function isValidMove(piece) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const newRow = piece.row + row;
                const newCol = piece.col + col;
                if (newRow >= ROWS || newCol < 0 || newCol >= COLS || board[newRow][newCol]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placePiece(piece) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                board[piece.row + row][piece.col + col] = piece.color;
            }
        }
    }
}

function clearFullLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(null));
            score += 100;
            document.getElementById('score-display').innerText = `Score: ${score}`;
        }
    }
}

function gameOverCheck() {
    if (board[0].some(cell => cell)) {
        gameOver = true;
        clearInterval(gameInterval);
        document.getElementById('game-over-message').style.display = 'block'; // Show Game Over message
    }
}

function gameLoop() {
    if (gameOver) return;

    if (!currentPiece) {
        currentPiece = randomShape();
    }

    // Move piece down
    if (isValidMove({ ...currentPiece, row: currentPiece.row + 1 })) {
        movePiece(currentPiece, currentPiece.row + 1, currentPiece.col);
    } else {
        // Place the piece on the board and create a new piece
        placePiece(currentPiece);
        clearFullLines();
        gameOverCheck(); // Check if game is over
        if (!gameOver) {
            currentPiece = null;
        }
    }

    drawBoard();
    drawPiece(currentPiece);
}

function startGame() {
    if (gameOver) {
        // Reset game variables
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        score = 0;
        document.getElementById('score-display').innerText = `Score: ${score}`;
        document.getElementById('game-over-message').style.display = 'none'; // Hide Game Over message
        gameOver = false;
    }
    gameInterval = setInterval(gameLoop, 500);
}

function handleKeyPress(event) {
    if (gameOver) return;

    if (event.key === 'ArrowLeft') {
        if (isValidMove({ ...currentPiece, col: currentPiece.col - 1 })) {
            movePiece(currentPiece, currentPiece.row, currentPiece.col - 1);
        }
    } else if (event.key === 'ArrowRight') {
        if (isValidMove({ ...currentPiece, col: currentPiece.col + 1 })) {
            movePiece(currentPiece, currentPiece.row, currentPiece.col + 1);
        }
    } else if (event.key === 'ArrowDown') {
        if (isValidMove({ ...currentPiece, row: currentPiece.row + 1 })) {
            movePiece(currentPiece, currentPiece.row + 1, currentPiece.col);
        }
    } else if (event.key === 'Enter') {
        const rotatedShape = rotatePiece(currentPiece.shape);
        if (isValidMove({ ...currentPiece, shape: rotatedShape })) {
            currentPiece.shape = rotatedShape;
        }
    }
}

function rotatePiece(shape) {
    return shape[0].map((_, index) => shape.map(row => row[index])).reverse();
}

document.addEventListener('keydown', handleKeyPress);
document.getElementById('start-btn').addEventListener('click', startGame);
