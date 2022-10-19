var AquariumIDScan = function (container, data) {
	var _getDescription = function () {
		var translate = new AquariumIDTranslate();

		var div = $('<div />');
		div.addClass('translatable');
		div.html(translate.getMarkup('scan_description', data));

		if (div.find('> div').length == 0) return false;
		return div;
	}

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

		qrcode.makeCode(data.scan_url);

		// description
		var div = _getDescription();
		if (div) $('#qrcode').append(div);

		return false;
	}

	this.initialize = function () {
		// append hidden multilingual text to DOM
		var div = _getDescription();

		if (div) {
			div.addClass('hide');
			$('body').append(div);
		}

		// remove other extras
		container.removeClass('with-expand');
		container.removeClass('with-video');

		container.off();
		calacademy.addHighlight(container);
		container.on(calacademy.selectEvent, _onScanSelect);
		
		container.addClass('with-scan');
	}

	this.initialize();	
}
