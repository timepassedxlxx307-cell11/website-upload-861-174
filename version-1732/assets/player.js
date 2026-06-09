(function() {
    var video = document.getElementById('moviePlayer');
    var button = document.getElementById('playButton');
    var shell = document.querySelector('.player-shell');
    if (!video || !button || typeof pageStream === 'undefined') {
        return;
    }
    var ready = false;
    var hlsInstance = null;
    var attachStream = function() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = pageStream;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(pageStream);
            hlsInstance.attachMedia(video);
        } else {
            video.src = pageStream;
        }
    };
    var playVideo = function() {
        attachStream();
        if (shell) {
            shell.classList.add('is-playing');
        }
        button.classList.add('is-hidden');
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function() {});
        }
    };
    button.addEventListener('click', playVideo);
    video.addEventListener('click', function() {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener('pause', function() {
        if (video.currentTime === 0 && shell) {
            shell.classList.remove('is-playing');
        }
    });
    window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
