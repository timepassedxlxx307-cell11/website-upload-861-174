(function () {
    function initMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var cover = document.getElementById(options.coverId);
        var source = options.source;
        var attached = false;
        var hls = null;

        function load(startAfterLoad) {
            if (!video || !source) {
                return;
            }

            if (attached) {
                if (startAfterLoad) {
                    video.play().catch(function () {});
                }
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                if (startAfterLoad) {
                    video.play().catch(function () {});
                }
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (startAfterLoad) {
                        video.play().catch(function () {});
                    }
                });
                return;
            }

            video.src = source;
            if (startAfterLoad) {
                video.play().catch(function () {});
            }
        }

        function play(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (cover) {
                cover.classList.add('is-hidden');
            }
            load(true);
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        }
    }

    window.initMoviePlayer = initMoviePlayer;
})();
