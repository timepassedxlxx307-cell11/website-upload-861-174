(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', nav.classList.contains('is-open'));
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    if (slides.length <= 1) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search-form'));

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';

        if (!query) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
          return;
        }
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function setupFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));

    bars.forEach(function (bar) {
      var input = bar.querySelector('[data-page-filter-input]');
      var list = document.querySelector('[data-filter-list]');
      var count = bar.querySelector('[data-filter-count]');
      var buttons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter-token]'));
      var regionSelect = bar.querySelector('[data-region-select]');
      var yearSelect = bar.querySelector('[data-year-select]');
      var sortSelect = bar.querySelector('[data-sort-select]');

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      var activeToken = '';

      function applyFilters() {
        var query = normalize(input ? input.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesToken = !activeToken || text.indexOf(normalize(activeToken)) !== -1;
          var matchesRegion = !region || normalize(card.getAttribute('data-region')) === region;
          var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
          var shouldShow = matchesQuery && matchesToken && matchesRegion && matchesYear;

          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      function applySort() {
        if (!sortSelect) {
          return;
        }

        var mode = sortSelect.value;
        var sortedCards = cards.slice();

        if (mode === 'year-desc') {
          sortedCards.sort(function (a, b) {
            return normalize(b.getAttribute('data-year')).localeCompare(normalize(a.getAttribute('data-year')));
          });
        }

        if (mode === 'title-asc') {
          sortedCards.sort(function (a, b) {
            return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-CN');
          });
        }

        sortedCards.forEach(function (card) {
          list.appendChild(card);
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeToken = button.getAttribute('data-filter-token') || '';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          applyFilters();
        });
      });

      if (input) {
        input.addEventListener('input', applyFilters);
      }

      if (regionSelect) {
        regionSelect.addEventListener('change', applyFilters);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
      }

      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          applySort();
          applyFilters();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q');

      if (queryFromUrl && input) {
        input.value = queryFromUrl;
      }

      applySort();
      applyFilters();
    });
  }

  function setupHlsPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var source = player.getAttribute('data-video-url');
      var poster = player.getAttribute('data-poster');
      var startButton = player.querySelector('.player-start');
      var toggleButton = player.querySelector('[data-player-toggle]');
      var muteButton = player.querySelector('[data-player-mute]');
      var fullscreenButton = player.querySelector('[data-player-fullscreen]');
      var errorBox = player.querySelector('.player-error');

      if (!video || !source) {
        return;
      }

      if (poster) {
        video.setAttribute('poster', poster);
      }

      function showError(message) {
        if (errorBox) {
          errorBox.hidden = false;
          errorBox.textContent = message;
        }
        player.classList.add('is-ready');
      }

      function markReady() {
        player.classList.add('is-ready');
      }

      function togglePlay() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              showError('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
          }
        } else {
          video.pause();
        }
      }

      function updatePlayState() {
        player.classList.toggle('is-playing', !video.paused);
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            showError('网络加载异常，已尝试重新连接播放源。');
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            showError('媒体解码异常，已尝试恢复播放。');
            return;
          }

          showError('视频加载失败，请刷新页面后重试。');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', markReady, { once: true });
      } else {
        showError('当前浏览器不支持 HLS 播放，请使用支持 M3U8 的浏览器访问。');
      }

      video.addEventListener('play', updatePlayState);
      video.addEventListener('pause', updatePlayState);
      video.addEventListener('click', togglePlay);
      video.addEventListener('canplay', markReady);

      if (startButton) {
        startButton.addEventListener('click', togglePlay);
      }

      if (toggleButton) {
        toggleButton.addEventListener('click', togglePlay);
      }

      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }
    });
  }

  function setupScrollToPlayer() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        var player = document.querySelector('[data-hls-player]');
        if (!player) {
          return;
        }
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var startButton = player.querySelector('.player-start');
        if (startButton) {
          startButton.focus();
        }
      });
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupSearchForms();
    setupFilters();
    setupHlsPlayers();
    setupScrollToPlayer();
  });
})();
