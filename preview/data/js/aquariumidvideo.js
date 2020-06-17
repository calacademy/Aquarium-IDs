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

	var _onAfterLoad = function () {
		// once we know the video's dims, scale to fill
		$('.fancybox-video').on('loadedmetadata', function (e) {
			$(this).off('loadedmetadata');
			calacademy.Utils.scaleToFill($(this), $(this).parent());
		});
	}

	var _onAfterShow = function (instance, current) {
		// go to appropriate slide
		if (!isNaN(current.slideIndex)) {
			$('#main').data('flexslider').flexAnimate(current.slideIndex, true, true);
		}

		// add close button
		var close = $('<button>Close</button>');
		close.addClass('close');
		calacademy.addHighlight(close);
		
		close.on(calacademy.selectEvent, function (e) {
			$.fancybox.close();
			return false;
		});

		$('.fancybox-container').prepend(close);

		// add progress indicator
		var prog = $('<div />');
		prog.addClass('progress-indicator');
		$('.fancybox-content').prepend(prog);

		var video = $('.fancybox-video');
		_prog = new ProgressIndicator(prog, true);
		
		video.on('ended', _onVideoEnd);
		video.on('timeupdate', _onVideoProgress);
	}

	var _onMediaSelect = function (e) {
		if ($('body').hasClass('fancybox-active')) return false;

		$.fancybox.open({
			slideIndex: $(e.target).closest('li').data('slide-index'),
			src: src,
			type: 'video',
			opts: {
				video: {
					tpl: '<video class="fancybox-video" muted src="{{src}}"></video>',
					autoStart: true
				},
				animationEffect: 'fade',
				ratio: $('#main').outerWidth() / ($('#main').outerHeight() - $('nav').outerHeight()),
				afterShow: _onAfterShow,
				afterLoad: _onAfterLoad
			}
		});

		return false;
	}

	var _insertDuration = function () {
		container.find('.duration').remove();

		var dur = $('<div />');
		dur.addClass('duration');
		container.append(dur);

		var video = $('<video muted src="' + src + '" />');

		video.on('loadedmetadata', function (e) {
			$(this).off('loadedmetadata');
			dur.html(this.duration.toHHMMSS());
			$(document).trigger('durationdata');
		});
	}

	this.initialize = function () {
		container.addClass('with-video');
		calacademy.addHighlight(container);
		container.on(calacademy.selectEvent, _onMediaSelect);

		_insertDuration();	
	}

	this.initialize();	
}
