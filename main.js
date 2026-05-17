// Set variable penting untuk koordinat
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// Variable dragging
let isDragging = false;
let startX = 0;
let startY = 0;

// Variabel pendukung
let isZoomEnable = true;
let savedPoints = [];
let tempX = null;
let tempY = null;

const canvas = document.getElementById('map');
const form = document.getElementById('form-panel');
const cancel = document.getElementById('cancel-btn');
const locations = document.getElementById('location-form');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Cara memasang foto/image di HTML5 Canvas
const img = new Image();
img.src = 'map.svg';

img.onload = function() {
    drawMap();
}

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const newWidth = canvas.width * scale;
    const newHeight = canvas.height * scale;
    ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

    savedPoints.forEach(point => {
        const screenX = (point.x * scale) + offsetX;
        const screenY = (point.y * scale) + offsetY;

        drawPin(screenX, screenY, point.name);
    })
}

function drawPin(x, y, locationName) {
    ctx.save();
    ctx.beginPath();

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    ctx.translate(x, y);
    ctx.roundRect(-10, -10, 20, 20, 100);

    ctx.fill(); // --> Ini penting jika pakai fill
    ctx.stroke(); // --> Ini penting kalau mau pakai stroke
    
    // Text location
    if(locationName) {
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign ='center';

        // Posisi text diatas pin
        ctx.fillText(locationName, 0, -15);
    }

    ctx.restore();
}

canvas.addEventListener('wheel', (e) => {
    if(!isZoomEnable) return;

    e.preventDefault();

    // cetak koordinat
    const centerX = e.offsetX;
    const centerY = e.offsetY;

    const mouseXInMap = (centerX - offsetX) / scale;
    const mouseYInMap = (centerY - offsetY) / scale;

    if(e.deltaY < 0) {
        scale += 0.1;
    } else {
        scale = Math.max(0.7, scale - 0.1)
    }

    offsetX = centerX - mouseXInMap * scale;
    offsetY = centerY - mouseYInMap * scale;

    drawMap();
})

canvas.addEventListener('mousedown', (e) => {
    if(!isZoomEnable) return;

    
    isDragging = true;
    canvas.style.cursor = 'grabbing';

    startX = e.offsetX - offsetX;
    startY = e.offsetY - offsetY;
})

canvas.addEventListener('mousemove', (e) => {
    if(!isDragging || !isZoomEnable) return;

    offsetX = e.offsetX - startX;
    offsetY = e.offsetY - startY;

    drawMap();
})

canvas.addEventListener('dblclick', (e) => {
    isZoomEnable = !isZoomEnable;

    // Ambil elemen teks display koordinat dari HTML premium kemarin
    const displayX = document.getElementById('display-x');
    const displayY = document.getElementById('display-y');
    const inputX = document.getElementById('coord-x');
    const inputY = document.getElementById('coord-y');

    if (!isZoomEnable) {
        form.classList.remove('hidden');
        canvas.style.cursor = 'default';

        // Hitung koordinat asli kursor pada peta global !Important1
        const clickX = (e.offsetX - offsetX) / scale;
        const clickY = (e.offsetY - offsetY) / scale;

        tempX = clickX;
        tempY = clickY;

        // Tampilkan angka ke panel & simpan ke hidden input
        if(displayX && displayY) {
            displayX.innerText = clickX.toFixed(2);
            displayY.innerText = clickY.toFixed(2);
        }
        if(inputX && inputY) {
            inputX.value = clickX;
            inputY.value = clickY;
        }
    } else {
        form.classList.add('hidden');
        canvas.style.cursor = 'grab';
    }

    drawMap();
});

locations.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputLocation = document.getElementById('location-name');

    if(tempX != null && tempY != null) {
        savedPoints.push({
            x: tempX,
            y: tempY,
            name: inputLocation.value
        });
    }

    tempX = null;
    tempY = null;
    document.getElementById('location-name').value = '';

    isZoomEnable = true;
    form.classList.add('hidden');
    canvas.style.cursor = 'grab';
    
    drawMap();
})

cancel.addEventListener('click', (e) => {
    isZoomEnable = true;
    form.classList.add('hidden');
    canvas.style.cursor = 'grab';

    // Reset variable
    tempX = null;
    tempY = null;
    document.getElementById('location-name').value = '';

    drawMap();
})

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    if(isZoomEnable) canvas.style.cursor = 'grab';
})

canvas.addEventListener('mouseleave', (e) => {
    isDragging = false;
})

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawMap();
});
