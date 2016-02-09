'use strict'

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var Request = require('./request');
var googleFont = require('./google-font');

const googleFontApiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?key=';

function isValidString(val) {
	return util.isString(val) && val.trim() !== '';
}

function GoogleFontList(apiKey) {
	if (!(this instanceof GoogleFontList))
		return new GoogleFontList(apiKey);

	EventEmitter.call(this);

	this.data = [];
	if (apiKey){
		this.apiKey = this.setApiKey(apiKey);
		this.downloadList();
	}
}

util.inherits(GoogleFontList, EventEmitter);

GoogleFontList.prototype.setApiKey = function(apiKey) {
	if (isValidString(apiKey)) {
		this.apiKey = apiKey.trim();
		return this.apiKey;
	} else {
		return false;
	}
}

GoogleFontList.prototype.downloadList = function() {
	var self = this;
	if (self.apiKey) {
		var request = new Request(googleFontApiUrl + self.apiKey);
		request.on('success', function(data){
			self.parseRawData(data);
		})
		request.on('error', function(error){
			self.emit('error', error);
		})
	} else {
		setImmediate(function(){
			self.emit('error', new Error('Please, set a valid apiKey.'));
		})
	}
}

GoogleFontList.prototype.parseRawData = function(rawData) {
	var self = this;
	var jsonList = false;
	try {
		var jsonList = JSON.parse(rawData);
	} catch (e) {
		var error = new Error('Failed to parse Google Fonts JSON: ' + e.message)
		error.isInvalidJson = true;
		self.emit('error', error);
	}

	if (jsonList && jsonList.hasOwnProperty('items')) {
		self.populate(jsonList.items);
	} else {
		var newError = new Error('Invalid Google Font Json');
		newError.isInvalidJson = true;
		self.emit('error', newError);
	}
}

GoogleFontList.prototype.populate = function(list){
	var self = this;
	async.each(list,
		function(fontData, cb){
			self.data.push(new googleFont(fontData));
			cb();
		}, function(err){
			if (err)
				self.emit('error', err);
			self.emit('success', self);
		})
}

GoogleFontList.prototype.clone = function(){
	var newFontList = new GoogleFontList();
	newFontList.data = this.data;
	newFontList.apiKey = this.apiKey;
	return newFontList;
}

GoogleFontList.prototype.searchFont = function(term, field, callback) {
	var self = this;
	var searchTerms = term.trim().length > 0 ? term.toLowerCase().split(' ') : [];
	async.filter(
		self.data,
		function(el, cb) {
			// var found = true;
			var found = searchTerms.length > 0 ? true : false;
			searchTerms.forEach(function(subTerm){
				found = found && el[field] && (el[field].toLowerCase().indexOf(subTerm) !== -1);
			})
			cb(found);
		},
		function(result) {
			var fontList = self.clone();
			fontList.data = result;
			fontList._filterField = field;
			fontList._filterTerm = term;
			callback(null, fontList);
		}
	)
};

GoogleFontList.prototype.searchFontByName = function(term, callback) {
	this.searchFont(term, 'family', callback);
}

GoogleFontList.prototype.searchFontByType = function(term, callback) {
	this.searchFont(term, 'category', callback);
}

GoogleFontList.prototype.getFont = function(term, field, callback) {
	var self = this;
	var searchTerms = term.trim().toLowerCase();
	async.filter(
		self.data,
		function(el, cb) {
			cb( el[field].toLowerCase() === searchTerms );
		},
		function(result) {
			var fontList = self.clone();
			fontList.data = result;
			fontList._filterField = field;
			fontList._filterTerm = term;
			callback(null, fontList);
		}
	)
}

GoogleFontList.prototype.getFontByName = function(term, callback) {
	this.getFont(term, 'family', callback);
}

GoogleFontList.prototype.getFontByType = function(term, callback) {
	this.getFont(term, 'category', callback);
}

GoogleFontList.prototype.getFirst = function () {
	return this.data.length > 0 ? this.data[0] : false;
};

GoogleFontList.prototype.isSingle = function(){
	return this.data.length === 1;
}

GoogleFontList.prototype.forEachFont = function(fn, callback) {
	var self = this;
	async.forEachOf(this.data, function(el, index, cb){
		fn.call(self, el, index);
		cb();
	}, callback);
}

module.exports = GoogleFontList;
