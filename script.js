/* ============================================
   PLOMÉO — Premium Artisan Website
   Advanced JavaScript Interactions
   ============================================ */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initLoader();
    initCursor();
    initNavigation();
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initServiceCards();
    initPortfolioFilters();
    initProjectModals();
    initArticleModals();
    initContactForm();
    initSmoothScroll();
    initMagneticButtons();
});

/* ============================================
   LOADER
   ============================================ */

function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    // Fonction pour cacher le loader
    function hideLoader() {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
    }

    // Fonction pour révéler les éléments
    function revealElements() {
        document.querySelectorAll('[data-reveal]').forEach(el => {
            el.classList.add('visible');
        });
    }

    // Fallback: toujours cacher le loader après un délai maximum (sécurité)
    const maxLoaderTime = 3000; // 3 secondes maximum
    const fallbackTimeout = setTimeout(() => {
        hideLoader();
        revealElements();
    }, maxLoaderTime);

    // Check navigation type
    let navType;
    try {
        navType = performance.getEntriesByType('navigation')[0]?.type;
    } catch (e) {
        navType = null;
    }
    
    const isBackNavigation = navType === 'back_forward';
    const isReload = navType === 'reload';
    const savedScrollPosition = sessionStorage.getItem('plomeo_scroll_position');
    const wasViewingArticle = sessionStorage.getItem('plomeo_viewing_article') === 'true';

    // If returning from article modal, scroll to blog section
    if (isBackNavigation && wasViewingArticle) {
        clearTimeout(fallbackTimeout);
        hideLoader();
        sessionStorage.removeItem('plomeo_viewing_article');
        
        setTimeout(() => {
            revealElements();
            
            const blogSection = document.getElementById('expertise');
            if (blogSection) {
                setTimeout(() => {
                    const headerOffset = 80;
                    const elementPosition = blogSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }, 100);
        return;
    }

    // If reload or back navigation with saved position, restore scroll
    if ((isReload || isBackNavigation) && savedScrollPosition) {
        clearTimeout(fallbackTimeout);
        hideLoader();
        
        setTimeout(() => {
            revealElements();
            
            // Restore scroll position
            setTimeout(() => {
                window.scrollTo({
                    top: parseInt(savedScrollPosition, 10),
                    behavior: 'auto'
                });
            }, 100);
        }, 100);
        return;
    }

    // First visit: show loader
    document.body.classList.add('loading');

    // Simulate loading and hide
    setTimeout(() => {
        clearTimeout(fallbackTimeout);
        hideLoader();

        // Trigger hero animations after loader
        setTimeout(() => {
            document.querySelectorAll('.hero [data-reveal]').forEach(el => {
                el.classList.add('visible');
            });
            revealElements();
        }, 200);
    }, 2000);
}

// Save scroll position before page unload
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('plomeo_scroll_position', window.scrollY.toString());
});

// Save scroll position periodically while scrolling
let scrollSaveTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollSaveTimeout);
    scrollSaveTimeout = setTimeout(() => {
        sessionStorage.setItem('plomeo_scroll_position', window.scrollY.toString());
    }, 500);
}, { passive: true });

/* ============================================
   CUSTOM CURSOR
   ============================================ */

function initCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor || window.matchMedia('(hover: none)').matches) return;

    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animation loop
    function animate() {
        // Dot follows closely
        dotX += (mouseX - dotX) * 0.2;
        dotY += (mouseY - dotY) * 0.2;
        dot.style.left = `${dotX}px`;
        dot.style.top = `${dotY}px`;

        // Ring follows with delay
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;

        requestAnimationFrame(animate);
    }
    animate();

    // Hover states
    const hoverElements = document.querySelectorAll('a, button, [data-magnetic], .project, .article, .service');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Click state
    document.addEventListener('mousedown', () => cursor.classList.add('click'));
    document.addEventListener('mouseup', () => cursor.classList.remove('click'));
}

/* ============================================
   NAVIGATION
   ============================================ */

function initNavigation() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav__link');
    if (!header) return;

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // Active section detection
    function updateActiveSection() {
        const sections = [
            { id: 'hero', nav: 'accueil' },
            { id: 'vision', nav: 'apropos' },
            { id: 'services', nav: 'prestations' },
            { id: 'realisations', nav: 'realisations' },
            { id: 'expertise', nav: 'blog' }
        ];

        const scrollPosition = window.scrollY + 150;

        let activeNav = 'accueil';
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i].id);
            if (section) {
                const sectionTop = section.offsetTop;
                if (scrollPosition >= sectionTop) {
                    activeNav = sections[i].nav;
                    break;
                }
            }
        }

        navLinks.forEach(link => {
            const navId = link.dataset.nav;
            if (navId === activeNav) {
                link.classList.add('nav__link--active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('nav__link--active');
                link.removeAttribute('aria-current');
            }
        });
    }

    // Update on scroll
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    
    // Update on load
    updateActiveSection();

    // Smooth scroll on click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 100;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/* ============================================
   MOBILE MENU
   ============================================ */

function initMobileMenu() {
    const burger = document.getElementById('navBurger');
    const menu = document.getElementById('mobileMenu');
    const links = menu?.querySelectorAll('.mobile-menu__link');

    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close on link click
    links?.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            menu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

/* ============================================
   SCROLL REVEAL
   ============================================ */

function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        // Skip hero elements (handled by loader)
        if (!el.closest('.hero')) {
            observer.observe(el);
        }
    });
}

/* ============================================
   COUNTER ANIMATIONS
   ============================================ */

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out-expo)
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(eased * target);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

/* ============================================
   SERVICE CARDS HOVER EFFECT
   ============================================ */

function initServiceCards() {
    const cards = document.querySelectorAll('.service');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

/* ============================================
   PORTFOLIO FILTERS
   ============================================ */

function initPortfolioFilters() {
    const filters = document.querySelectorAll('.portfolio__filter');
    const projects = document.querySelectorAll('.project');

    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            const category = filter.dataset.filter;

            // Update active filter
            filters.forEach(f => f.classList.remove('portfolio__filter--active'));
            filter.classList.add('portfolio__filter--active');

            // Filter projects with animation
            projects.forEach((project, index) => {
                const projectCategory = project.dataset.category;

                if (category === 'all' || projectCategory === category) {
                    project.classList.remove('hidden');
                    project.style.animation = `fadeInUp 0.5s ease ${index * 0.05}s forwards`;
                } else {
                    project.classList.add('hidden');
                }
            });
        });
    });
}

/* ============================================
   PROJECT MODALS
   ============================================ */

function initProjectModals() {
    const projects = document.querySelectorAll('.project');
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('projectModalContent');
    const backdrop = modal?.querySelector('.modal__backdrop');
    const closeBtn = modal?.querySelector('.modal__close');

    const projectsData = {
        1: {
            tag: 'Plomberie',
            title: 'Salle de bain contemporaine',
            location: 'Villa privée — Saint-Tropez',
            description: 'Rénovation complète d\'une salle de bain de 25m² dans une villa de standing. Le projet comprenait la création d\'une douche à l\'italienne XXL avec système de drainage linéaire, d\'une double vasque sur-mesure en Corian et l\'installation d\'une robinetterie haut de gamme Dornbracht. Nous avons travaillé en étroite collaboration avec l\'architecte d\'intérieur pour assurer une intégration parfaite des réseaux dans les nouvelles cloisons, tout en respectant les contraintes du bâti ancien.',
            details: { duration: '4 semaines', budget: '45 000 €', year: '2025' }
        },
        2: {
            tag: 'Chauffage',
            title: 'Système géothermique',
            location: 'Maison d\'architecte — Hyères',
            description: 'Installation d\'un système de chauffage géothermique complet pour une maison contemporaine de 300m². Le projet incluait le forage de 4 sondes verticales à 100m de profondeur, l\'installation de la pompe à chaleur sol/eau de dernière génération et la mise en place d\'un plancher chauffant basse température dans l\'ensemble des pièces. Une solution éco-responsable offrant un confort optimal toute l\'année avec un COP supérieur à 5.',
            details: { duration: '6 semaines', budget: '65 000 €', year: '2025' }
        },
        3: {
            tag: 'Climatisation',
            title: 'Climatisation gainable',
            location: 'Appartement de standing — Toulon',
            description: 'Installation discrète d\'un système de climatisation gainable dans un appartement de standing de 180m². Le défi : intégrer parfaitement les gaines dans les faux plafonds existants tout en préservant les moulures d\'origine et la hauteur sous plafond. Diffusion par grilles linéaires invisibles et régulation par zones. Résultat : un confort thermique invisible qui respecte le caractère historique des lieux.',
            details: { duration: '3 semaines', budget: '28 000 €', year: '2025' }
        },
        4: {
            tag: 'Plomberie',
            title: 'Cuisine professionnelle',
            location: 'Restaurant gastronomique — Fréjus',
            description: 'Conception et réalisation du réseau de plomberie complet d\'une cuisine de restaurant étoilé. Installation aux normes HACCP avec évacuations surdimensionnées, systèmes anti-retour, bacs à graisse et traitement des eaux grasses. Alimentation en eau chaude instantanée haute capacité pour faire face aux pics d\'activité. Un projet technique exigeant réalisé dans des délais serrés pour respecter l\'ouverture du restaurant.',
            details: { duration: '5 semaines', budget: '55 000 €', year: '2024' }
        },
        5: {
            tag: 'Chauffage',
            title: 'Plancher chauffant intégral',
            location: 'Loft rénové — Draguignan',
            description: 'Transformation d\'un ancien atelier de 450m² en loft d\'habitation avec installation d\'un plancher chauffant hydraulique sur l\'ensemble de la surface. Défi technique majeur : gérer les différences de niveau et intégrer le système dans une dalle béton existante de caractère industriel. Régulation par 6 zones indépendantes avec thermostat connecté pour un confort personnalisé dans chaque espace de vie.',
            details: { duration: '8 semaines', budget: '72 000 €', year: '2024' }
        },
        6: {
            tag: 'Climatisation',
            title: 'VMC double flux',
            location: 'Bureaux design — La Seyne-sur-Mer',
            description: 'Installation d\'un système de ventilation double flux haute performance pour des bureaux de 800m². Le système assure un renouvellement d\'air optimal tout en récupérant plus de 90% de la chaleur de l\'air extrait grâce à un échangeur enthalpique de dernière génération. Qualité de l\'air intérieur et économies d\'énergie au rendez-vous, avec des mesures de CO2 constamment sous les 800 ppm.',
            details: { duration: '4 semaines', budget: '38 000 €', year: '2025' }
        }
    };

    projects.forEach(project => {
        project.addEventListener('click', (e) => {
            const id = project.dataset.project;
            const data = projectsData[id];

            if (data && modalContent) {
                modalContent.innerHTML = `
                        <div class="project-modal__gallery">
                        <span>Galerie photos du projet</span>
                        </div>
                        <div class="project-modal__info">
                        <span class="project-modal__tag">${data.tag}</span>
                        <h2 class="project-modal__title">${data.title}</h2>
                        <p class="project-modal__location">${data.location}</p>
                        <p class="project-modal__desc">${data.description}</p>
                            <div class="project-modal__details">
                                <div class="project-modal__detail">
                                    <h4>Durée</h4>
                                <p>${data.details.duration}</p>
                                </div>
                                <div class="project-modal__detail">
                                    <h4>Budget</h4>
                                <p>${data.details.budget}</p>
                                </div>
                                <div class="project-modal__detail">
                                    <h4>Année</h4>
                                <p>${data.details.year}</p>
                            </div>
                        </div>
                    </div>
                `;
                openModal(modal, project);
            }
        });
    });

    backdrop?.addEventListener('click', () => closeModal(modal));
    closeBtn?.addEventListener('click', () => closeModal(modal));
}

/* ============================================
   ARTICLE MODALS
   ============================================ */

function initArticleModals() {
    const articles = document.querySelectorAll('.journal__item');
    const modal = document.getElementById('articleModal');
    const modalContent = document.getElementById('articleModalContent');
    const backdrop = modal?.querySelector('.modal__backdrop');
    const closeBtn = modal?.querySelector('.modal__close');

    const articlesData = {
        1: {
            category: 'Plomberie',
            title: 'Plomberie haut de gamme : investir dans la qualité pour votre habitat',
            date: '15 Janvier 2026',
            readTime: '5 min',
            image: 'https://images.pexels.com/photos/7227624/pexels-photo-7227624.jpeg?auto=compress&cs=tinysrgb&w=1200',
            content: `
                <p>Dans le domaine de la plomberie, la différence entre une installation standard et une installation premium ne se voit pas toujours au premier coup d'œil. Pourtant, elle fait toute la différence sur le long terme : durabilité, performance, esthétique et valeur immobilière.</p>

                <h2>Les matériaux nobles : un investissement durable</h2>
                <p>Chez Ploméo, nous privilégions systématiquement les matériaux de première qualité. Le cuivre recuit pour sa souplesse et sa résistance à la corrosion, le PER multicouche de qualité supérieure avec barrière anti-oxygène, l'inox alimentaire 316L pour les réseaux d'eau potable... Chaque composant est sélectionné pour sa longévité et sa résistance.</p>
                <p>Un réseau de plomberie correctement conçu et installé avec des matériaux premium peut durer <strong>plus de 50 ans</strong> sans intervention majeure. C'est un investissement qui traverse les générations et valorise durablement votre patrimoine immobilier.</p>

                <h2>La robinetterie : l'alliance du design et de la performance</h2>
                <p>La robinetterie haut de gamme ne se distingue pas uniquement par son esthétique. Les marques premium comme Grohe, Hansgrohe ou Dornbracht intègrent des technologies qui font la différence au quotidien :</p>
                <ul>
                    <li>Cartouches céramiques haute précision avec garantie 500 000 cycles</li>
                    <li>Limiteurs de débit intégrés pour des économies d'eau jusqu'à 50%</li>
                    <li>Finitions PVD résistantes aux traces et à la corrosion</li>
                    <li>Garanties fabricant étendues jusqu'à 15 ans</li>
                </ul>

                <h2>L'installation : le savoir-faire qui fait la différence</h2>
                <p>Un matériau de qualité mal installé perd tout son potentiel. C'est pourquoi nous accordons une attention particulière à chaque détail : brasures parfaites au millimètre, supports adaptés au diamètre et au poids des tuyauteries, isolation phonique systématique des réseaux, accessibilité optimale des vannes d'arrêt pour la maintenance future.</p>
                <p>Notre équipe est formée aux dernières techniques et certifiée par les principaux fabricants. Cette expertise garantit une installation conforme aux normes DTU les plus strictes et aux règles de l'art du métier.</p>

                <h3>Conclusion</h3>
                <p>Investir dans une plomberie haut de gamme, c'est faire le choix de la tranquillité d'esprit. Moins de fuites, moins d'interventions, une esthétique préservée dans le temps et une valorisation certaine de votre bien immobilier. Chez Ploméo, nous accompagnons nos clients dans cette démarche d'excellence depuis plus de 15 ans.</p>
            `
        },
        2: {
            category: 'Chauffage',
            title: 'Confort thermique optimal : les solutions modernes de chauffage',
            date: '8 Janvier 2026',
            readTime: '7 min',
            image: 'https://images.pexels.com/photos/7937300/pexels-photo-7937300.jpeg?auto=compress&cs=tinysrgb&w=1200',
            content: `
                <p>Le confort thermique est bien plus qu'une simple question de température ambiante. Il englobe la qualité de l'air, l'homogénéité de la chaleur dans chaque pièce, l'absence de courants d'air froid et une régulation fine adaptée à vos habitudes de vie.</p>

                <h2>La pompe à chaleur : efficacité et écologie</h2>
                <p>La pompe à chaleur (PAC) s'est imposée comme la solution de référence pour les constructions neuves et les rénovations ambitieuses. Son principe est élégant : puiser les calories présentes dans l'environnement (air, sol ou eau) pour chauffer votre intérieur avec un rendement exceptionnel.</p>
                <p>Les <strong>PAC air/eau</strong> de nouvelle génération affichent des coefficients de performance (COP) supérieurs à 5 en mi-saison, ce qui signifie que pour 1 kWh d'électricité consommé, elles restituent plus de 5 kWh de chaleur. Une efficacité remarquable qui se traduit par des économies substantielles sur vos factures énergétiques.</p>

                <h2>Le plancher chauffant : le summum du confort</h2>
                <p>Le plancher chauffant basse température représente la solution idéale pour un confort thermique sans compromis :</p>
                <ul>
                    <li>Chaleur douce et homogène sur toute la surface habitable</li>
                    <li>Absence totale de radiateurs pour une liberté d'aménagement maximale</li>
                    <li>Température de surface agréable entre 22 et 24°C</li>
                    <li>Compatible avec tous les revêtements de sol (carrelage, parquet, béton ciré)</li>
                    <li>Option rafraîchissement en été avec les systèmes réversibles</li>
                </ul>
                <p>Associé à une pompe à chaleur, le plancher chauffant forme un système particulièrement efficient grâce à sa faible température de fonctionnement (35°C contre 60°C pour des radiateurs classiques).</p>

                <h2>Les chaudières nouvelle génération</h2>
                <p>Pour les logements raccordés au gaz naturel, les chaudières à condensation représentent l'évolution ultime de cette technologie éprouvée. En récupérant la chaleur latente des fumées, elles atteignent des rendements supérieurs à 108% sur PCI.</p>
                <p>Les modèles les plus récents intègrent des fonctionnalités connectées : pilotage à distance via smartphone, adaptation automatique aux conditions météo grâce à la sonde extérieure, diagnostic préventif et alertes maintenance.</p>

                <h2>La régulation : le nerf de la guerre énergétique</h2>
                <p>Un système de chauffage performant sans régulation adaptée est comme une voiture de sport sans direction assistée. Nous préconisons systématiquement :</p>
                <ul>
                    <li>Des thermostats d'ambiance programmables ou connectés avec apprentissage</li>
                    <li>Des robinets thermostatiques électroniques sur chaque émetteur</li>
                    <li>Une sonde extérieure pour anticiper les variations climatiques</li>
                    <li>Un système de gestion par zones pour les grandes surfaces</li>
                </ul>

                <h3>Notre engagement</h3>
                <p>Chez Ploméo, nous concevons chaque installation comme un système global cohérent, où chaque composant est optimisé pour travailler en harmonie avec les autres. C'est cette approche holistique qui garantit un confort thermique optimal et des performances durables dans le temps.</p>
            `
        },
        3: {
            category: 'Climatisation',
            title: 'Climatisation invisible : intégration architecturale et performance',
            date: '2 Janvier 2026',
            readTime: '6 min',
            image: 'https://images.unsplash.com/photo-1759807107127-6d91d188a6a9?crop=entropy&cs=tinysrgb&w=1200',
            content: `
                <p>Longtemps considérée comme un équipement disgracieux réservé aux bureaux et commerces, la climatisation a connu une véritable révolution ces dernières années. Les solutions actuelles permettent d'atteindre un confort thermique exceptionnel tout en préservant — voire sublimant — l'esthétique de vos espaces de vie.</p>

                <h2>Le système gainable : l'invisibilité totale</h2>
                <p>Le climatiseur gainable représente le nec plus ultra de la discrétion. L'unité intérieure, compacte et silencieuse, s'installe dans un faux plafond, des combles ou un local technique. L'air climatisé est ensuite diffusé via un réseau de gaines souples isolées vers chaque pièce.</p>
                <p>Seules les grilles de soufflage et de reprise, parfaitement intégrées au plafond ou aux murs, témoignent de la présence du système. Cette solution est particulièrement adaptée aux :</p>
                <ul>
                    <li>Appartements haussmanniens avec moulures et plafonds décorés à préserver</li>
                    <li>Maisons d'architecte au design épuré et minimaliste</li>
                    <li>Espaces commerciaux et showrooms haut de gamme</li>
                    <li>Hôtels et résidences de standing où le confort doit être invisible</li>
                </ul>

                <h2>Les splits design : quand la technologie devient objet déco</h2>
                <p>Pour les configurations où le gainable n'est pas envisageable, les fabricants premium proposent désormais des unités murales aux lignes contemporaines qui s'intègrent harmonieusement dans les intérieurs les plus exigeants. Certains modèles se présentent comme de véritables tableaux avec des façades personnalisables en tissu, bois ou métal.</p>
                <p>Les performances ne sont pas en reste : niveau sonore inférieur à 19 dB(A) en mode nuit (équivalent au bruissement des feuilles), filtration avancée de l'air avec ionisation et photocatalyse, technologies inverter pour une régulation au dixième de degré près.</p>

                <h2>La climatisation réversible : chauffer et rafraîchir</h2>
                <p>La pompe à chaleur air/air réversible offre une solution deux-en-un particulièrement économique pour les régions au climat tempéré. En hiver, elle capte les calories de l'air extérieur — même par température négative — pour chauffer votre intérieur. En été, le cycle s'inverse pour rafraîchir efficacement vos espaces.</p>
                <p>Avec des COP atteignant 5 en mode chauffage et des EER supérieurs à 4 en mode rafraîchissement, cette solution génère jusqu'à 5 fois plus d'énergie thermique qu'elle n'en consomme en électricité. Un argument écologique et économique majeur face aux solutions traditionnelles.</p>

                <h2>La qualité de l'air : un enjeu de santé publique</h2>
                <p>Au-delà du confort thermique, les systèmes de climatisation modernes contribuent activement à améliorer la qualité de l'air intérieur — un enjeu sanitaire majeur alors que nous passons 80% de notre temps dans des espaces clos :</p>
                <ul>
                    <li>Filtres HEPA H13 capturant 99,95% des particules fines et allergènes</li>
                    <li>Systèmes de purification par plasma froid ou photocatalyse</li>
                    <li>Contrôle de l'humidité relative entre 40 et 60%</li>
                    <li>Renouvellement d'air par VMC intégrée ou couplée</li>
                </ul>

                <h3>L'expertise Ploméo</h3>
                <p>Chaque projet de climatisation requiert une étude personnalisée approfondie : calcul précis des charges thermiques pièce par pièce, dimensionnement adapté sans sur-équipement, positionnement optimal des unités pour un confort homogène, intégration architecturale soignée. Notre bureau d'études accompagne chaque client pour garantir une installation performante, discrète et pérenne.</p>
            `
        }
    };

    articles.forEach(article => {
        article.addEventListener('click', (e) => {
            const id = article.dataset.article;
            const data = articlesData[id];

            if (data && modalContent) {
                modalContent.innerHTML = `
                    <div class="article-modal">
                        ${data.image ? `<div class="article-modal__image">
                            <img src="${data.image}" alt="${data.title}" class="article-modal__img">
                        </div>` : ''}
                        <div class="article-modal__header">
                            <span class="article-modal__category">${data.category}</span>
                            <h1 class="article-modal__title">${data.title}</h1>
                            <div class="article-modal__meta">
                                <span>${data.date}</span>
                                <span>•</span>
                                <span>${data.readTime} de lecture</span>
                            </div>
                        </div>
                        <div class="article-modal__content">
                            ${data.content}
                        </div>
                    </div>
                `;
                // Mark that we're viewing an article
                sessionStorage.setItem('plomeo_viewing_article', 'true');
                openModal(modal, article);
            }
        });
    });

    backdrop?.addEventListener('click', () => closeModal(modal));
    closeBtn?.addEventListener('click', () => closeModal(modal));
}

/* ============================================
   MODAL UTILITIES (Enhanced with accessibility)
   ============================================ */

// Store the element that triggered modal opening
let lastFocusedElement = null;
let scrollbarWidth = 0;

// Calculate scrollbar width once
function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

function openModal(modal, triggerElement) {
    if (!modal) return;

    // Store trigger element for focus return
    lastFocusedElement = triggerElement || document.activeElement;

    // Calculate scrollbar width and prevent layout shift
    scrollbarWidth = getScrollbarWidth();
    document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');

    // Show modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    // Set ARIA attributes
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');

    // Focus first focusable element in modal
    setTimeout(() => {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const closeBtn = modal.querySelector('.modal__close');
        if (closeBtn) {
            closeBtn.focus();
        } else if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            modal.setAttribute('tabindex', '-1');
            modal.focus();
        }
    }, 100);
}

function closeModal(modal) {
    if (!modal) return;

    // Hide modal
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');

    // Clear article viewing flag when closing modal
    if (modal.id === 'articleModal') {
        sessionStorage.removeItem('plomeo_viewing_article');
    }

    // Return focus to trigger element
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        setTimeout(() => {
            lastFocusedElement.focus();
        }, 100);
    }
    lastFocusedElement = null;
}

// Close on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) closeModal(activeModal);
    }
});

// Tab trap within modal
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const activeModal = document.querySelector('.modal.active');
    if (!activeModal) return;

    const focusableElements = activeModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
    } else {
        // Tab
        if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

/* ============================================
   CONTACT FORM
   ============================================ */

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;

        // Loading state
        btn.innerHTML = `
            <span class="btn__text">Envoi en cours...</span>
            <span class="btn__icon" style="animation: spin 1s linear infinite;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            </span>
        `;
        btn.disabled = true;

        // Simulate submission
        setTimeout(() => {
            btn.innerHTML = `
                <span class="btn__text">Message envoyé !</span>
                <span class="btn__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                </span>
            `;
            btn.style.background = '#22c55e';

            setTimeout(() => {
                form.reset();
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        }, 1500);
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 100;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   MAGNETIC BUTTONS
   ============================================ */

function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    const elements = document.querySelectorAll('[data-magnetic]');

    elements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

/* ============================================
   CSS ANIMATION KEYFRAMES (injected)
   ============================================ */

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
