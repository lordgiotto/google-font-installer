'use strict'

var util = require('util');
var path = require('path');
var os = require('os');
var fs = require('fs');
var child_process = require('child_process');
var mv = require('mv');
var Request = require('./request');

const tmp_folder = path.join(os.tmpdir(), 'google-font-installer');

function SystemFont() {}

SystemFont.prototype._saveTmp = function(remoteFile, fileName, callback) {
	if (!remoteFile) {
		callback(new Error('Nothig to download'), null);
		return;
	}
	var self = this;
	this._checkDestFolder(tmp_folder, function(err, folder){
		if (err) {
			callback(err);
			return;
		}
		var remoteExt = path.parse(remoteFile).ext;
		var filePath = path.join(folder, fileName + remoteExt);
		var localFile = fs.createWriteStream(filePath);
		var download = new Request(remoteFile);
		download.on('error', function(e){
			callback(e, null);
		})
		.pipe(localFile)
		.on('finish', function(){
			var mimeType = download.getMimeType();
			if ( mimeType && mimeType.mime === 'application/font-sfnt') {
				callback(null, filePath);
			} else {
				fs.unlink(filePath, function(e){
					callback(new Error('Downloaded file is corrupted'), null);
				})
			}
		})
		.on('error', function(e){
			callback(e, null);
		})
	});
}

SystemFont.prototype._move = function(oldPath, destFolder, callback) {
	this._checkDestFolder(destFolder, function(err, folder){
		if (err) {
			callback(err);
			return;
		}
		var fileName = path.basename(oldPath).trim() || 'font.ttf';
		var newPath =  path.join(folder, fileName);
		mv(oldPath, newPath, function(err){
			if (err) {
				callback(new Error('Something went wrong writing the file.'), null);
				return;
			}
			callback(null, newPath);
		})
	})
}

SystemFont.prototype._checkDestFolder = function(destFolder, callback){
	var self = this;
	if (util.isNullOrUndefined(destFolder) || !destFolder) {
		destFolder = process.cwd() || os.homedir();
	} else if (!util.isString(destFolder)) {
		throw new Error('Destination folder for font must be a string');
	}
	var absFolder = path.resolve(destFolder);
	this._isFolderOk(absFolder, function(err){
		if (err) {
			callback(err);
			return;
		}
		callback(null, absFolder);
	})
}

SystemFont.prototype._isFolderOk = function(folder, callback) {
	fs.exists(folder, function(exists){
		if (!exists) {
			fs.mkdir(folder, function(err){
				if (err) {
					callback('Error while creating folder ' + folder);
					return;
				}
				callback(null);
			})
		} else {
			fs.access(folder, fs.W_OK, function(err){
				if (err) {
					callback(new Error('No write permission in destination folder: ' + folder), null);
					return;
				}
				callback(null);
			})
		}
	})
};

SystemFont.prototype.saveAt = function(remoteFile, destFolder, fileName, callback) {
	var self = this;
	self._saveTmp(remoteFile, fileName, function(err, tmpPath){
		if (err) {
			callback(err, null);
			return;
		}
		self._move(tmpPath, destFolder, callback);
	})
}

SystemFont.prototype.saveHere = function(remoteFile, fileName, callback) {
	this.saveAt(remoteFile, false, fileName, callback);
};

SystemFont.prototype.install = function(remoteFile, fileName, callback) {
	switch (os.platform()) {
		case 'linux':
			var destFolder = path.join(os.homedir(), '.fonts/');
			this.saveAt(remoteFile, destFolder, fileName, callback);
			break;
		case 'darwin':
			var destFolder = path.join(os.homedir(), 'Library', 'Fonts/');
			this.saveAt(remoteFile, destFolder, fileName, callback);
			break;
		case 'win32':
			this._saveTmp(remoteFile, fileName, function(err, tmpPath){
				if (err) {
					callback(err);
					return;
				}
				child_process.exec('cscript.exe ' + path.join(__dirname, 'windows', 'installFont.js') + ' ' + tmpPath, function(err, stdout, stderr){
					callback(err, 'Font System Folder with cscript.');
				})
			})
			break;
		default:
			callback(new Error('Platform not supported.'));
	}
}

module.exports = new SystemFont();
