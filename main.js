const menuDisplay = document.getElementById('menu-display');
const generateButton = document.getElementById('generate-button');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const dinnerMenus = [
    '치킨', '피자', '햄버거', '초밥', '파스타',
    '삼겹살', '김치찌개', '된장찌개', '부대찌개', '떡볶이',
    '라면', '카레', '돈까스', '짜장면', '짬뽕'
];

// Function to generate a random menu
function generateMenu() {
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    return dinnerMenus[randomIndex];
}

// Function to display the menu
function displayMenu(menu) {
    menuDisplay.innerHTML = '';
    
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '15px';

    const menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');
    menuItem.textContent = menu;
    container.appendChild(menuItem);

    // Create loading indicator
    const loadingText = document.createElement('div');
    loadingText.textContent = '이미지 요리 중...';
    loadingText.style.color = '#888';
    loadingText.style.fontSize = '14px';
    loadingText.style.marginTop = '10px';
    container.appendChild(loadingText);

    const img = document.createElement('img');
    // Using Pollinations.ai for image generation without API key
    // Adding 'delicious' to prompt for better results
    img.src = `https://image.pollinations.ai/prompt/delicious ${encodeURIComponent(menu)}?width=300&height=300&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    img.alt = menu;
    img.classList.add('menu-image');
    img.style.maxWidth = '100%';
    img.style.borderRadius = '10px';
    img.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    img.style.display = 'none'; // Hide initially

    img.onload = () => {
        loadingText.remove(); // Remove loading text
        img.style.display = 'block'; // Show image
    };

    container.appendChild(img);
    menuDisplay.appendChild(container);
}

// Event listener for the generate button
generateButton.addEventListener('click', () => {
    const randomMenu = generateMenu();
    displayMenu(randomMenu);
});

// Event listener for the theme toggle button
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    // Save theme preference to localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark-mode');
    } else {
        localStorage.removeItem('theme');
    }
});

// Check for saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
    }
});
