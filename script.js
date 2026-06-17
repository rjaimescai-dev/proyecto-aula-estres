

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. BARRA DE PROGRESO DE LECTURA (SUPERIOR) ---
    const createProgressBar = () => {
        const progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        Object.assign(progressBar.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            height: '5px',
            background: 'linear-gradient(to right, #27ae60, #3498db, #9b59b6)',
            width: '0%',
            zIndex: '10000',
            transition: 'width 0.1s ease-out'
        });
        document.body.prepend(progressBar);

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        });
    };
    createProgressBar();


    // --- 2. ANIMACIÓN DE REVELADO SUAVE (SCROLL REVEAL) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                
                // Si el elemento es una barra estadística, animamos su llenado real
                if (entry.target.classList.contains('bar-fill')) {
                    const finalWidth = entry.target.dataset.width;
                    entry.target.style.width = finalWidth;
                }
                
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Registramos todos los componentes interactivos de las 5 páginas para animación
    const elementsToAnimate = document.querySelectorAll(
        '.card, .bio-grid, .info-box, .type-card, .section-title, .causa-item, .alerta-box, .home-card, .step-card, .acc-item'
    );
    
    elementsToAnimate.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        revealObserver.observe(el);
    });


    // --- 3. LOGICA DE ACORDEONES (Página Enfermedades) ---
    const accordionHeaders = document.querySelectorAll('.acc-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            
            // Cerrar otros acordeones abiertos para una lectura limpia
            document.querySelectorAll('.acc-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const span = otherItem.querySelector('.acc-header span');
                    if (span) span.innerText = '+';
                }
            });

            // Alternar estado actual
            item.classList.toggle('active');
            const icon = header.querySelector('span');
            if (icon) {
                icon.innerText = item.classList.contains('active') ? '-' : '+';
            }
        });
    });


    // --- 4. BUSCADOR INTERACTIVO DE SÍNTOMAS (Página Biología) ---
    const symptomInput = document.getElementById('symptomSearch');
    if (symptomInput) {
        symptomInput.addEventListener('keyup', () => {
            let filter = symptomInput.value.toLowerCase();
            let tags = document.querySelectorAll('.tag');
            
            tags.forEach(tag => {
                let text = tag.textContent || tag.innerText;
                if (text.toLowerCase().indexOf(filter) > -1) {
                    tag.style.display = "";
                    tag.style.animation = "fadeIn 0.3s forwards";
                } else {
                    tag.style.display = "none";
                }
            });
        });
    }


    // --- 5. ANIMACIÓN DINÁMICA DE LAS BARRAS (Página Estadísticas) ---
    // Preparamos las barras guardando su porcentaje y poniéndolas en cero inicialmente
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
        const targetWidth = bar.style.width; // Lee el width asignado en el HTML (ej: 85%)
        bar.dataset.width = targetWidth;     // Guarda el valor
        bar.style.width = "0%";              // Lo baja a cero para la animación inicial
        bar.style.transition = "width 1.5s cubic-bezier(0.1, 1, 0.1, 1)";
        revealObserver.observe(bar);         // El observador activa el llenado al hacer scroll
    });


    // --- 6. RESALTADO INTELIGENTE DEL MENÚ (5 VENTANAS) ---
    const currentURL = window.location.href;
    const menuLinks = document.querySelectorAll('.nav-links a');

    menuLinks.forEach(link => {
        // Validación precisa para la página de inicio e internas
        if (currentURL.includes(link.getAttribute('href')) || 
           (currentURL.endsWith('/') && link.getAttribute('href') === 'index.html')) {
            link.style.color = "#27ae60";
            link.style.fontWeight = "600";
            link.style.borderBottom = "2px solid #27ae60";
            link.style.paddingBottom = "5px";
        }
    });

    console.log("🚀 Plataforma interactiva de Salud Mental de 5 módulos iniciada correctamente.");
});