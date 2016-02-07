'use strict'

var util = require('util');
var async = require('async');
var pascalCase = require('pascal-case');
var systemFont = require('./system-font');
var noop = require('./noop');



function googleFont(fontData) {
	if (!(this instanceof googleFont))
		return new googleFont(fontData);

	Object.assign(this, fontData);

	this._fileName = pascalCase( this.getFamily() );
	this.cssUrl = 'https://fonts.googleapis.com/css?family=' + this.getFamily().replace(/\s/g, "+");
}

googleFont.prototype.getFamily = function(){
	return this.family;
}

googleFont.prototype.getCategory = function(){
	return this.category;
}

googleFont.prototype.getVariants = function(){
	return this.variants;
}

googleFont.prototype.getSubsets = function(){
	return this.subsets;
}

googleFont.prototype.getVersion = function(){
	return this.version;
}

googleFont.prototype.getLastMod = function(){
	if (this.lastModified)
		return new Date(this.lastModified);
	return false;
}

googleFont.prototype.getFileList = function(){
	return this.files;
}

googleFont.prototype.getCssUrl = function() {
	return this.cssUrl;
};

googleFont.prototype.hasVariant = function(variant){
	return this.getVariants().indexOf( this._normalizeVariant(variant) ) !== -1;
}

googleFont.prototype.getFiles = function(variants){
	var self = this;
	var fileList = self.getFileList();
	var files = {};
	if ( util.isString(variants) ) {
		return self.getFiles([variants]);
	} else if ( util.isNullOrUndefined(variants) || !variants ){
		return fileList;
	} else if ( util.isArray(variants) ) {
		variants.forEach(function(theVariant){
			var normalizedVariant = self._normalizeVariant(theVariant);
			files[normalizedVariant] = fileList.hasOwnProperty(normalizedVariant) ? fileList[normalizedVariant] : false;
		})
	}
	return files;
}

googleFont.prototype.saveAt = function(variants, destFolder, callback) {
	var self = this;
	callback = callback || noop;
	var fileList = this.getFiles(variants);
	var resultList = []
	async.forEachOf(fileList, function(remoteFile, theVariant, next){
		if (remoteFile) {
			systemFont.saveAt(remoteFile, destFolder, self._fileName + '-' + theVariant, function(err, path){
				if (path)
					resultList.push({
						'family' : self.getFamily(),
						'variant' : theVariant,
						'path' : path
					});
				next(err);
			});
		} else {
			var errorMsg = util.format('Variant %s not exists for family %s', theVariant, self.getFamily());
			next(new Error(errorMsg));
		}
	}, function(err){
		callback(err, resultList);
	})
}

googleFont.prototype.download = function(variants, callback) {
	callback = callback || noop;
	this.saveAt(variants, false, callback);
}

googleFont.prototype.install = function(variants, callback) {
	var self = this;
	callback = callback || noop;
	var fileList = this.getFiles(variants);
	var resultList = []
	async.forEachOf(fileList, function(remoteFile, theVariant, next){
		if (remoteFile) {
			systemFont.install(remoteFile, self._fileName + '-' + theVariant, function(err, path){
				if (path)
				resultList.push({
					'family' : self.getFamily(),
					'variant' : theVariant,
					'path' : path
				});
				next(err);
			});
		} else {
			var errorMsg = util.format('Variant %s not exists for family %s', theVariant, self.getFamily());
			next(new Error(errorMsg));
		}
	}, function(err){
		callback(err, resultList);
	})
}

googleFont.prototype._normalizeVariant = function(variant) {
	variant = variant.trim();
	if (variant === '400') {
		variant = 'regular';
	} else if (variant === '400italic') {
		variant = 'italic';
	}
	return variant;
}

module.exports = googleFont;
