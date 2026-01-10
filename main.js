const URL = "https://teachablemachine.withgoogle.com/models/alrTVy0nz/";
let model, maxPredictions;

// [1] 공통 UI 관리
function showSection(type) {
    document.getElementById('test-section').style.display = type === 'test' ? 'block' : 'none';
    document.getElementById('tetris-section').style.display = type === 'tetris' ? 'block' : 'none';
    if(type === 'tetris') initTetris();
}

// [2] 동물상 테스트 로직
async function loadModel() {
    if (!model) {
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
    }
}

async function predictImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        document.getElementById('upload-label').style.display = 'none';
        const preview = document.getElementById('preview-image');
        const resultSection = document.getElementById('result-section');
        const spinner = document.getElementById('loading-spinner');
        const labelContainer = document.getElementById('label-container');
        const detailsBox = document.getElementById('animal-details');
        
        resultSection.style.display = 'block';
        spinner.style.display = 'block';
        detailsBox.style.display = 'none';
        labelContainer.innerHTML = '';
        
        reader.onload = async function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            await loadModel();
            const prediction = await model.predict(preview);
            prediction.sort((a, b) => b.probability - a.probability);
            
            spinner.style.display = 'none';
            displayResults(prediction);
            document.querySelector('.retry-btn').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

const animalInfo = {
    '강아지': {
        desc: '다정다감하고 선한 인상의 소유자! 상대방에게 편안함과 신뢰를 주는 매력이 있습니다. 눈매가 처진 편이라 웃을 때 더욱 귀여운 느낌을 줍니다.',
        best: '고양이, 토끼'
    },
    '오리': {
        desc: '개성 넘치고 힙한 분위기의 소유자! 도톰한 입술이나 매력적인 입매가 포인트이며, 트렌디하고 세련된 매력이 돋보입니다.',
        best: '곰, 여우'
    }
};

function displayResults(prediction) {
    const labelContainer = document.getElementById('label-container');
    const detailsBox = document.getElementById('animal-details');
    const bestMatch = prediction[0].className;

    // 막대 그래프 표시
    prediction.forEach((p, i) => {
        const percent = (p.probability * 100).toFixed(0);
        const wrapper = document.createElement('div');
        wrapper.className = 'result-bar-wrapper';
        wrapper.innerHTML = `<div class="bar-label"><span>${p.className}상</span><span>${percent}%</span></div>
                             <div class="bar-bg"><div class="bar-fill" style="width: 0%"></div></div>`;
        labelContainer.appendChild(wrapper);
        setTimeout(() => wrapper.querySelector('.bar-fill').style.width = percent + '%', 100);
    });

    // 상세 특징 표시
    const info = animalInfo[bestMatch] || { desc: '알 수 없는 신비로운 동물상입니다!', best: '모든 동물' };
    detailsBox.innerHTML = `<h3>당신은 ${bestMatch}상입니다!</h3>
                            <p>${info.desc}</p>
                            <p>궁합이 잘 맞는 동물: <span class="compatible-animal">${info.best}</span></p>`;
    detailsBox.style.display = 'block';
}

// [3] 테트리스 로직
const canvas = document.getElementById('tetris');
const context = canvas?.getContext('2d');
let arena, player, lastTime = 0, dropCounter = 0, isPaused = true;

function initTetris() {
    if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(20, 20);
    arena = Array.from({length: 20}, () => new Array(12).fill(0));
    player = { pos: {x: 0, y: 0}, matrix: null, score: 0, lines: 0 };
    updateScore();
    draw();
}

const pieces = 'ILJOTSZ';
const colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];

function createPiece(type) {
    if (type === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
    if (type === 'L') return [[0,2,0],[0,2,0],[0,2,2]];
    if (type === 'J') return [[0,3,0],[0,3,0],[3,3,0]];
    if (type === 'O') return [[4,4],[4,4]];
    if (type === 'Z') return [[5,5,0],[0,5,5],[0,0,0]];
    if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
    if (type === 'T') return [[0,7,0],[7,7,7],[0,0,0]];
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x:0, y:0});
    if(player.matrix) drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
    if (dir > 0) matrix.forEach(row => row.reverse()); else matrix.reverse();
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) if (arena[y][x] === 0) continue outer;
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        player.lines++;
        rowCount *= 2;
    }
}

function playerReset() {
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        player.lines = 0;
        updateScore();
    }
}

function update(time = 0) {
    if (isPaused) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > 1000) playerDrop();
    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('lines').innerText = player.lines;
}

document.getElementById('start-btn')?.addEventListener('click', () => {
    isPaused = false;
    playerReset();
    update();
});

document.addEventListener('keydown', e => {
    if (isPaused || !player.matrix) return;
    if (e.keyCode === 37) player.pos.x--; if (collide(arena, player)) player.pos.x++;
    if (e.keyCode === 39) player.pos.x++; if (collide(arena, player)) player.pos.x--;
    if (e.keyCode === 40) playerDrop();
    if (e.keyCode === 38) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, 1);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
        }
    }
    if (e.keyCode === 32) {
        while (!collide(arena, player)) player.pos.y++;
        player.pos.y--; playerDrop();
    }
});

// 시작 시 동물상 테스트 섹션 표시
showSection('test');
loadModel();