#!/usr/bin/env node

'use strict'

var program = require('commander');
var colors = require('colors');
var GoogleFontList = require('./lib/google-font-list');
var fontList = new GoogleFontList('AIzaSyB1I5eF2kRqqs50DS8qBJtFkCTMMoQLusg');
var pjson = require('./package.json');
var ncp = require("copy-paste-win32fix");

program
	.command('search [family...]')
	.description('Search for a family')
	.action(function(family){
		var searchedTerm = family ? family.join(" ") : '';
		fontList.on('success', function(){
			searchFont(searchedTerm);
		})

	})

program
	.command('download <family...>')
	.option('-d, --dest <folder>', 'Specify where to download')
	.option('-v, --variants <variants...>', 'Specify variants/weights to install, separated with comma (and no spaces)')
	.description('Download a font family')
	.action(function(family, options){
		var searchedTerm = family.join(" ");
		var variants = options.variants ? options.variants.split(',') : false;
		var path = options.dest || false;
		fontList.on('success', function(){
			downloadFont(searchedTerm, variants, path);
		})
	});

program
	.command('install <family...>')
	.option('-v, --variants <variants...>', 'Specify variants/weights to install, separated with comma (and no spaces)')
	.description('Install a font family')
	.action(function(family, options){
		var searchedTerm = family.join(" ");
		var variants = options.variants ? options.variants.split(',') : false;
		fontList.on('success', function(){
			installFont(searchedTerm, variants);
		})
	});

program
	.command('copy <family...>')
	.option('-v, --variants <variants...>', 'Specify variants/weights to copy clipboard, seperated with comma (and no spaces)')
	.description('Copy stylesheet link')
	.action(function(family, options){
		var searchedTerm = family.join(" ");
		var variants = options.variants ? options.variants.split(',') : false;
		fontList.on('success', function(){
			copyFont(searchedTerm, variants);
		})

	});

program
	.version(pjson.version);

program.parse(process.argv);


// CHECK IF NO COMMANDS ARE PROVIDED AND PRINT HELP IN NONE
var found = false;
program.args.forEach(function(arg){
	if (arg instanceof program.Command )
		found = true;
})
if (!found)
	program.help();

// HELPERS FUNCTIONS

console.log('\nDonwloading Google Font List....\n'.blue.bold);

fontList.on('error', function(err){
	printError(err);
})

function searchFont(searchedTerm) {
	fontList.searchFontByName(searchedTerm, printFontList)
}


function downloadFont(searchedTerm, variants, path) {
	fontList.getFontByName(searchedTerm, function(err, filteredList){
		if (err){
			printError(err);
			return;
		}
		if (filteredList.data.length === 1) {
			filteredList.getFirst().saveAt(variants, path, printResult);
		} else {
			console.log('Download failed: unable to find font family "%s". \n'.bold.red, searchedTerm);
			searchFont(searchedTerm);
		}
	})
}

function installFont(searchedTerm, variants) {
	fontList.getFontByName(searchedTerm, function(err, filteredList){
		if (err){
			printError(err);
			return;
		}
		if (filteredList.data.length === 1) {
			filteredList.getFirst().install(variants, printResult);
		} else {
			console.log('Installation failed: unable to find font family "%s". \n'.bold.red, searchedTerm);
			searchFont(searchedTerm);
		}
	})
}

function copyFont(searchedTerm, variants) {
	fontList.getFontByName(searchedTerm, function(err, filteredList){
		if (err){
			printError(err);
			return;
		}
		if (filteredList.data.length === 1) {

			var list 	= filteredList.getFirst();
			var cssUrl 	= variants ? list.cssUrl + ':' + variants.join(',') : list.cssUrl;

				ncp.copy(cssUrl, function () {
			        console.log('"%s" font url has been copied to your clipboard.'.green, searchedTerm);
			    });

		} else {
			console.log('Copy failed: unable to find font family "%s". \n'.bold.red, searchedTerm);
			searchFont(searchedTerm);
		}
	})
}

function printFontList(err, list, message){
	if (err) {
		printError(err)
		return;
	} else if (list.data.length === 0) {
		console.log('No results found for: %s\n'.red, list._filterTerm);
	} else {
		message = message || 'Search results for:'
		if (list._filterTerm)
			console.log('%s "%s"\n'.green, message, (list._filterTerm || '').bold.blue);
		list.data.forEach(function(el){
			console.log(" * %s".bold.blue,  el.family);
			console.log("    Category: %s\n    Variants: %s\n    CSS Url: %s\n", el.getCategory(), el.getVariants().join(", "), el.getCssUrl());
		})
	}
}

function printResult(err, result) {
	if (err) {
		printError(err);
		return;
	}
	console.log('');
	result.forEach(function(el){
		console.log('%s variant %s downloaded in %s'.green, (el.family || '??').bold, (el.variant || '??').bold, (el.path || '??').underline);
	})
	console.log('');
}

function printError(err) {
    console.error('Error, please try again!'.bold.red);
	console.error(err.toString().bold.red);
	process.exit(1);
}
