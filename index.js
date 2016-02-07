var GoogleFontlist = require('./lib/google-font-list');
var fs = require('fs');

var fontList = new GoogleFontlist('AIzaSyB1I5eF2kRqqs50DS8qBJtFkCTMMoQLusg');

fontList.on('success', function(){
	this.searchFontByName('Source Sans Pro', function(err, filteredList) {
		if (err)
			throw err;
		filteredList.getFirst().download(['300', '400'], function(err, result){
			if (err)
				throw err;
			result.forEach(function(el){
				console.log('Variant %s of %s downloaded in %s', el.variant, el.family, el.path);
			})
		});
	})
})

fontList.on('error', function(err){
	throw err;
})


// var a = new GoogleFontApi();
//
// a.setApiKey('AIzaSyB1I5eF2kRqqs50DS8qBJtFkCTMMoQLusg');
//
// a.downloadList('', function(err, fontList) {
// 	if (err) {
// 		console.log(err);
// 		return;
// 	}
// 	// console.log(fontList);
// 	fontList.searchFontByFamily('lato', function(error, FontList){
// 		var singleFont = FontList.data[0];
// 		singleFont.saveAt('300', '/home/', function(err, path){
// 			if (err)
// 				console.log(err);
// 			console.log(path);
// 		});
// 	})
// })
