(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = parseInt(dot.getAttribute('data-hero-dot'), 10);
        show(nextIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupSearchRedirects() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function setupListingFilters() {
    var listing = document.querySelector('[data-listing]');
    if (!listing) {
      return;
    }
    var input = listing.querySelector('[data-filter-input]');
    var reset = listing.querySelector('[data-filter-reset]');
    var count = listing.querySelector('[data-visible-count]');
    var cards = Array.prototype.slice.call(listing.querySelectorAll('.movie-card'));
    var typeButtons = Array.prototype.slice.call(listing.querySelectorAll('[data-filter-type]'));
    var yearButtons = Array.prototype.slice.call(listing.querySelectorAll('[data-filter-year]'));
    var currentType = '';
    var currentYear = '';

    function setActive(buttons, value, attribute) {
      buttons.forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute(attribute) === value);
      });
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !currentType || card.getAttribute('data-type') === currentType;
        var matchYear = !currentYear || card.getAttribute('data-year') === currentYear;
        var isVisible = matchQuery && matchType && matchYear;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentType = button.getAttribute('data-filter-type') || '';
        setActive(typeButtons, currentType, 'data-filter-type');
        applyFilter();
      });
    });

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentYear = button.getAttribute('data-filter-year') || '';
        setActive(yearButtons, currentYear, 'data-filter-year');
        applyFilter();
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        currentType = '';
        currentYear = '';
        setActive(typeButtons, '', 'data-filter-type');
        setActive(yearButtons, '', 'data-filter-year');
        applyFilter();
      });
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-player-button]');
      var hlsSource = shell.getAttribute('data-hls-src');
      var mp4Source = shell.getAttribute('data-mp4-src');
      var initialized = false;

      function initialize() {
        if (!video || initialized) {
          return;
        }
        initialized = true;
        if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsSource;
        } else if (hlsSource && window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(hlsSource);
          hls.attachMedia(video);
        } else if (mp4Source) {
          video.src = mp4Source;
        }
      }

      function play() {
        initialize();
        if (button) {
          button.classList.add('is-hidden');
        }
        if (video) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              video.controls = true;
            });
          }
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearchRedirects();
    setupListingFilters();
    setupPlayers();
  });
})();
