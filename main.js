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
    const menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');
    menuItem.textContent = menu;
    menuDisplay.appendChild(menuItem);
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
