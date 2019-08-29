var AquariumIDVideo = function (container, src) {
	var _prog = false;

	var _onVideoEnd = function (e) {
		$(document).trigger('videoend');
		$.fancybox.close();
	}

	var _onVideoProgress = function (e) {
		$(document).trigger('videoprogress');
		var per = this.currentTime / this.duration;
		if (_prog) _prog.update(per);
	}

	var _onAfterClose = function () {
		$('html').removeClass('video-playing');
		$('html').removeClass('closing');	
	}

	var _onBeforeClose = function () {
		$('html').addClass('closing');
	}

	var _onAfterShow = function (instance, current) {
		$('html').addClass('video-playing');

		// add close button
		var close = $('<button>Close</button>');
		close.addClass('close');
		
		close.on('click touchend', function (e) {
			$.fancybox.close();
			return false;
		});

		$('.fancybox-container').prepend(close);

		// add progress indicator
		var prog = $('<div />');
		prog.addClass('progress-indicator');
		$('.fancybox-content').prepend(prog);

		var video = $('.fancybox-content video');
		_prog = new ProgressIndicator(prog, true);
		
		video.off();
		video.on('ended', _onVideoEnd);
		video.on('timeupdate', _onVideoProgress);
	}

	var _onMediaSelect = function (e) {
		if ($('body').hasClass('fancybox-active')) return false;

		$.fancybox.open({
			src: src,
			type: 'video',
			opts: {
				gutter: 0,
				toolbar: false,
				animationEffect: 'zoom-in-out',
				video: {
					tpl: '<video class="fancybox-video" muted src="{{src}}"></video>',
					autoStart: true
				},
				afterShow: _onAfterShow,
				afterClose: _onAfterClose,
				beforeClose: _onBeforeClose
			}
		});

		return false;
	}

	this.initialize = function () {
		container.addClass('with-video');
		container.on('click touchend', _onMediaSelect);	
	}

	this.initialize();	
}
