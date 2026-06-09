(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".mobile-toggle");

    if (header && toggle) {
      toggle.addEventListener("click", function () {
        header.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (slides.length) {
      setSlide(0);
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          setSlide(dotIndex);
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(current - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          setSlide(current + 1);
        });
      }
      window.setInterval(function () {
        setSlide(current + 1);
      }, 6200);
    }

    Array.prototype.slice.call(document.querySelectorAll(".site-search-form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "search.html";
        }
      });
    });

    var filterInput = document.querySelector("[data-filter-input]");
    var filterType = document.querySelector("[data-filter-type]");
    var filterRegion = document.querySelector("[data-filter-region]");
    var filterYear = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }

      var term = normalize(filterInput && filterInput.value);
      var type = normalize(filterType && filterType.value);
      var region = normalize(filterRegion && filterRegion.value);
      var year = normalize(filterYear && filterYear.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-genre"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (term && text.indexOf(term) === -1) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [filterInput, filterType, filterRegion, filterYear].forEach(function (item) {
      if (item) {
        item.addEventListener("input", applyFilter);
        item.addEventListener("change", applyFilter);
      }
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]")).forEach(function (button) {
      button.addEventListener("click", function () {
        if (filterInput) {
          filterInput.value = button.getAttribute("data-filter-chip") || "";
          applyFilter();
        }
      });
    });

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        filterInput.value = q;
      }
      applyFilter();
    }
  });
})();
