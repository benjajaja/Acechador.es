
var mapping = {
	0:48, 1:49, 2:50, 3:51, 4:52, 5:53, 6:54, 7:55, 8:56, 9:57, /*10:65, 
	11:66, 12:67, 13:68, 14:69, 15:70, 16:71, 17:72, 18:73, 19:74, 20:75, 
	21:76, 22:77, 23:78, 24:79, 25:80, 26:81, 27:82, 28:83, 29:84, 30:85, 
	31:86, 32:87, 33:88, 34:89, 35:90,*/ 10:97, 11:98, 12:99, 13:100, 14:101, 
	15:102, 16:103, 17:104, 18:105, 19:106, 20:107, 21:108, 22:109, 23:110, 
	24:111, 25:112, 26:113, 27:114, 28:115, 29:116, 30:117, 31:118, 32:119, 
	33:120, 34:121, 35:122
};
var mapsize = 36;

var goldenPrimes = [1,41,2377,147299,9132313,566201239,35104476161,2176477521929];

var base62 = function(number) {
	var key = '';
	while(number > 0) {
		var mod = number - (Math.floor(number / mapsize) * mapsize);
		key += String.fromCharCode(mapping[mod]);
		number = Math.floor(number / mapsize);
	}
	return reverse(key);
};

var reverse = function(string) {
	return string.split('').reverse().join('');
};

exports.hash = function(number, length) {
	length = length || 5;
	var ceil = Math.pow(mapsize, length);
	var prime = goldenPrimes[length];
	var dec = (number * prime) - Math.floor(number * prime / ceil) * ceil;
	var hash = base62(dec);
	return hash;
};
