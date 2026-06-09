(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initMobileNavigation() {
    var toggle = document.querySelector('.mobile-nav-toggle');
    var nav = document.querySelector('.mobile-nav');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    show(0);
    start();
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll('.movie-thumb img, .related-thumb img, .rank-cover img, .hero-slide img');

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var holder = image.parentElement;
        if (holder) {
          holder.classList.add('image-missing');
        }
      }, { once: true });
    });
  }

  function initFilters() {
    var panels = document.querySelectorAll('[data-filter-area]');

    panels.forEach(function (panel) {
      var container = panel.parentElement || document;
      var input = panel.querySelector('[data-filter-input]');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
      var reset = panel.querySelector('[data-filter-reset]');
      var counter = panel.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(container.querySelectorAll('[data-search]'));
      var empty = container.querySelector('[data-empty-result]');

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilters() {
        var query = normalize(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var matched = true;
          var search = normalize(card.getAttribute('data-search'));

          if (query && search.indexOf(query) === -1) {
            matched = false;
          }

          selects.forEach(function (select) {
            var key = select.getAttribute('data-filter-select');
            var selected = normalize(select.value);
            var cardValue = normalize(card.getAttribute('data-' + key));

            if (selected && cardValue !== selected) {
              matched = false;
            }
          });

          card.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = String(visible);
        }

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilters);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          selects.forEach(function (select) {
            select.value = '';
          });
          applyFilters();
        });
      }

      applyFilters();
    });
  }

  function initPlayers() {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-play');
      var box = player.querySelector('.player-box');
      var message = player.querySelector('.player-message');
      var source = player.getAttribute('data-src');
      var hls = null;
      var loaded = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function attachSource() {
        if (loaded || !video || !source) {
          return;
        }

        loaded = true;
        video.controls = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('播放源已就绪，正在开始播放。');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setMessage('网络加载波动，播放器正在重新连接。');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setMessage('媒体解码波动，播放器正在恢复。');
              hls.recoverMediaError();
            } else {
              setMessage('播放源暂时无法加载，请刷新页面后重试。');
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setMessage('使用浏览器原生 HLS 播放。');
        } else {
          video.src = source;
          setMessage('正在尝试直接加载播放源。');
        }
      }

      function playVideo() {
        attachSource();

        if (!video) {
          return;
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          if (box) {
            box.classList.add('is-playing');
          }
        });

        video.addEventListener('pause', function () {
          if (box) {
            box.classList.remove('is-playing');
          }
        });

        video.addEventListener('ended', function () {
          if (box) {
            box.classList.remove('is-playing');
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileNavigation();
    initHeroCarousel();
    initImageFallbacks();
    initFilters();
    initPlayers();
  });
})();
