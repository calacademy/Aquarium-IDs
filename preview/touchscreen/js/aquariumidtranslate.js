var AquariumIdTranslate = function () {
	var _langs = ['tl', 'es', 'cn'];

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

	var _getLangElement = function (lg, val) {
		if (!val) return false;
		if ($.trim(val) == '') return false;

		var container = $('<div />');
		container.addClass(lg);
		container.html($.trim(val));

		return container;
	}

	this.prune = function () {
		// remove any missing languages from the translate UI
		$('.translatable').each(function () {
			var field = $(this);

			$.each(_langs, function (i, lg) {
				if (field.find('.' + lg).length == 0) {
					$('#languages #' + lg).remove();
				}
			});
		});

		// if English-only, remove UI entirely
		if ($('#languages li').length == 1) {
			$('#languages').remove();
		}
	}

	this.getMarkup = function (field, obj) {
		var container = $('<div />');

		// presume we have English
		container.append(_getLangElement('en', obj[field]));

		$.each(_langs, function (i, lang) {
			var el = _getLangElement(lang, obj[field + '_' + lang]);
			if (el !== false) container.append(el);
		});

		return container.html();
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
