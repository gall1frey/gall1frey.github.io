const projects = [
    {
        id: 1,
        title: "Mini Quadcopter",
        category: "aviation",
        thumbnail: "images/1761764812520.jpeg",
        youtubeId: null,
        description: "Mini quadcopter with an ESP32 flight controller. Implements PID control for stable flight on a 10cm x 10cm quadcopter.",
        repoLink: null,
        demoLink: null
    },
    {
        id: 2,
        title: "Indoor WiFi Localization",
        category: "robotics",
        thumbnail: null,
        youtubeId: "1fyw1vySwcY",
        description: "Localization indoors using WiFi and IMU",
        repoLink: "https://github.com/kumarashish1neu/turtle_bot_sim",
        demoLink: "https://youtu.be/dgcIssnIu2o"
    },
    {
        id: 3,
        title: "Analysing Audio Attack Vectors",
        category: "cybersecurity",
        thumbnail: null,
        youtubeId: "3JiykF2eGcU",
        description: "Performed attacks on various smart voice assistants exploiting multiple attack vectors including MEMS microphones, adversarial attacks on speech to text applications, etc.",
        repoLink: "https://github.com/gall1frey/AudioAttacksPoc",
        demoLink: "https://www.youtube.com/playlist?list=PL2Cc95P3WAOs-A4DZWljsi0PWCMEUXQMH"
    },
    {
        id: 4,
        title: "Catcher Bot",
        category: "robotics",
        thumbnail: "https://via.placeholder.com/400x300/110033/ff00ff?text=ROBOT+ARM",
        youtubeId: "tzTRts2LMA4",
        description: "Building a stereo camera from scratch and using it to track and intercept projectiles before they hit the ground",
        repoLink: null,
        demoLink: "https://www.youtube.com/watch?v=tzTRts2LMA4"
    },
    {
        id: 5,
        title: "Mouse Learning",
        category: "robotics",
        thumbnail: "https://via.placeholder.com/400x300/110033/ff00ff?text=ROBOT+ARM",
        youtubeId: "iAEoczEfzE4",
        description: "Used reinforcement learning to help a mouse find and follow cheese",
        repoLink: "https://github.com/gall1frey/genetic_nav",
        demoLink: "https://www.youtube.com/playlist?list=PL2Cc95P3WAOsi7gX9XcnVNSPGaU4TX4sN"
    },
    {
        id: 5,
        title: "Ornithopter Mechanism",
        category: "robotics",
        thumbnail: "https://via.placeholder.com/400x300/110033/ff00ff?text=ROBOT+ARM",
        youtubeId: "ZecHoexf4Sw",
        description: "Created a rigid body mechanism to control flapping, variable wing sweep, and elevator of an ornithopter",
        repoLink: "https://github.com/gall1frey/ornithopter",
        demoLink: "https://www.youtube.com/playlist?list=PL2Cc95P3WAOvVsbrhK9XDPtWNo7-u5--b"
    },
];

// Handle intro screen scroll
const introScreen = document.getElementById('introScreen');
let scrollTimeout;

// Replace your scroll listener with this
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    // Fade out intro when scrolling past 30% of viewport
    if (scrollPosition > windowHeight * 0.3) {
        introScreen.classList.add('fade-out');
    } else {
        introScreen.classList.remove('fade-out');
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Only snap if the user is still near the transition zone (within 1.5x viewport height)
        // Once they've scrolled deeper into the projects, leave them alone
        if (scrollPosition < windowHeight * 0.3 && scrollPosition > 0) {
            // Snap back to top if barely scrolled
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (scrollPosition >= windowHeight * 0.3 && scrollPosition < windowHeight * 0.85) {
            // Snap forward to main content only if still in the transition zone
            window.scrollTo({ top: windowHeight, behavior: 'smooth' });
        }
        // If scrollPosition >= windowHeight * 0.85 → user is in the projects, don't snap
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
