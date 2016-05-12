jQuery(document).ready(function ($) {
	$('.form-item, .manualcrop-style-button-holder').not('.form-item-title, .form-item-field-scientific-name-und-0-value').each(function () {
		$(this).css('opacity', '.5');
		$(this).css('pointer-events', 'none');

		var el = $('*', this);
		el.css('pointer-events', 'none');
	});

	$('html').addClass('jquery-ready');
});
