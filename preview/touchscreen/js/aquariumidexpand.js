var AquariumIDExpand = function (container, src, dims) {
	var _onAfterShow = function (instance, current) {
		// go to appropriate slide
		if (!isNaN(current.slideIndex)) {
			$('#main').data('flexslider').flexAnimate(current.slideIndex, true, true);	
		}

		// add close button
		var close = $('<button>Close</button>');
		close.addClass('close');
		
		close.on(calacademy.selectEvent, function (e) {
			$.fancybox.close();
			return false;
		});

		$('.fancybox-container').prepend(close);
	}

	var _onExpand = function (e) {
		if ($('body').hasClass('fancybox-active')) return false;

		var instance = $.fancybox.open({
			slideIndex: $(e.target).closest('li').data('slide-index'),
			src: src,
			opts: {
				afterShow: _onAfterShow
			}
		});

		return false;
	}

	this.initialize = function () {
		if (isNaN(dims.width)) return;
		if (dims.width < calacademy.Constants.expandImageWidth) return;

		container.addClass('with-expand');
		calacademy.addHighlight(container);
		container.on(calacademy.selectEvent, _onExpand);	
	}

	this.initialize();	
}
