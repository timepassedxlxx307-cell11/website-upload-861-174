document.addEventListener('DOMContentLoaded', function() {
    var menuButton = document.querySelector('.menu-toggle');
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            document.body.classList.toggle('nav-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;
        var showSlide = function(index) {
            current = index;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var index = Number(dot.getAttribute('data-slide')) || 0;
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            setInterval(function() {
                showSlide((current + 1) % slides.length);
            }, 5000);
        }
    }

    var filter = document.querySelector('[data-filter-form]');
    if (filter) {
        var keyword = filter.querySelector('[data-filter-keyword]');
        var genre = filter.querySelector('[data-filter-genre]');
        var year = filter.querySelector('[data-filter-year]');
        var region = filter.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.listing-grid .movie-card'));
        var applyFilter = function() {
            var keywordValue = keyword.value.trim().toLowerCase();
            var genreValue = genre.value;
            var yearValue = year.value;
            var regionValue = region.value;
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || ''
                ].join(' ').toLowerCase();
                var matched = true;
                if (keywordValue && haystack.indexOf(keywordValue) === -1) {
                    matched = false;
                }
                if (genreValue && (card.getAttribute('data-genre') || '').indexOf(genreValue) === -1) {
                    matched = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    matched = false;
                }
                if (regionValue && card.getAttribute('data-region') !== regionValue) {
                    matched = false;
                }
                card.classList.toggle('is-hidden', !matched);
            });
        };
        [keyword, genre, year, region].forEach(function(control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        });
    }

    var searchForm = document.querySelector('[data-search-page-form]');
    var searchResults = document.querySelector('[data-search-results]');
    if (searchForm && searchResults && Array.isArray(window.SITE_MOVIES)) {
        var searchInput = searchForm.querySelector('input[name="q"]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;
        var renderResults = function(query) {
            var q = query.trim().toLowerCase();
            var results = window.SITE_MOVIES.filter(function(movie) {
                var text = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags].join(' ').toLowerCase();
                return !q || text.indexOf(q) !== -1;
            }).slice(0, 120);
            searchResults.innerHTML = results.map(function(movie) {
                return '<article class="movie-card">' +
                    '<a href="' + movie.href + '" class="card-link">' +
                    '<span class="card-cover"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="card-badge">' + escapeHtml(movie.year) + '</span></span>' +
                    '<span class="card-body"><strong>' + escapeHtml(movie.title) + '</strong><span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</span><span class="card-line">' + escapeHtml(movie.line) + '</span><span class="tag-row">' + movie.tags.split(' ').slice(0, 3).map(function(tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</span></span>' +
                    '</a></article>';
            }).join('');
        };
        var escapeHtml = function(value) {
            return String(value).replace(/[&<>"']/g, function(character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[character];
            });
        };
        renderResults(initialQuery);
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var value = searchInput.value.trim();
            var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
            window.history.replaceState(null, '', url);
            renderResults(value);
        });
    }
});
