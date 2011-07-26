exports.antiquity = function(date) {
	var SECONDS_MIN = 60;
	var SECONDS_HOUR = 3600;
	var SECONDS_DAY = 86400;
	var SECONDS_WEEK = 604800;
	var SECONDS_MONTH = 2419200;
	var SECONDS_YEAR = 29030400;
	var seconds = (new Date().getTime() - date.getTime()) / 1000;
	if (seconds <= 0) {
		return  "hace un momento";
	}
	var years = Math.floor(seconds / SECONDS_YEAR);
	if (years >= 1) {
		return years > 1 ? "hace "+years+" años" : "el año pasado";
	}
	var months = Math.floor(seconds / SECONDS_MONTH);
	if (months >= 1) {
		return months > 1 ? "hace "+months+" meses" : "el mes pasado";
	}
	var weeks = Math.floor(seconds / SECONDS_WEEK);
	if (weeks >= 1) {
		return weeks > 1 ? "hace "+weeks+" semanas" : "la semana pasada";
	}
	var days = Math.floor(seconds / SECONDS_DAY);
	if (days >= 1) {
		return days > 1 ? "hace "+days+" días" : "ayer";
	}
	var hours = Math.floor(seconds / SECONDS_HOUR);
	if (hours >= 1) {
		return hours > 1 ? "hace "+hours+" horas" : "hace una hora";
	}
	var minutes = Math.floor(seconds / SECONDS_MIN);
	if (minutes >= 1) {
		return minutes > 1 ? "hace "+minutes+" minutos" : "hace un minuto";
	}
	return  "hace un momento";
};