var AquariumIDScan = function (container) {
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

	var _onScanSelect = function (e) {
		if ($('body').hasClass('fancybox-active')) return false;

		var qrDim = 250;
		
		var instance = $.fancybox.open({
			slideIndex: $(e.target).closest('li').data('slide-index'),
			type: 'html',
			src: '<div id="qrcode"></div>',
			opts: {
				animationEffect: 'zoom-in-out',
				afterShow: _onAfterShow
			}
		});

		var qrcode = new QRCode('qrcode', {
			width : qrDim * 2,
			height : qrDim * 2
		});

		qrcode.makeCode('https://google.com');

		// append text
		var p = $('<p />');
		p.html('Lorem ipsum dolor sit amet');
		$('#qrcode').append(p);

		return false;
	}

	this.initialize = function () {
		container.removeClass('with-expand');
		container.removeClass('with-video');
		container.addClass('with-scan');

		container.off();
		calacademy.addHighlight(container);
		container.on(calacademy.selectEvent, _onScanSelect);
	}

	this.initialize();	
}
