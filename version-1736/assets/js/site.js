(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    start();
  }

  function initPageFilter() {
    var input = qs('[data-page-filter]');
    var typeFilter = qs('[data-type-filter]');
    var eraFilter = qs('[data-era-filter]');
    var cards = qsa('[data-movie-card]');
    if (!cards.length || (!input && !typeFilter && !eraFilter)) {
      return;
    }
    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(typeFilter && typeFilter.value);
      var eraValue = Number((eraFilter && eraFilter.value) || 0);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var typeOk = !typeValue || text.indexOf(typeValue) !== -1;
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        var year = Number(card.getAttribute('data-year') || 0);
        var eraOk = !eraValue || (eraValue === 1990 ? year < 2000 : year >= eraValue);
        card.classList.toggle('is-hidden', !(keywordOk && typeOk && eraOk));
      });
    }
    [input, typeFilter, eraFilter].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
  }

  function createSearchCard(movie) {
    var card = document.createElement('article');
    card.className = 'search-card';
    var img = document.createElement('img');
    img.src = './' + movie.cover;
    img.alt = movie.title;
    img.loading = 'lazy';
    img.onerror = function () {
      img.style.opacity = '0';
    };
    var body = document.createElement('div');
    var title = document.createElement('h2');
    var link = document.createElement('a');
    link.href = movie.url;
    link.textContent = movie.title;
    title.appendChild(link);
    var meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.innerHTML = '<span>' + movie.region + '</span><span>' + movie.type + '</span><span>' + movie.year + '</span>';
    var text = document.createElement('p');
    text.textContent = movie.oneLine;
    var tags = document.createElement('div');
    tags.className = 'tag-row';
    (movie.tags || []).slice(0, 4).forEach(function (tag) {
      var item = document.createElement('span');
      item.textContent = tag;
      tags.appendChild(item);
    });
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(text);
    body.appendChild(tags);
    card.appendChild(img);
    card.appendChild(body);
    return card;
  }

  function initSearchPage() {
    var form = qs('[data-search-page-form]');
    var results = qs('[data-search-results]');
    if (!form || !results || !window.siteMovieIndex) {
      return;
    }
    var input = qs('input[name="q"]', form);
    function render(query) {
      var keyword = normalize(query);
      results.innerHTML = '';
      if (!keyword) {
        return;
      }
      var matched = window.siteMovieIndex.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 80);
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = '没有找到匹配影片，可以尝试更换关键词。';
        results.appendChild(empty);
        return;
      }
      matched.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
      var url = new URL(window.location.href);
      url.searchParams.set('q', input.value);
      window.history.replaceState(null, '', url.toString());
    });
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
      render(initial);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initPageFilter();
    initSearchPage();
  });
})();
