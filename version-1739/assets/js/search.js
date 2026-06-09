(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '    <span class="poster-wrap"><img class="poster-img" src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy"></span>',
      '    <span class="badge badge-top">' + escapeHtml(movie.type) + '</span>',
      '    <span class="badge badge-bottom">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="card-tags">' + tags + '</div>',
      '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p class="line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  ready(function () {
    var form = document.querySelector('[data-global-search]');
    var input = document.querySelector('[data-global-search-input]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var movies = window.MOVIES || [];

    if (!form || !input || !results || !status) {
      return;
    }

    function render(query) {
      var q = normalize(query);
      if (!q) {
        results.innerHTML = '';
        status.textContent = '请输入关键词开始搜索。';
        return;
      }
      var matched = movies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);

      status.textContent = '找到 ' + matched.length + ' 条结果' + (matched.length >= 120 ? '，已显示前 120 条。' : '。');
      results.innerHTML = matched.map(cardTemplate).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (initialQuery) {
      input.value = initialQuery;
      render(initialQuery);
    }
  });
})();
