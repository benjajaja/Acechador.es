Preview = {
  videoWidth: 548,
  videoHeight: 400,
  load: function(autoplay) {
    $('a.link[rel]').each(function(index) {
      var relValue = $(this).attr('rel');
      var button;
      if (relValue == 'video') {
        button = Preview.addButton($(this), 'video', $(this).attr('href'));
      } else {
        var relSplit = relValue.split(' ');
        if (relSplit[0] == 'youtube') {
          button = Preview.addButton($(this), 'youtube', relSplit[1]);
        }
      }
      if (autoplay && index == 0) {
      	Preview.video(button);
      }

    });
  },
  addButton: function(element, type, id) {
    var button = $(document.createElement('button'));
    try {
    	button.attr('type', 'button');
    } catch (e) {
    	// fuck IE
    }
    button.html('&#9654;');
    button.attr('videoId', id);
    button.attr('videoType', type);
    $(element).after(button);
    button.click(Preview.video);
    return button;
  },
  video: function(mixed) {
	  var button = mixed.target ? $(mixed.target) : mixed;
	  button.unbind('click', Preview.youtube);
	  button.html('...');                                          

	  var videoId = button.attr('videoId');
    
    
    if (button.attr('videoType') == 'youtube') {
      var videoBoxId = 'preview_video_'+videoId;
      button.attr('videoBoxId', videoBoxId);
      //joVideoBox.attr('id', videoBoxId);
      
      var daddy = button.parent();
      var finalWidth = Preview.videoWidth;
      var finalHeight = Preview.videoHeight;
      if (daddy.innerWidth() - 50 < finalWidth) {
    	  finalWidth = daddy.innerWidth() - 50;
    	  finalHeight = Math.ceil(finalWidth * 3 / 4);
      }
      var joVideo = $(document.createElement('iframe'));
      joVideo.addClass('youtube-player'); // needed?
      joVideo.attr('id', videoBoxId);
      joVideo.attr('type', 'text/html');
      joVideo.attr('width', finalWidth);
      joVideo.attr('height', finalHeight);
      joVideo.attr('frameborder', '0');
      joVideo.attr('src', 'http://www.youtube.com/embed/'+videoId);
      button.after(joVideo);
      Preview.setButtonPlaying(button, true);
      //<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/VIDEO_ID" frameborder="0"></iframe>
      
      /*swfobject.embedSWF(
  			"http://www.youtube.com/v/"+videoId+"?enablejsapi=1&playerapiid="+videoBoxId,
  			videoBoxId,
  			finalWidth, finalHeight,
  			"9.0.0",
  			null, //"expressInstall.swf",
  			null, //flashvars,
  			{ allowScriptAccess: "always" },
  			{ id: videoBoxId },
  			Preview.youtubeLoaded
  		);*/
  	} else if (button.attr('videoType') == 'video') {
  	  var joVideoBox = $(document.createElement('span'));
  	    
  	  button.after(joVideoBox);
      var videoBoxId = 'preview_video_'+Math.floor(Math.random()*1000000);
      button.attr('videoBoxId', videoBoxId);
      joVideoBox.attr('id', videoBoxId);
        
  	  var joVideo = $(document.createElement('video'));
  	  joVideo.attr('src', videoId);
  	  joVideo.attr('width', finalWidth);
  	  joVideo.attr('height', finalHeight);
  	  joVideo.attr('controls', 'controls');
  	  joVideo.attr('autoplay', 'autoplay');
  	  joVideoBox.append(joVideo);
  	  Preview.setButtonPlaying(button, true);
    }
  },
  setButtonPlaying: function(joButton, hideBottomBorder) {
    joButton.css('fontWeight', 'bold');
    joButton.html('&#215;');
    joButton.click(Preview.videoClose);
    joButton.next().css('display', 'block');
    joButton.next().css('clear', 'right');
    joButton.next().css('marginLeft', 'auto');
    if (hideBottomBorder) {
      joButton.css('borderBottomWidth', '0');
    }
  },
  videoClose: function() {
    $(this).unbind('click', Preview.youtubeClose);
    $(this).css('borderBottomWidth', '1px');

    $('#'+$(this).attr('videoBoxId')).remove();
    
    $(this).html('&#9654;');
    $(this).click(Preview.video);
  },
  youtubeLoaded: function(e) {
    if (e.success) {
      Preview.setButtonPlaying($('#'+e.id).prev(), true);
      var player = document.getElementById(e.id);
      if (player.playVideo) {
        player.playVideo();
      } else {
        setTimeout(
          function() {
            if (player.playVideo) {
              player.playVideo();
            } else {
              setTimeout(
                function() {
                  if (player.playVideo) {
                    player.playVideo();
                  }
                }, 1000
              );
            }
          }, 100
        );
      }
    }
  }
};