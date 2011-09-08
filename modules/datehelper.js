exports.getExpiryDate = function() {
	var date = new Date();
	if (date.getMonth() < 11) {
		date.setMonth(date.getMonth() + 1);
	} else {
		date.setMonth(0);
		date.setFullYear(date.getFullYear() + 1);
	}
	return exports.getRFC822Date(date);
};

var padWithZero = function(val){
	if (parseInt(val) < 10)
	{
	  return "0" + val;
	}
	return val;
};

exports.getRFC822Date = function(date) {
	if (typeof date == 'undefined') {
		date = new Date();
	}
	var padWithZero = function(val){
		if (parseInt(val) < 10)
		{
		  return "0" + val;
		}
		return val;
	};

	/* accepts the client's time zone offset from GMT in minutes as a parameter.
	  returns the timezone offset in the format [+|-}DDDD */
	  var getTZOString = function(timezoneOffset)
	  {
		var hours = Math.floor(timezoneOffset/60);
		var modMin = Math.abs(timezoneOffset%60);
		var s = new String();
		s += (hours > 0) ? "-" : "+";
		var absHours = Math.abs(hours)
		s += (absHours < 10) ? "0" + absHours :absHours;
		s += ((modMin == 0) ? "00" : modMin);
		return(s);
	  }
	var aMonths = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    
    var aDays = new Array( "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
    var dtm = new String();
			
    dtm = aDays[date.getDay()] + ", ";
    dtm += padWithZero(date.getDate()) + " ";
    dtm += aMonths[date.getMonth()] + " ";
    dtm += date.getFullYear() + " ";
    dtm += padWithZero(date.getHours()) + ":";
    dtm += padWithZero(date.getMinutes()) + ":";
    dtm += padWithZero(date.getSeconds()) + " " ;
    dtm += getTZOString(date.getTimezoneOffset());
    return dtm;
};

exports.humanShort = function(date) {
	return padWithZero(date.getDate())+'/'+padWithZero(date.getMonth()+1)+'/'+date.getFullYear();
};

exports.mysql = function(date) {
	if (typeof date == 'undefined') {
		date = new Date();
	}
	return padWithZero(date.getFullYear())+'-'+padWithZero(date.getMonth()+1)+'-'+date.getDate()
		+' '+padWithZero(date.getHours())+'-'+padWithZero(date.getMinutes())+'-'+date.getSeconds();
};