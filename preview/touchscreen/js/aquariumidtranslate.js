var AquariumIdTranslate = function () {
	var _setLanguage = function (lg) {
		$('#languages li').removeClass('active');
		$('#languages li').removeClass('highlight');
		
		$('#' + lg).addClass('active');
		$('html').attr('lang', lg);
	}

	var _onLgSelect = function (e) {
		$(document).idleTimer('reset');
		_setLanguage($(this).attr('id'));

		return false;
	}

	this.reset = function () {
		_setLanguage('en');
	}

	this.initialize = function () {
		calacademy.addHighlight($('#languages li'));
		$('#languages li').on(calacademy.selectEvent, _onLgSelect);
	}

	this.initialize();
}
