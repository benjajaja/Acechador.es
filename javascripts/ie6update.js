ie6update = {
	isInternetExplorer: function() {
		return navigator.userAgent.indexOf("MSIE") != -1;
	},
    top: -30,
    closed: false,
    //downloadUrl: "http://www.microsoft.com/spain/windows/internet-explorer/",
    downloadUrl: "http://www.google.com/chrome?hl=es",
    message: "This version of Internet Explorer is too outdated. Click here to update... ",
    message_es: "Esta versi&oacute;n de Internet Explorer es muy antigua. Haga click aqu&iacute; para actualizar... ",
    init: function() {
        var div = document.createElement('DIV');
        div.id = 'ie6updatenotice';
        ie6update.style = div.style;
        ie6update.style.backgroundAttachment = 'scroll';
        ie6update.style.backgroundColor = '#FFFFE1';
        ie6update.style.borderBottomColor = '#666666';
        ie6update.style.borderBottomStyle = 'solid';
        ie6update.style.borderBottomWidth = '1px';
        ie6update.style.color = '#000000';
        ie6update.style.cursor = 'default';
        ie6update.style.display = 'block';
        ie6update.style.padding = '4px 0';
        ie6update.style.position = 'absolute';
        ie6update.style.top = '-30px';
        ie6update.style.left = '0';
        ie6update.style.width = '100%';
        ie6update.style.zIndex = '9999999';
        ie6update.style.fontSize = '11px';

        ie6update.style.textAlign = 'left';
        ie6update.style.fontFamily = '"Bitstream Vera Sans",verdana,sans-serif';

        ie6update.icon = document.createElement('IMG');
        ie6update.icon.src = 'images/ie6update/icon.png';
        ie6update.setImageStyles(ie6update.icon, 'left');
        div.appendChild(ie6update.icon);

        ie6update.icon2 = document.createElement('IMG');
        ie6update.icon2.src = 'images/ie6update/icon-over.png';
        ie6update.setImageStyles(ie6update.icon2, 'left');
        ie6update.icon2.style.display = 'none';
        div.appendChild(ie6update.icon2);


        ie6update.close = document.createElement('IMG');
        ie6update.close.src = 'images/ie6update/close.png';
        ie6update.setImageStyles(ie6update.close, 'right');
        ie6update.close.attachEvent("onclick", ie6update.closeAd);
        div.appendChild(ie6update.close);

        ie6update.close2 = document.createElement('IMG');
        ie6update.close2.src = 'images/ie6update/close-over.png';
        ie6update.setImageStyles(ie6update.close2, 'right');
        ie6update.close2.style.display = 'none';
        ie6update.close2.attachEvent("onclick", ie6update.closeAd);
        div.appendChild(ie6update.close2);

        var message = document.createElement('SPAN');
        message.innerHTML = ie6update.message_es;
        div.appendChild(message);

        div.attachEvent("onclick", ie6update.goToUpdatePage);

        document.getElementsByTagName("body").item(0).appendChild(div);

        ie6update.start();

        div.attachEvent("onmouseover", ie6update.mouseover);
        div.attachEvent("onmouseout", ie6update.mouseout);

    },
    start: function() {
        ie6update.interval = setInterval(ie6update.grow, 100);
    },
    grow: function() {
        ie6update.top += 6;
        if (ie6update.top >= 0) {
            ie6update.style.top = '0px';
            clearInterval(ie6update.intervalID);
            return;
        }
        ie6update.style.top = ie6update.top+'px';
    },
    setImageStyles: function(img, floatDirection) {
        img.style.display = 'block';
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.margin = '0 2px';
        img.style.styleFloat = floatDirection;
    },
    goToUpdatePage: function() {
        window.location = ie6update.downloadUrl;
    },
    closeAd: function() {
    	event.cancelBubble = true;
        ie6update.closed = true;
        ie6update.style.display = 'none';
    },
    mouseover: function() {
        ie6update.style.backgroundColor = '#3399ff';
        ie6update.icon.style.display = 'none';
        ie6update.icon2.style.display = 'block';
        ie6update.close.style.display = 'none';
        ie6update.close2.style.display = 'block';
    },
    mouseout: function() {
        ie6update.style.backgroundColor = '#FFFFE1';
        ie6update.icon2.style.display = 'none';
        ie6update.icon.style.display = 'block';
        ie6update.close2.style.display = 'none';
        ie6update.close.style.display = 'block';
    }
};