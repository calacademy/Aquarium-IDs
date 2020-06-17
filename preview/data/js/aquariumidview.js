var AquariumIDView = function (translate) {
	var _displayMode = '';
	var _thumbsPerPage = 8;
	var _tankTitles = false;
	var _fileUri = false;
	var _translate = translate;
	var _inst = this;

	var _fields = [
		'field_exhibit_or_theme',
		'title',
		'field_scientific_name',
		'body',
		'field_diet',
		'field_distribution',
		'field_tagline',
		'field_source'
	];

	var _fieldsTranslate = [
		'title',
		'body',
		'field_diet',
		'field_distribution',
		'field_tagline',
		'field_source'
	];

	var _getImgSrc = function (src) {
		return _inst.getImgSrc(src);
	}

	var _getContainer = function () {
		var container = $('<div />');
		container.addClass('container');
		return container;
	}

	var _getImageData = function (obj, crop) {
		if (typeof(crop) == 'undefined') crop = false;
		var field = crop ? obj.field_image_square_crop : obj.field_image;

		if (!field) return false;

		var imgData;

		if (calacademy.Utils.isArray(field)) {
			// @todo
			// we have multiples, which image should we use? just using the first for now.
			imgData = field[0];
		} else {
			imgData = field;
		}

		if (typeof(obj.imgwidth) == 'string') {
			imgData.width = parseInt(obj.imgwidth);
		}
		if (typeof(obj.imgheight) == 'string') {
			imgData.height = parseInt(obj.imgheight);
		}

		if (!imgData) return false;
		if (typeof(imgData) == 'string' && imgData.indexOf('http') >= 0) return imgData;
		if (typeof(imgData.src) != 'string') return false;

		return imgData;
	}

	var _getImageElement = function (obj) {
		var imgData = _getImageData(obj);
		if (!imgData) return false;

		// create container
		var container = $('<div />');
		container.addClass('img-container');

		// add image
		var img = $('<div />');
		img.addClass('img');

		var imgSrc = false;

		if (typeof(imgData) == 'string') {
			// in case the views datasource module hasn't been patched
			imgSrc = _getImgSrc(imgData);
		} else {
			imgSrc = _getImgSrc(imgData.src);
		}

		if (!imgSrc) return container;
		img.css('background-image', 'url("' + imgSrc + '")');
		
		container.append(img);

		// add caption
		if (typeof(imgData.cap) == 'string') {
			if ($.trim(imgData.cap) != '') {
				var cap = $('<div />');
				cap.addClass('cap');
				cap.html(imgData.cap);

				container.append(cap);
			}
		}

		var extra = null;

		if (obj.video) {
			extra = new AquariumIDVideo(img, _getImgSrc(obj.video));
		} else {
			if (typeof(obj.image_raw[0].src) == 'string') {
				extra = new AquariumIDExpand(img, _getImgSrc(obj.image_raw[0].src), {
					width: parseInt(obj.imgwidth),
					height: parseInt(obj.imgheight)
				});
			}
		}

		return container;
	}

	var _addPhotoSensitiveSlide = function (ul) {
		var psSlide = $('<li />');
		psSlide.addClass('photosensitive');
		psSlide.html(_getContainer());

		$('.container', psSlide).html($('#photosensitive').html());

		ul.prepend(psSlide);
	}

	var _addTitleSlide = function (ul) {
		if (!_tankTitles) return;

		var container = _getContainer();
		var titleSlide = $('<li />');
		titleSlide.addClass('title-slide');
		titleSlide.html(container);

		var obj = $('html').data('theme');
		container.append('<h1 class="translatable">' + _translate.getMarkup('name', obj) + '</h1>');

		if (_tankTitles.child != '') {
			var childObj = $('html').data('child-theme');

			if (childObj.name != obj.name) {
				container.append('<h2 class="translatable">' + _translate.getMarkup('name', childObj) + '</h2>');
			}
		}

		ul.prepend(titleSlide);
	}

	this.getImgSrc = function (src) {
		if (calacademy.isLocal && typeof(_fileUri) == 'string') {
			return src.replace(_fileUri, calacademy.Constants.localAssetPath);
		}

		return src;
	}

	this.setFileUri = function (uri) {
		_fileUri = uri;
	}

	this.getTankTitle = function () {
		return $('<h1>' + _tankTitles.parent + '</h1>');
	}

	this.getTaxaMenu = function (arr, selected) {
		var ul = $('<ul class="taxa-menu" />');

		$.each(arr, function (i, val) {
			var li = $('<li><a href="#">' + val + '</a></li>');

			if (val == selected) {
				li.addClass('selected');
			}

			ul.append(li);
		});

		return ul;
	}

	this.getTaxaSlideshow = function (taxaInTank, taxaImages) {
		if (!calacademy.Utils.isArray(taxaImages)) taxaImages = [];

		var ul = $('<ul />');
		ul.addClass('slides');

		$.each(taxaInTank, function (i, val) {
			var src = false;

			// match rep img to taxon
			$.each(taxaImages, function (j, img) {
				if (img.taxon == val) {
					src = img.src;
					return false;
				}
			});

			var li = $('<li />');
			li.append('<h2>' + _tankTitles.parent + '</h2>');
			li.append('<h1 class="taxon">' + val + '</h1>');

			if (src) {
				li.css('background-image', 'url("' + _getImgSrc(src) + '")');
			} else {
				// fallback
				li.css('background-image', 'url("images/fallback-taxon.jpg")');
			}

			ul.append(li);
		});

		return ul;
	}

	this.getThumbnailSlideshow = function (data) {
		var ul = $('<ul />');
		ul.addClass('slides');

		var j = 0;
		var li = $('<li />');
		
		$.each(data, function (i, obj) {
			var imgData = _getImageData(obj, true);
			var src = (typeof(imgData) == 'string') ? imgData : imgData.src;
			if (typeof(src) == 'undefined') return;

			var div = $('<div />');
			div.data('thumbnail-index', i);
			div.addClass('thumbnail');
			div.css('background-image', 'url("' + _getImgSrc(src) + '")');
			div.html('<div class="inner">&nbsp;</div>');

			li.append(div);

			if ((j + 1) % _thumbsPerPage == 0) {
				// add slide
				ul.append(li);

				// start a new slide
				li = $('<li />');
			}

			j++;
		});

		// add the last one
		if (!li.is(':empty')) {
			ul.append(li);
		}

		ul.data('total-thumb-slides', $('li', ul).length);
		return ul;
	}

	this.getThumbPageForSpecimen = function (index) {
		return Math.ceil((index + 1) / _thumbsPerPage);
	}

	this.getMainSlideshow = function (data, withTitle, isPhotoSensitive) {
		if (typeof(withTitle) == 'undefined') withTitle = true;
		if (typeof(isPhotoSensitive) == 'undefined') isPhotoSensitive = false;

		var ul = $('<ul />');
		ul.data('total-specimens', data.length);
		ul.addClass('slides');

		var i = 0;

		while (i < data.length) {
			var obj = data[i];

			// create slide
			var container = _getContainer();
			var li = $('<li />');
			li.data('specimen-index', i + 1);
			li.addClass('specimen');
			li.html(container);

			var col = $('<div />');
			col.addClass('column');
			container.html(col);

			// iterate all relevant fields
			var j = 0;

			while (j < _fields.length) {
				var field = _fields[j];
				var val = obj[field];

				// reset this field to the parent term per spec
				if (field == 'field_exhibit_or_theme' && _tankTitles != false) {
					val = _tankTitles.parent;
				}

				if (typeof(val) == 'string') {
					if ($.trim(val) != '') {
						// if a string and not empty, append a div
						var div = $('<div />');
						div.addClass(field);

						if ($.inArray(field, _fieldsTranslate) !== -1) {
							div.addClass('translatable');
							div.html(_translate.getMarkup(field, obj));	
						} else {
							div.html($.trim(val));
						}

						switch (field) {
							case 'field_diet':
								div.find('.en').prepend('<em>Diet: </em>');
								div.find('.cn').prepend('<em>食物: </em>');
								div.find('.tl').prepend('<em>Diyeta: </em>');
								div.find('.es').prepend('<em>Alimentación: </em>');
								break;
							case 'field_distribution':
								div.find('.en').prepend('<em>Distribution: </em>');
								div.find('.cn').prepend('<em>分佈: </em>');
								div.find('.tl').prepend('<em>Distribusyon: </em>');
								div.find('.es').prepend('<em>Distribución: </em>');
								break;
						}

						col.append(div);
					}
				}

				j++;
			}

			// add image if we have one
			var imageEl = _getImageElement(obj);

			// Source or Tagline will appear on the front-end, not both!
			// If both fields contain content, Tagline supersedes.
			if ($('.field_tagline', container).length == 1 && $('.field_source', container).length == 1) {
				$('.field_source', container).addClass('hide');
			}

			// rearrange some elements
			var colBottom = $('<div />');
			colBottom.addClass('column-bottom');
			col.find('.field_scientific_name').after(colBottom);

			var special = container.find('.field_tagline, .field_source');
			colBottom.append(special);

			if (imageEl != false) {
				colBottom.append(imageEl);
			}

			var col2 = $('<div />');
			col2.addClass('column');
			container.append(col2);

			var colBottom2 = $('<div />');
			colBottom2.addClass('column-bottom');
			container.find('.field_diet, .field_distribution').appendTo(colBottom2);
			
			container.find('.body').appendTo(col2);
			col2.append(colBottom2);

			// add slide to slideshow
			ul.append(li);

			i++;
		}

		// add photosensitive slide if necessary
		if (isPhotoSensitive) {
			_addPhotoSensitiveSlide(ul);
		}

		// add title slide
		if (withTitle) {
			_addTitleSlide(ul);
		}

		// remove empty paragraphs
		$('p', ul).each(function () {
			if ($.trim($(this).text()) == '') {
				$(this).remove();
			}
		});

		var i = 0;

		ul.children('li').each(function () {
			$(this).data('slide-index', i);
			i++;
		});

		return ul;
	}

	this.getPageIndicator = function () {
		return $('<div class="page" />');
	}

	this.getEbuSlides = function (data, tid) {
		if (typeof(data) != 'object') data = calacademy.Constants.fallbackEbuImages;
		if (typeof(tid) != 'number') tid = calacademy.Constants.fallbackTheme;

		this.setTankTheme(tid, false);

		var slides = $('<ul />');
		slides.addClass('slides');

		$.each(data, function (i, val) {
			var li = $('<li />');

			li.css('background-image', 'url("' + _getImgSrc(val.src) + '")');
			li.append('<h2>' + calacademy.Constants.ebuMsg + '</h2>');

			if (typeof(val.cap) == 'string') {
				li.append('<div class="cap">' + val.cap + '</div>');
			}

			slides.append(li);
		});

		return slides;
	}

	this.getGridButton = function () {
		var div = $('<div />');
		div.addClass('grid');
		div.html('Back');

		return div;
	}

	this.setDisplayMode = function (str) {
		_displayMode = str;
		$('html').addClass(_displayMode);
	}

	this.removeDisplayMode = function () {
		if (_displayMode == '') return;
		$('html').removeClass(_displayMode);
	}

	this.setTankTheme = function (theme, parentTheme) {
		// remove other theme classes
		var classList = $('html').attr('class').split(/\s+/);

		$.each(classList, function (i, val) {
			if (val.indexOf('theme-') == 0) {
				$('html').removeClass(val);
			}
		});

		// add new one
		if (parentTheme !== false) {
			$('html').data('theme', parentTheme);
			$('html').data('child-theme', theme);
			$('html').addClass('theme-' + parentTheme.tid);
		} else {
			$('html').data('theme', theme);
			$('html').addClass('theme-' + theme.tid);
		}
	}

	this.setTankTitles = function (myParent, myChild) {
		_tankTitles = {
			parent: myParent,
			child: myChild
		};

		var obj = $('html').data('theme');
		$('#title').addClass('translatable');
		$('#title').html(_translate.getMarkup('name', obj));
	}

	var _onAfterClose = function () {
		$('html').removeClass('closing');	
	}

	var _onBeforeClose = function () {
		$('.fancybox-video').off();
		$('#main').data('flexslider').animating = false;
		$('html').addClass('closing');
	}

	var _setModalDefaults = function () {
		if (!$.fancybox) return;

		$.fancybox.defaults.closeExisting = true;
		$.fancybox.defaults.gutter = 0;
		$.fancybox.defaults.idleTime = false;
		$.fancybox.defaults.toolbar = false;
		$.fancybox.defaults.afterClose = _onAfterClose;
		$.fancybox.defaults.beforeClose = _onBeforeClose;
	}

	this.initialize = function () {
		calacademy.Utils.log('AquariumIDView.initialize');
		_setModalDefaults();
	}

	this.initialize();
}
