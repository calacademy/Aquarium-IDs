var AquariumIDExpand = function (container, src, dims) {
	var _onAfterClose = function () {
		$('html').removeClass('expanding');
		$('html').removeClass('closing');	
	}

	var _onBeforeClose = function () {
		$('html').addClass('closing');
	}

	var _onAfterShow = function (instance, current) {
		$('html').addClass('expanding');

		// go to appropriate slide
		if (!isNaN(current.slideIndex)) {
			$('#main').flexslider(current.slideIndex);	
		}

		// add close button
		var close = $('<button>Close</button>');
		close.addClass('close');
		
		close.on('click touchend', function (e) {
			$.fancybox.close();
			return false;
		});

		$('.fancybox-container').prepend(close);
	}

	var _onExpand = function (e) {
		if ($('body').hasClass('fancybox-active')) return false;

		$.fancybox.open({
			slideIndex: $(e.target).closest('li').data('slide-index'),
			src: src,
			opts: {
				animationEffect: 'zoom-in-out',
				gutter: 0,
				toolbar: false,
				afterShow: _onAfterShow,
				afterClose: _onAfterClose,
				beforeClose: _onBeforeClose
			}
		});

		return false;
	}

	this.initialize = function () {
		if (isNaN(dims.width)) return;

		container.addClass('with-expand');
		container.on('click touchend', _onExpand);	
	}

	this.initialize();	
}
