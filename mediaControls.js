function MediaControls() {

    _this = this;
    this.isTranscriptOpened = false;
    this.audManager;
    this.progressCtnr = $("#progress-sldr");
	this.progress = $("#progress");

    this.init = function(audioManager) {

        _this.audManager = audioManager;

        $("#transcript-ctrl").unbind("click").bind("click", _this.transcriptClickHandler);
        $(".transcript-close").unbind("click").bind("click", _this.transcriptClickHandler);
        
        $("#volume-ctrl").unbind("click").bind("click", _this.muteControlHandler);
        $("#volume-slider").unbind("click").bind("click", _this.volumeControlHandler);
        
        $(".pause-play-flag").unbind("click").bind("click", _this.pausePlayHandler);

		$("#progress-sldr").unbind("click").bind("click", _this.progressClickHandler);	 
        $("#progress-sldr").unbind("keyup").bind("keyup", _this.progressSlideHandler);	
        
        if((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
            $(".progress-container").unbind("click").bind("click", _this.progressClickHandler);
        }
        
    }

    this.transcriptClickHandler = function(e) {
			
		if(!_this.isTranscriptOpened) {
			$(".transcript-wrapper").addClass("show-transcript");
			$(".transcript-wrapper").removeAttr("aria-hidden");
			_this.isTranscriptOpened = true;
			$("#transcript-ctrl").attr("aria-expanded", "true");
			$(".transcript-wrapper .transcript-close").attr("tabindex", "0")
			$(".transcript-body > span").attr("tabindex", "0");
			//$(".transcript-body > span").focus();
		}else{
			$(".transcript-wrapper").removeClass("show-transcript");
			$(".transcript-wrapper").attr("aria-hidden","true");
			_this.isTranscriptOpened = false;
			$("#transcript-ctrl").attr("aria-expanded", "false");
			$(".transcript-wrapper .transcript-close").attr("tabindex", "-1")
			$(".transcript-body > span").attr("tabindex", "-1")
		}
			

    }
    
    this.muteControlHandler = function(e) {
		var svg = $(this).find("svg");
		var svgClass;
		if(_model.getAudioStatus().volume != "muted") {
			$(this).attr('name', 'unmute');/* Arun */
			$(this).attr('title', 'unmute');/* Arun */
			
			svgClass = svg.attr("class").replace("fa-volume-up", "fa-volume-mute");
			svg.attr("class", svgClass);
			_this.audManager.muteAudio();
			_model.setAudioStatus({
				status : null,
				volume: "muted"
			})
		}else{
			$(this).attr('name', 'mute');/* Arun */
			$(this).attr('title', 'mute');/* Arun */
			svgClass = svg.attr("class").replace("fa-volume-mute", "fa-volume-up");
			svg.attr("class", svgClass)
			_this.audManager.unMuteAudio();
			_model.setAudioStatus({
				status : null,
				volume: "un-muted"
			})
		} 
		$(this).tooltip("disable");
		$(this).tooltip("enable");
		$(this).focus();
    }

    this.volumeControlHandler = function(e) {

		if(e.target.id == "volume-thumb") {
			return false;
		}

        var svg = $("#volume-ctrl svg");
        var svgClass;
		var y = e.offsetY;
		var h = e.target.clientHeight;
		var volume = 0;
		var height = h - y;
		volume = (height / 100).toFixed(2);
		
		if(volume < 0.05) {
			volume = 0;
			height = 0;
			
			svgClass = svg.attr("class").replace("fa-volume-up", "fa-volume-mute");
			svg.attr("class", svgClass)

			_this.audManager.volumeControl(volume);
			_this.audManager.muteAudio();
			_model.setAudioStatus({
				status : null,
				volume: "muted"
			})
		}else{
			if(_this.audManager.volume == 0) {
				svgClass = svg.attr("class").replace("fa-volume-mute", "fa-volume-up");
				svg.attr("class", svgClass)
			}
			_this.audManager.volumeControl(volume);
			_this.audManager.unMuteAudio();
			_model.setAudioStatus({
				status : null,
				volume: "un-muted"
			})
		}
		$(".volume-slide").css({"height": height+"px"});
		
    }
    
    this.pausePlayHandler = function() {
		var svg = $(this).find("svg");
		var svgClass;
		if(_model.getAudioStatus().status == "playing") {
			$(this).attr('name', 'play');/* Arun */
			$(this).attr('title', 'play');/* Arun */
			svgClass = svg.attr("class").replace("fa-pause", "fa-play");
			svg.attr("class", svgClass);
			_this.audManager.pauseAudio();
			$(this).removeClass("pause-flag");
			_model.setAudioStatus({
                status : "paused",
                volume : null
            });
        }else if(_model.getAudioStatus().status == "paused" ||
         _model.getAudioStatus().status == "loaded" ) {
			$(this).attr('name', 'pause');/* Arun */
			$(this).attr('title', 'pause');/* Arun */
             if(svg.attr("class").indexOf("fa-play") > 0) {
                svgClass = svg.attr("class").replace("fa-play", "fa-pause");
             }else if(svg.attr("class").indexOf("fa-redo-alt") > 0) {
                svgClass = svg.attr("class").replace("fa-redo-alt", "fa-pause");
             }
			svg.attr("class", svgClass);
			_this.audManager.playAudio();
			$(this).addClass("pause-flag");
			_model.setAudioStatus({
                status : "playing",
                volume : null
            });
		}else if(_model.getAudioStatus().status == "ended") {
			commonProgress = 0;
			$(this).attr('name', 'replay');/* Arun */
			$(this).attr('aria-label', 'replay');/* Arun */
            svgClass = svg.attr("class").replace("fa-redo-alt", "fa-pause");
			svg.attr("class", svgClass);
			_this.audManager.playAudio();
			$(this).addClass("pause-flag");
			_model.setAudioStatus({
                status : "playing",
                volume : null
            });
        }
		$(this).tooltip("disable");
		$(this).tooltip("enable");
		$(this).focus();
    }
    var commonProgress = 0;
    this.progressClickHandler = function(e) {

		if(_model.getAudioStatus().status != "no-audio") {
			var progressSldrWidth = parseInt(this.clientWidth);
			var x = e.offsetX;
			var progress = Number(((x / progressSldrWidth) * 100).toFixed(2));
			var selectedTime = Number((x / progressSldrWidth).toFixed(2));
			selectedTime = Number((_model.getAudioDuration()*selectedTime).toFixed(2));
			if(_model.getAudioStatus().status == "ended") {
				_model.setAudioStatus({
					status : "paused",
					volume : null
				});
			}
			_this.audManager.setAudioTime(selectedTime, _model.getAudioStatus().status);
			commonProgress = progress;
			$("#progress").width(progress+"%");
			$("#progress-sldr").attr('aria-valuenow',Math.round(progress)+"%");
		}

    }
    
    this.progressSlideHandler = function (e) {
		if(_model.getAudioStatus().status != "no-audio") {
			if(e.keyCode == 39 && _model.getAudioStatus().status != "ended") {
				var forwardedTime = _model.getCurrentTime() + 5;
				if(forwardedTime < _model.getAudioDuration() ) {
					_this.audManager.setAudioTime(forwardedTime, _model.getAudioStatus().status)
				}else{
					_this.audManager.setAudioTime(_model.getAudioDuration() - 1, _model.getAudioStatus().status)
				}
				$("#progress-sldr").attr('aria-valuenow',Math.round(commonProgress)+"%");
			}else if(e.keyCode == 37) {
				var bacwardTime = _model.getCurrentTime() - 5;
				if(bacwardTime > 0.5 ) {
					_this.audManager.setAudioTime(bacwardTime, _model.getAudioStatus().status)
				}else{
					_this.audManager.setAudioTime(0.5, _model.getAudioStatus().status)
				}
				if(_model.getAudioStatus().status == "ended") {
					_model.setAudioStatus({
						status : "paused",
						volume : null
					});
				}
				$("#progress-sldr").attr('aria-valuenow',Math.round(commonProgress)+"%");
			}
		}

    }
    
    this.progressHandler = function(currTime) {
		var currPer = Number(((currTime / _model.getAudioDuration()) * 100).toFixed(2));
		if(!isNaN(currPer)) {
			_this.progress.width(currPer + "%");
		}
	}
    
}