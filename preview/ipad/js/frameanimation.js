var FrameAnimation = function (path, extension, num) {
	var _i;
	var _path;
	var _extension;
	var _numFrames;
	var _onSuccess;
	var _currentFrame;
	var _reverse = false;

	var _getSrcForFrame = function (i) {
		if (i < 10) {
			i = '0' + i;
		}

		return _path + i + '.' + _extension;
	}

	var _animate = function () {
		if (_reverse) {
			_currentFrame--;
		} else {
			_currentFrame++;
		}

		if (_currentFrame == _numFrames) {
			_reverse = true;
		}

		if (_currentFrame == 1 && _reverse) {
			_reverse = false;
		}

		var src = _getSrcForFrame(_currentFrame);
		$('.title-slide').css('background-image', 'url(' + src + ')');

		requestAnimationFrame(_animate);
	}

	var _initAnimation = function () {
		calacademy.Utils.log('_initAnimation');
		
		_currentFrame = 0;
		_reverse = false;

		requestAnimationFrame(_animate);
	}

	var _next = function () {
		_i++;

		if (_i > _numFrames) {
			_initAnimation();
			_onSuccess();
			return;
		}

		var src = _getSrcForFrame(_i);		
		$('<img />').load(_next).attr('src', src);
	}

	this.start = function (onSuccess) {
		_i = 0;
		_onSuccess = onSuccess;

		_next();
	}

	this.initialize = function (path, extension, num) {
		_path = path;
		_extension = extension;
		_numFrames = num;
	}

	this.initialize(path, extension, num);	
}
