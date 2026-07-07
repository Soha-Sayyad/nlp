// Mobile Navigation
function toggleNav() {
    document.getElementById('navLinks').classList.toggle('active');
}

// Global active nav link helper
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => document.getElementById('navLinks').classList.remove('active'));
});

// Category overview cards (entry point into Concept Cards)
const categoryMeta = {
    preprocessing: {
        title: 'Text Preprocessing',
        icon: 'fa-filter',
        desc: 'Foundational cleanup steps that turn raw text into a consistent, analyzable form — segmentation, tokenization, case normalization, stop-word removal, stemming and lemmatization.'
    },
    feature: {
        title: 'Feature Engineering',
        icon: 'fa-chart-bar',
        desc: 'Turning clean tokens into numerical signals a model can learn from — Bag of Words, N-Grams, Term Frequency, Inverse Document Frequency and TF-IDF.'
    },
    representation: {
        title: 'Language Representation',
        icon: 'fa-vector-square',
        desc: 'The evolution of word representations — from sparse one-hot vectors to dense, learned embeddings like Word2Vec and FastText, up to contextual embeddings.'
    },
    models: {
        title: 'Language Models',
        icon: 'fa-brain',
        desc: 'How machines model and predict language — classic statistical n-gram models, neural language models, and modern Transformer-based architectures.'
    }
};
const categoryOrder = ['preprocessing', 'feature', 'representation', 'models'];

function renderCategoryGrid() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = categoryOrder.map(cat => {
        const count = document.querySelectorAll('.concept-card[data-cat="' + cat + '"]').length;
        const meta = categoryMeta[cat];
        return `
        <div class="category-card">
            <div class="category-count">${count} Concept${count !== 1 ? 's' : ''}</div>
            <h3>${meta.title}</h3>
            <p>${meta.desc}</p>
            <button type="button" class="category-view-btn" onclick="viewCategory('${cat}')">
                <i class="fas fa-arrow-right"></i> View More
            </button>
        </div>
    `;
    }).join('');
}

function viewCategory(cat) {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.style.display = 'none';
    document.getElementById('backToCategoriesBtn').classList.add('visible');
    const conceptGrid = document.getElementById('conceptGrid');
    conceptGrid.style.display = 'grid';
    document.querySelectorAll('.concept-card').forEach(card => {
        card.style.display = (card.dataset.cat === cat) ? 'flex' : 'none';
    });
    document.getElementById('concepts').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function backToCategories() {
    const grid = document.getElementById('categoryGrid');
    if (grid) grid.style.display = 'grid';
    document.getElementById('backToCategoriesBtn').classList.remove('visible');
    document.getElementById('conceptGrid').style.display = 'none';
}

// Tab Switching
function showTab(tabId, btn) {
    const panel = document.getElementById(tabId);
    if (!panel) return;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

// Scroll to Top Button Setup
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    });
}

// Concept Card Details Modal logic
function initConceptCardDetails() {
    document.querySelectorAll('.concept-card').forEach(card => {
        const body = card.querySelector('.card-body');
        if (!body || body.querySelector('.details-btn')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'details-btn';
        btn.innerHTML = '<i class="fas fa-expand"></i> View Full Details';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openCardModal(card);
        });
        body.appendChild(btn);
    });
}

function openCardModal(card) {
    const overlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');

    const clone = card.cloneNode(true);
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    clone.style.display = 'flex';

    modalBox.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'modal-close-btn';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', closeCardModal);

    modalBox.appendChild(closeBtn);
    modalBox.appendChild(clone);

    overlay.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeCardModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.classList.remove('modal-open');
}

function initModalOverlayEvents() {
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') closeCardModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCardModal();
    });
}

// Scroll animations utilizing IntersectionObserver
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.concept-card, .app-card, .research-card, .workflow-card, .category-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// Asynchronously load HTML section fragments
async function loadSections() {
    const placeholders = document.querySelectorAll('.section-placeholder');
    const promises = Array.from(placeholders).map(async (placeholder) => {
        const src = placeholder.getAttribute('data-src');
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const htmlText = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const newContainer = doc.querySelector('section .container');
            if (newContainer) {
                placeholder.innerHTML = newContainer.innerHTML;
            } else {
                console.error(`Could not locate section container inside ${src}`);
            }
        } catch (error) {
            console.error(`Failed to load page section from ${src}:`, error);
            placeholder.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 2rem;"><i class="fas fa-exclamation-triangle"></i> Failed to import section: ${error.message}</p>`;
        }
    });

    await Promise.all(promises);
}

// Handle anchors landing on load
function handleInitialHashScroll() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }
    }
}

function showLocalFileWarning() {
    if (window.location.protocol === 'file:') {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            bottom: 1.5rem;
            left: 5%;
            right: 5%;
            background: #FFF0E6;
            border: 1px solid #D9735E;
            color: #8E3E26;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: 0 10px 25px rgba(58, 46, 43, 0.15);
            font-family: 'Plus Jakarta Sans', sans-serif;
        `;
        warning.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #D9735E; font-size: 1.2rem;"></i>
            <span><strong>Local File Mode Detected:</strong> Web browsers block dynamic HTML imports over the <code>file://</code> protocol for security. Rest assured, it will load perfectly when uploaded to GitHub Pages. To test locally, please run a local server (e.g. VS Code Live Server or Python server).</span>
        `;
        document.body.appendChild(warning);
    }
}

// Highlight navigation link corresponding to the current scroll section
function initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = [];
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        let targetId = '';
        if (href.startsWith('#')) {
            targetId = href.substring(1);
        } else if (href.includes('#')) {
            targetId = href.split('#')[1];
        }
        if (targetId) {
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                sections.push({ link, section: targetSection });
            }
        }
    });

    if (sections.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sections.forEach(item => {
                    if (item.section === entry.target) {
                        item.link.classList.add('active');
                    } else {
                        item.link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(item => observer.observe(item.section));
}

// Initialize application on load
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Show CORS warning banner if run locally
    showLocalFileWarning();

    // 1. Fetch and inject all subpage segments
    await loadSections();

    // 2. Initialize concept cards & card grids
    renderCategoryGrid();
    initConceptCardDetails();

    // 3. Bind modal key listeners
    initModalOverlayEvents();

    // 4. Fire entrance observers
    initAnimations();

    // 5. Scroll to targeted URL hash
    handleInitialHashScroll();

    // 6. Highlight active section on scroll
    initScrollSpy();
});
