(function () {
    function toArray(value) {
        return Array.prototype.slice.call(value || []);
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.textContent = open ? '×' : '☰';
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = toArray(root.querySelectorAll('.hero-slide'));
        var dots = toArray(root.querySelectorAll('.hero-dot'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupSearchPage() {
        var input = document.getElementById('search-input');
        var type = document.getElementById('filter-type');
        var region = document.getElementById('filter-region');
        var form = document.getElementById('search-form');
        var results = document.getElementById('search-results');
        if (!input || !type || !region || !form || !results || !window.movieIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        input.value = params.get('q') || '';
        function card(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<a class="movie-card" href="./' + encodeURI(item.url) + '">' +
                '<figure class="movie-poster">' +
                '<img src="' + encodeURI(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="year-badge">' + escapeHtml(item.year) + '</span>' +
                '</figure>' +
                '<div class="movie-card-body">' +
                '<h3>' + escapeHtml(item.title) + '</h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</a>';
        }
        function escapeHtml(value) {
            return String(value == null ? '' : value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
        function filter() {
            var q = input.value.trim().toLowerCase();
            var chosenType = type.value;
            var chosenRegion = region.value;
            var items = window.movieIndex.filter(function (item) {
                var haystack = [item.title, item.region, item.type, item.genre, item.oneLine, (item.tags || []).join(' ')].join(' ').toLowerCase();
                var okQuery = !q || haystack.indexOf(q) !== -1;
                var okType = !chosenType || item.type === chosenType;
                var okRegion = !chosenRegion || item.region.indexOf(chosenRegion) !== -1;
                return okQuery && okType && okRegion;
            });
            results.innerHTML = items.slice(0, 240).map(card).join('') || '<p class="empty-state">换一个关键词继续查找。</p>';
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            filter();
            var params = new URLSearchParams();
            if (input.value.trim()) {
                params.set('q', input.value.trim());
            }
            var url = params.toString() ? 'search.html?' + params.toString() : 'search.html';
            window.history.replaceState(null, '', url);
        });
        input.addEventListener('input', filter);
        type.addEventListener('change', filter);
        region.addEventListener('change', filter);
        filter();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupSearchPage();
    });
}());
