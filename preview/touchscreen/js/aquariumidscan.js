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
		
		var instance = $.fancybox.open({
			slideIndex: $(e.target).closest('li').data('slide-index'),
			type: 'html',
			src: '<div class="qrcode"></div>',
			opts: {
				animationEffect: 'zoom-in-out',
				afterShow: _onAfterShow
			}
		});

		_populateElement($('.qrcode'));

		return false;
	}

	var _populateElement = function (el) {
		var qrDim = 250;

		var qrcode = new QRCode(el.get(0), {
			width : qrDim * 2,
			height : qrDim * 2,
			colorLight: 'transparent'
		});

		qrcode.makeCode(data.scan_url);

		// description
		var div = _getDescription();
		if (div) el.append(div);
	}

	this.isValid = function () {
		if (typeof(data.scan_url) == 'string') {
			if (data.scan_url.isValidHttpUrl()) {
				return true;
			}
		}

		return false;
	}

	this.insert = function () {
		if (!this.isValid()) return;

		// inline
		if (parseInt($.getQueryString('qr')) == 2) {
			// inline
			var el = $('<div />');
			el.addClass('qrcode');
			el.addClass('qrcode-inline');

			var body = container.find('.body');
			el.insertAfter(body);

			_populateElement(el);
			return;
		}

		// modal
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

	this.initialize = function () {
		//
	}

	this.initialize();	
}
