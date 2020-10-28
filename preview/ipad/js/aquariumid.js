var AquariumID = function () {
	var _data;
	var _view;
	var _vocab;
	var _tankContents;
	var _filteredTankContents;
	var _dotTimeout;
	var _tank = false;

	var _idleTime = 30000;
	var _slideshowSpeed = 8000;
	var _slideshowSpeedNonSpecimen = 3000;
	var _ebuSlideshowSpeed = 7000;

	var _isTankPhotoSensitive = false;
	var _taxaImages;
	var _taxaInTank;
	var _selectedTaxon;

	var _isBig = false;
	var _activeSlideshow;
	var _timeoutDisableLinks;
	var _frameAnimation;

	var _setIdleTimer = function () {
		if ($('html').hasClass('no-idle')) return;

		$(document).off('idle.idleTimer');
		$(document).off('active.idleTimer');
		$(document).idleTimer('destroy');

		$(document).idleTimer({
			timeout: (_idleTime - _slideshowSpeed)
		});

		$(document).on('idle.idleTimer', function (event, elem, obj) {
			calacademy.Utils.log('idle / ' + Math.random());

			if (_isBig) {
				// init the splash slideshow
				var splash = _view.getTaxaSlideshow(_taxaInTank, _taxaImages);
				_initSplashSlideshow(splash);
			} else {
				// autoplay
				if (_activeSlideshow) {
	    			_activeSlideshow.flexslider('play');
	    		}	
			}
    	});

	    $(document).on('active.idleTimer', function (event, elem, obj, triggerevent) {
	    	if (_activeSlideshow) {
	    		var id = _activeSlideshow.attr('id');
	    		
	    		// let user control except the ones that should autoplay
	    		if (id == 'main' || id == 'thumbnails') {
	    			_activeSlideshow.flexslider('pause');
	    		}
	    	}
	    });
	}

	var _transition = function (sel) {
		$('.flexslider').not(sel).addClass('hide');
		$('.flexslider').not(sel).removeClass('active');

		$(sel).removeClass('hide');
		$(sel).addClass('active');
	}

	var _exhibitBeingUpdated = function () {
		$('#main, #photosensitive, #splash').remove();
		_transition('#updated');

		if (isNaN(parseInt(_tank.exhibit_theme_tid))) {
			// fallback EBU slides
			$('#updated').append(_view.getEbuSlides());
		} else {
			// themed EBU slides
			var tid = parseInt(_tank.exhibit_theme_tid);
			var data = false;

			$.each(_vocab, function (i, val) {
				// match EBU images to data
				if (parseInt(val.tid) == tid) {
					// validate EBU images
					var imgArr = false;

					if (calacademy.Utils.isArray(val.ebu_images)) {
						imgArr = val.ebu_images;
					} else if (calacademy.Utils.isArray(val.parent_ebu_images)) {
						imgArr = val.parent_ebu_images;
					} else {
						return false;
					}

					var isValid = true;
					var j = imgArr.length;

					while (j--) {
						var obj = imgArr[j];

						if (typeof(obj.src) == 'undefined') {
							isValid = false;
							break;
						}
					}

					if (isValid) data = imgArr;
					return false;
				}
			});

			// can't find images, use fallback theme
			if (!data) tid = false;
			$('#updated').append(_view.getEbuSlides(data, tid));
		}

		$('#updated').flexslider({
			animationLoop: true,
			animation: 'fade',
			controlNav: false,
			directionNav: false,
			touch: false,
			animationSpeed: 1200,
			slideshowSpeed: _ebuSlideshowSpeed
		});

		_activeSlideshow = $('#updated');
	}

	var _setViewThemeValues = function (tank) {
		if (!calacademy.Utils.isArray(_vocab)) return;
		if (typeof(tank.exhibit_theme_tid) != 'string') return;

		var tid = tank.exhibit_theme_tid;

		// defaults
		var derivedTid = tid;
		var derivedParent = tank.field_exhibit_or_theme;
		var derivedChild = '';

		// find parent if one exists
		var i = _vocab.length;

		while (i--) {
			var obj = _vocab[i];
			var parentId = false;

			if (obj.tid == tid) {
				if (typeof(obj.parent_tid) == 'string') {
					if (obj.parent_tid == '0') {
						// no parent term
						derivedParent = obj.name;
					} else {
						// has a parent
						derivedParent = obj.parent_name;
						derivedChild = tank.field_exhibit_or_theme;
						derivedTid = obj.parent_tid;
						parentId = obj.parent_tid;
					}
				}

				// if the theme has taxa images use it
				if (calacademy.Utils.isArray(obj.field_taxa_images)) {
					_taxaImages = obj.field_taxa_images;
				}

				if (parentId) {
					$.each(_vocab, function (j, val) {
						if (val.tid == parentId) {
							if (calacademy.Utils.isArray(val.field_taxa_images)) {
								if (_taxaImages) {
									// append
									$.each(val.field_taxa_images, function (k, img) {
										_taxaImages.push(img);
									});
								} else {
									_taxaImages = val.field_taxa_images;
								}
							}
						}
					});
				}

				break;
			}
		}

		calacademy.Utils.log('_taxaImages:');
		calacademy.Utils.log(_taxaImages);

		_tankTitle = derivedParent;
		_view.setTankTheme(derivedTid);
		_view.setTankTitles(derivedParent, derivedChild);

		if (typeof(tank.display_mode) == 'string') {
			_view.setDisplayMode(tank.display_mode);
			_isBig = (tank.display_mode == 'aquarium-ipad-large');	
		}
	}

	var _hackSliderArrows = function () {
		$('.flex-prev').each(function () {
			var img = $('<img />');
			img.attr('src', 'images/arrow-left@2x.png');
			$(this).html(img);
		});

		$('.flex-next').each(function () {
			var div = $('<div />');
			div.html($(this).html());
			$(this).html(div);

			var inst = $(this);

			var _addArrowImg = function () {
				var img = $('<img />');
				img.attr('src', 'images/arrow-right@2x.png');
				inst.prepend(img);
			}

			_addArrowImg();
			_addArrowImg();
			_addArrowImg();
		});
	}

	var _onDataError = function () {
		calacademy.Utils.log('_onDataError');

		// pretend the exhibit is being updated
		_exhibitBeingUpdated();
	}

	var _onVocabularyData = function (data) {
		calacademy.Utils.log('_onVocabularyData');
		_vocab = data;

		// convert taxa images html into objects
		$.each(_vocab, function (i, val) {
			if (typeof(val.field_taxa_images) == 'string') {
				var container = $('<div />');
				container.html(val.field_taxa_images);
				val.field_taxa_images = [];

				$('.entity', container).each(function () {
					val.field_taxa_images.push({
						'taxon': $.trim($('.field-name-field-taxon', this).text()),
						'src': $('img', this).attr('src')
					});
				});
			}
		});

		calacademy.Utils.log(data);
		_data.getTanks(_onTankData, _onDataError);
	}

	var _setFilteredTankContents = function () {
		_filteredTankContents = [];

		// filter on taxon
		$.each(_tankContents, function (i, val) {
			if (val.field_taxon == _selectedTaxon) {
				_filteredTankContents.push(val);
			}
		});
	}

	var _onGridSelect = function (e) {
		_initThumbnailSlideshow(true);
		return false;
	}

	var _onTaxaSelect = function (e) {
		if ($(this).parents('#thumbnails').length == 1) {
			// from thumbnail menu
			if ($(this).parent().hasClass('selected')) {
				return false;
			}

			_selectedTaxon = $.trim($(this).text());	
		} else {
			// from splash slide
			_selectedTaxon = $.trim($('.taxon', this).text());	
		}
		
		_setFilteredTankContents();
		_initThumbnailSlideshow();

		return false;
	}

	var _onThumbnailTouchStart = function (e) {
		this.startTime = (new Date()).getTime();
		this.startX = e.originalEvent.changedTouches[0].pageX;
	}

	var _onThumbnailSelect = function (e) {
		var slideshow = _view.getMainSlideshow(_filteredTankContents, false, _isTankPhotoSensitive);
		var numThumbSlides = $('#thumbnails .slides').data('total-thumb-slides');

		// suppress select if swipping
		if (Modernizr.touch && numThumbSlides > 1) {
			var endX = e.originalEvent.changedTouches[0].pageX;
			var posDiff = Math.abs(endX - this.startX);
			
			var endTime = (new Date()).getTime();
			var durDiff = endTime - this.startTime;

			if (posDiff > 30) return;
		}

		_fixAutoAdvanceBug();

		var startAt = $(this).data('thumbnail-index');

		// offset initial slide by one if there's a photosensitive slide
		if ($('.photosensitive', slideshow).length > 0) startAt++;

		_initMainSlideshow(slideshow, startAt);
	}

	/**
	* Bug fix for main slideshows auto-advancing on touch devices
	*
	* @see
	* https://bizapp.atlassian.net/browse/WEB-1341
	*/
	var _fixAutoAdvanceBug = function () {
		if (!Modernizr.touch) return;

		$('body').addClass('disable-links');

		clearTimeout(_timeoutDisableLinks);
		
		_timeoutDisableLinks = setTimeout(function () {
			$('body').removeClass('disable-links');
		}, 500);
	}

	var _initThumbnailSlideshow = function (fromGrid) {
		if (typeof(fromGrid) == 'undefined') fromGrid = false;

		var slideshow = _view.getThumbnailSlideshow(_filteredTankContents);

		if (Modernizr.touch) {
			$('.thumbnail', slideshow).on('touchstart', _onThumbnailTouchStart);
			$('.thumbnail', slideshow).on('touchend', _onThumbnailSelect);
		} else {
			$('.thumbnail', slideshow).on('click', _onThumbnailSelect);
		}

		// setup slideshow
		if ($('#thumbnails').data('flexslider')) {
			$('#thumbnails').flexslider('destroy');
		}

		$('#thumbnails').html(slideshow);

		var _updatePageIndicator = function (slider) {
			// populate the page indicator
			var i = slider.animatingTo + 1;
			$('#thumbnails .page').html(i + ' of ' + slider.count);
		}

		// if coming from the specimen slideshow, start at
		// corresponding thumbnail page
		var startThumbsAt = 0;

		if (fromGrid) {
			// @todo
			var c = $('#main').data('flexslider').currentSlide;
			startThumbsAt = _view.getThumbPageForSpecimen(c) - 1;
		}

		$('#thumbnails').flexslider({
			slideshow: false,
			animationLoop: true,
			animation: 'slide',
			controlNav: false,
			startAt: startThumbsAt,
			directionNav: ($('#thumbnails .slides > li').length > 1),
			slideshowSpeed: _slideshowSpeed,
			start: _updatePageIndicator,
			before: _updatePageIndicator
		});

		_hackSliderArrows();

		// add theme title
		$('#thumbnails').prepend(_view.getTankTitle());

		// add taxa select menu
		var taxaMenu = _view.getTaxaMenu(_taxaInTank, _selectedTaxon);
		_initTaxaMenu(taxaMenu);
		$('#thumbnails').append(taxaMenu);

		// add page indicator
		$('#thumbnails').append(_view.getPageIndicator());

		_transition('#thumbnails');
		_activeSlideshow = $('#thumbnails');
		
		// respond to idle events
		_setIdleTimer();
	}

	var _initTaxaMenu = function (container) {
		var myEvent = Modernizr.touch ? 'touchend' : 'click';
		$('a', container).on(myEvent, _onTaxaSelect);
	}

	var _initSplashSlideshow = function (slideshow) {
		// listen for selection
		var myEvent = Modernizr.touch ? 'touchend' : 'click';
		$('li', slideshow).on(myEvent, _onTaxaSelect);

		// setup slideshow
		if ($('#splash').data('flexslider')) {
			$('#splash').flexslider('destroy');
		}

		$('#splash').html(slideshow);

		$('#splash').flexslider({
			animationLoop: true,
			animation: 'fade',
			controlNav: false,
			directionNav: false,
			touch: false,
			animationSpeed: 1200,
			slideshowSpeed: _ebuSlideshowSpeed
		});

		_hackSliderArrows();
		_transition('#splash');

		// destroy idle timer
		_activeSlideshow = $('#splash');
		$(document).idleTimer('destroy');
	}

	var _initMainSlideshow = function (slideshow, initialSlide) {
		if (typeof(initialSlide) == 'undefined') initialSlide = 0;

		if ($('#main').data('flexslider')) {
			$('#main').flexslider('destroy');
		}

		$('#main').html(slideshow);

		// add UI to go back to thumbnails
		if (_isBig) {
			var grid = _view.getGridButton();
			var myEvent = Modernizr.touch ? 'touchend' : 'click';
			grid.on(myEvent, _onGridSelect);
			$('#main').append(grid);
		}

		if ($('#main .slides > li').eq(initialSlide).hasClass('specimen')) {
			$('html').addClass('on-specimen-slide');
		} else {
			$('html').removeClass('on-specimen-slide');
		}

		var _updatePageIndicator = function (slider) {
			// populate the page indicator
			var li = slider.slides.eq(slider.animatingTo);

			var currentPage = isNaN(li.data('specimen-index')) ? 1 : li.data('specimen-index');
			$('#main .page').html(currentPage + ' of ' + $('#main ul').data('total-specimens'));
		}

		var _alterSpeed = function (slider) {
			if (!$(document).idleTimer('isIdle')) return;

			var li = slider.slides.eq(slider.animatingTo);
			slider.stop();

			if (li.hasClass('specimen')) {
				slider.vars.slideshowSpeed = _slideshowSpeed;
			} else {
				slider.vars.slideshowSpeed = _slideshowSpeedNonSpecimen;
			}

			slider.play();
		}

		$('#main').flexslider({
			startAt: initialSlide,
			slideshow: false,
			animationLoop: true,
			animation: 'slide',
			controlNav: false,
			directionNav: ($('#main .slides > li').length > 1),
			nextText: 'Swipe',
			slideshowSpeed: _slideshowSpeed,
			start: function (slider) {
				_alterSpeed(slider);
				_updatePageIndicator(slider);
			},
			before: function (slider) {
				_alterSpeed(slider);
				
				// add a class so we can alter the presentation
				var nextSlide = slider.slides.eq(slider.animatingTo);

				if (nextSlide.hasClass('specimen')) {
					_updatePageIndicator(slider);
					$('html').addClass('on-specimen-slide');
				} else {
					$('html').removeClass('on-specimen-slide');
				}
			}
		});

		_hackSliderArrows();
		_view.onSlideshowAdded();

		// add page indicator
		$('#main').append(_view.getPageIndicator());

		_transition('#main');
		_truncate();
		_activeSlideshow = $('#main');
		_setIdleTimer();
	}

	var _truncate = function () {
		if (typeof($.fn.dotdotdot) != 'function') return;

		clearTimeout(_dotTimeout);

		_dotTimeout = setTimeout(function () {
			$('#main .body_1').dotdotdot({
				height: 210
			});

			$('#main .body_1').each(function () {
				var h = $(this).outerHeight(true);

				if (h > 200) {
					// truncate diet and dist fields if body longer than three lines
					$(this).siblings('.field_diet, .field_distribution').dotdotdot({
						height: 40
					});
				} else if (h > 150) {
					// if body three lines, just truncate distribution
					// if diet longer than one line
					var dietHeight = $(this).siblings('.field_diet').outerHeight(true);

					if (dietHeight > 40) {
						$(this).siblings('.field_distribution').dotdotdot({
							height: 40
						});	
					}
				}
			});			
		}, 100);
	}

	var _iterateTankContents = function () {
		// temp arr for sorting taxa by weight
		var tempTaxa = [];
		_taxaInTank = [];

		$.each(_tankContents, function (i, spec) {
			// photosensitive
			if (typeof(spec.field_photosensitive_flag) == 'string') {
				if (spec.field_photosensitive_flag == '1') {
					_isTankPhotoSensitive = true;
				}
			}

			// taxa
			var val = spec.field_taxon;
			var weight = parseInt(spec.taxon_weight);
			
			if (isNaN(weight)) return;
			if (typeof(val) != 'string') return;
			
			if ($.inArray(val, tempTaxa) == -1) {
				tempTaxa[weight] = val;	
			}
		});

		$.each(tempTaxa, function (i, val) {
			if (typeof(val) == 'string') {
				_taxaInTank.push(val);
			}
		});
	}

	var _onTankContentsData = function (data) {
		calacademy.Utils.log('_onTankContentsData');
		calacademy.Utils.log('total specimens: ' + data.length);
		calacademy.Utils.log(data);

		_tankContents = data;
		_iterateTankContents();

		var doMainSlideshow = function () {
			var slideshow = _view.getMainSlideshow(_tankContents, true, _isTankPhotoSensitive);
			_initMainSlideshow(slideshow);
		}

		if (_isBig) {
			calacademy.Utils.log('_taxaInTank:');
			calacademy.Utils.log(_taxaInTank);

			if (_taxaInTank.length < 2) {
				// this is supposed to be a big tank,
				// but not enought taxa were found
				_isBig = false;
				_view.removeDisplayMode();
				doMainSlideshow();
			} else {
				// start the splash slideshow
				var slideshow = _view.getTaxaSlideshow(_taxaInTank, _taxaImages);
				_initSplashSlideshow(slideshow);
			}
		} else {
			// jump right into the main slideshow
			doMainSlideshow();
		}
	}

	var _onTankData = function (data) {
		calacademy.Utils.log('_onTankData');
		calacademy.Utils.log(data);

		var selectedTank = $.getQueryString('tank');

		// if we have a query string, use that
		if (typeof(selectedTank) == 'string') {
			// match query string to tank data
			var i = data.length;

			while (i--) {
				var obj = data[i];

				if (obj.name.toLowerCase() == $.trim(selectedTank.toLowerCase())) {
					_tank = obj;
					break;
				}
			}
		}

		// set tank theme values
		_setViewThemeValues(_tank);

		// if the exhibit is being updated, stop here
		if (typeof(_tank.field_exhibit_being_updated) == 'string') {
			if (_tank.field_exhibit_being_updated == '1') {
				_exhibitBeingUpdated();
				return;
			}
		}

		// pull specimen data and display
		_data.getTankContentsById(_tank.tid, _onTankContentsData, _onDataError);
	}

	var _addExtraClasses = function () {
		var classes = $.getQueryString('classes');

		if (typeof(classes) == 'string') {
			var arr = classes.split(',');

			$.each(arr, function (i, val) {
				$('html').addClass($.trim(val));
			});
		}
	}

	this.initialize = function () {
		calacademy.Utils.log('AquariumID.initialize');
		_addExtraClasses();

		$('#msg').on('click', function () {
			$(this).remove();
		});

		// setup
		_view = new AquariumIDView();
		_data = new AquariumIDModel();

		// start by querying for vocab
		_data.getVocabulary(_onVocabularyData, _onDataError);
	}

	this.initialize();
}
