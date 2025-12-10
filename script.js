const projects = [
    {
        id: 1,
        title: "Mini Drone Flight Controller",
        category: "aviation",
        thumbnail: "https://via.placeholder.com/400x300/001133/00bfff?text=DRONE+PROJECT",
        youtubeId: null,
        description: "Custom flight controller built from scratch using ESP32. Implements PID control for stable flight on a 10cm x 10cm quadcopter.",
        repoLink: "https://github.com/yourusername/drone-controller",
        demoLink: null
    },
    {
        id: 2,
        title: "Indoor WiFi Localization",
        category: "robotics",
        thumbnail: "https://via.placeholder.com/400x300/110033/ff00ff?text=ROBOT+ARM",
        youtubeId: "dQw4w9WgXcQ",
        description: "Localization indoors using WiFi and IMU",
        repoLink: "https://github.com/yourusername/robot-arm",
        demoLink: "https://demo-link.com"
    },
    {
        id: 3,
        title: "Analysing Audio Attack Vectors",
        category: "cybersecurity",
        thumbnail: "https://via.placeholder.com/400x300/110033/ff00ff?text=ROBOT+ARM",
        youtubeId: "dQw4w9WgXcQ",
        description: "Performed attacks on various smart voice assistants exploiting multiple attack vectors including MEMS microphones, adversarial attacks on speech to text applications, etc.",
        repoLink: "https://github.com/yourusername/robot-arm",
        demoLink: "https://demo-link.com"
    },
    {
        id: 4,
        title: "Catcher Bot",
        category: "robotics",
        thumbnail: "https://via.placeholder.com/400x300/110033/ff00ff?text=ROBOT+ARM",
        youtubeId: "dQw4w9WgXcQ",
        description: "Building a stereo camera from scratch and using it to track and intercept projectiles before they hit the ground",
        repoLink: "https://github.com/yourusername/robot-arm",
        demoLink: "https://demo-link.com"
    },
];

// Handle intro screen scroll
const introScreen = document.getElementById('introScreen');
let scrollTimeout;

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Fade out intro when scrolling past 30% of viewport
    if (scrollPosition > windowHeight * 0.3) {
        introScreen.classList.add('fade-out');
    } else {
        introScreen.classList.remove('fade-out');
    }
    
    // Snap to second page after scroll ends
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (scrollPosition > windowHeight * 0.3 && scrollPosition < windowHeight * 1.5) {
            window.scrollTo({
                top: windowHeight,
                behavior: 'smooth'
            });
        } else if (scrollPosition < windowHeight * 0.3 && scrollPosition > 0) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, 150);
});

function getCategoryColor(category) {
    return '#fff';
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    projects.forEach(project => {
        const tile = document.createElement('div');
        tile.className = `project-tile ${project.category}`;
        tile.onclick = () => openModal(project);

        const mediaHTML = project.youtubeId 
            ? `<iframe src="https://www.youtube.com/embed/${project.youtubeId}" frameborder="0" allowfullscreen></iframe>`
            : `<img src="${project.thumbnail}" alt="${project.title}">`;

        tile.innerHTML = `
            <div class="tile-content">
                ${mediaHTML}
                <div class="category">[ ${project.category.toUpperCase()} ]</div>
                <h3>${project.title}</h3>
            </div>
        `;

        grid.appendChild(tile);
    });
}

function openModal(project) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const modalBody = document.getElementById('modalBody');

    modalContent.className = `modal-content ${project.category}`;

    const color = getCategoryColor(project.category);
    const closeBtn = modalContent.querySelector('.close-btn');
    closeBtn.style.borderColor = color;
    closeBtn.style.color = color;

    const mediaHTML = project.youtubeId 
        ? `<iframe class="media" src="https://www.youtube.com/embed/${project.youtubeId}" frameborder="0" allowfullscreen></iframe>`
        : `<img class="media" src="${project.thumbnail}" alt="${project.title}">`;

    const links = [];
    if (project.repoLink) {
        links.push(`<a href="${project.repoLink}" target="_blank">[ GITHUB REPO ]</a>`);
    }
    if (project.demoLink) {
        links.push(`<a href="${project.demoLink}" target="_blank">[ LIVE DEMO ]</a>`);
    }

    modalBody.innerHTML = `
        <h2>${project.title}</h2>
        ${mediaHTML}
        <div class="description">${project.description}</div>
        <div class="links">${links.join('')}</div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

modal.onclick = (e) => {
    if (e.target === modal) {
        closeModal();
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

renderProjects();