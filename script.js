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
        thumbnail: null,
        youtubeId: "tzTRts2LMA4",
        description: "Building a stereo camera from scratch and using it to track and intercept projectiles before they hit the ground",
        repoLink: null,
        demoLink: "https://www.youtube.com/watch?v=tzTRts2LMA4"
    },
    {
        id: 5,
        title: "Mouse Learning",
        category: "robotics",
        thumbnail: null,
        youtubeId: "iAEoczEfzE4",
        description: "Used reinforcement learning to help a mouse find and follow cheese",
        repoLink: "https://github.com/gall1frey/genetic_nav",
        demoLink: "https://www.youtube.com/playlist?list=PL2Cc95P3WAOsi7gX9XcnVNSPGaU4TX4sN"
    },
    {
        id: 6,
        title: "Ornithopter Mechanism",
        category: "robotics",
        thumbnail: null,
        youtubeId: "ZecHoexf4Sw",
        description: "Created a rigid body mechanism to control flapping, variable wing sweep, and elevator of an ornithopter",
        repoLink: "https://github.com/gall1frey/ornithopter",
        demoLink: "https://www.youtube.com/playlist?list=PL2Cc95P3WAOvVsbrhK9XDPtWNo7-u5--b"
    },
];

// ── Intro scroll ──
const introScreen = document.getElementById('introScreen');
let scrollTimeout;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    introScreen.classList.toggle('fade-out', scrollY > vh * 0.3);

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (scrollY < vh * 0.3 && scrollY > 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (scrollY >= vh * 0.3 && scrollY < vh * 0.85) {
            window.scrollTo({ top: vh, behavior: 'smooth' });
        }
        // beyond 0.85 vh → user is browsing projects, leave them alone
    }, 150);
});

// ── Render tiles ──
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    projects.forEach(project => {
        const tile = document.createElement('div');
        tile.className = `project-tile ${project.category}`;
        tile.onclick = () => openModal(project);

        // Thumbnail: prefer YouTube embed, then image
        let mediaHTML;
        if (project.youtubeId) {
            // Use thumbnail image for the tile (avoids iframe scroll/interaction issues)
            mediaHTML = `<img src="https://img.youtube.com/vi/${project.youtubeId}/mqdefault.jpg" alt="${project.title}">`;
        } else if (project.thumbnail) {
            mediaHTML = `<img src="${project.thumbnail}" alt="${project.title}">`;
        } else {
            mediaHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:7px;color:#444;line-height:2;text-align:center;">NO<br>SIGNAL</span>
            </div>`;
        }

        tile.innerHTML = `
            <div class="tile-thumb">${mediaHTML}</div>
            <div class="tile-content">
                <div class="category">[ ${project.category.toUpperCase()} ]</div>
                <h3>${project.title}</h3>
            </div>
        `;

        grid.appendChild(tile);
    });
}

// ── Modal ──
function openModal(project) {
    const modal        = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const modalBody    = document.getElementById('modalBody');

    // Full iframe in modal (user can interact)
    let mediaHTML;
    if (project.youtubeId) {
        mediaHTML = `<iframe class="media" src="https://www.youtube.com/embed/${project.youtubeId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (project.thumbnail) {
        mediaHTML = `<img class="media" src="${project.thumbnail}" alt="${project.title}">`;
    } else {
        mediaHTML = `<div class="media" style="background:#0d0d0d;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:9px;color:#333;">NO SIGNAL</span>
        </div>`;
    }

    const links = [];
    if (project.repoLink) links.push(`<a href="${project.repoLink}" target="_blank">[ GITHUB REPO ]</a>`);
    if (project.demoLink)  links.push(`<a href="${project.demoLink}"  target="_blank">[ LIVE DEMO ]</a>`);

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
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close on backdrop click
document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
});

// Close on Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

renderProjects();
