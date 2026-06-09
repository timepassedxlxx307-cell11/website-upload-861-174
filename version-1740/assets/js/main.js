(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobile = document.querySelector('[data-mobile-nav]');
    if (toggle && mobile) {
        toggle.addEventListener('click', function () {
            mobile.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    const filterInputs = Array.from(document.querySelectorAll('[data-filter-input]'));
    filterInputs.forEach(function (input) {
        const scopeSelector = input.getAttribute('data-filter-scope') || 'body';
        const scope = document.querySelector(scopeSelector) || document;
        const items = Array.from(scope.querySelectorAll('.movie-card'));
        const empty = document.querySelector(input.getAttribute('data-filter-empty') || '');
        function apply() {
            const value = input.value.trim().toLowerCase();
            let visible = 0;
            items.forEach(function (item) {
                const haystack = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '')).toLowerCase();
                const matched = !value || haystack.indexOf(value) !== -1;
                item.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        input.addEventListener('input', apply);
        apply();
    });

    const configNode = document.getElementById('play-config');
    const video = document.getElementById('movie-video');
    const cover = document.querySelector('[data-play-start]');
    if (configNode && video && cover) {
        let started = false;
        let hlsInstance = null;

        function getUrl() {
            try {
                const config = JSON.parse(configNode.textContent || '{}');
                return config.url || '';
            } catch (error) {
                return '';
            }
        }

        function begin() {
            const url = getUrl();
            if (!url) {
                return;
            }
            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = url;
                }
                video.setAttribute('controls', 'controls');
            }
            cover.classList.add('is-hidden');
            video.play().catch(function () {});
        }

        cover.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
