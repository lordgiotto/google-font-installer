'use strict'

var https = require('https');
var http = require('http');
var url = require('url');
var fileType = require('file-type');
var StreamPass = require('stream').PassThrough;
var util = require('util');

/**
 * Stupid simple Class that handle Google API https requests (extends EventEmitter)
 *
 * @param {String} https url to fetch
 */
function Request(uri) {
	if (!(this instanceof Request))
		return new Request(uri);

	StreamPass.call(this);

	this.init(uri);

}

util.inherits(Request, StreamPass);

Request.prototype.init = function(uri) {
	var self = this;

	self.mimeType = false;
	var parsedUri = url.parse(uri);
	if (parsedUri.protocol && parsedUri.hostname !== '') {
		var req = this.req = this._getProperLibray(parsedUri).get(uri, function(res) {
			self.handleResponse(res);
		})

		req.setTimeout(5000, function(){
			self.emit('error', new Error('Request timeout.'));
			req.abort();
		})

		req.on('error', function(e){
			var errorMessage = util.format('Connection to %s failed.', parsedUri['hostname'])
			self.emit('error', new Error(errorMessage));
		})

	} else {
		setImmediate(function(){
			var error = new Error(uri + ' is an invalid url.');
			self.handleError(error);
		})
	}
}

/**
 * Returm the proper library to handle the request (http or https, else emit error)
 *
 * @return {Object} Return the proper library to handle the request
 */
Request.prototype._getProperLibray = function(uri){
	var self = this;
	switch (uri.protocol) {
		case 'http:':
			return http
			break;
		case 'https:':
			return https;
			break;
		default:
			setImmediate(function(){
				var error = new Error('Protocol not handled: use either http or https.');
				self.handleError(error);
			});
	}
}

Request.prototype.handleResponse = function(res) {
	var self = this;

	switch (res.statusCode) {
		case 200:
			var message = '';
			res.on('data', function(chunk) {
				self.write(chunk);
				message += chunk;
				if (message.length > 256 && !self._fisrtBytes){
					self._mimeType = fileType(new Buffer.from(message));
					self._fisrtBytes = true;
				}
			})
			res.on('end', function(){
				self.emit('success', message);
				self.end();
			})
			break;
		case 302:
		case 303:
		case 307:
			if (res.headers.location && self.redirect > 0) {
				self.redirect -= 1;
				self.emit('redirect', res.headers.location);
				self.init(res.headers.location);
				break;
			}
		default:
			var error = new Error('Bad response: ' + res.statusCode);
			error.statusCode = res.statusCode;
			self.handleError(error);
	}
}

Request.prototype.handleError = function(error){
	this.emit('error', error);
	this.end();
}

Request.prototype.getMimeType = function(){
	return this._mimeType;
}

module.exports = Request;
