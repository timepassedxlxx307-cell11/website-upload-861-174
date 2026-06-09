function bindPlayer(sourceUrl) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector("[data-play-cover]");
  var attached = false;
  var hlsInstance = null;

  if (!video || !sourceUrl) {
    return;
  }

  function start() {
    if (!attached) {
      attached = true;

      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (!attached) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
