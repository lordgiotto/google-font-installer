#!/usr/bin/env node

'use strict'

var program = require('commander');
var colors = require('colors');
var GoogleFontList = require('./lib/google-font-list');

var fontList = new GoogleFontList('AIzaSyB1I5eF2kRqqs50DS8qBJtFkCTMMoQLusg');

program
	.command('search [family...]')
	.description('Search for a family')
	.action(function(family){
		var searchedTerm = family ? family.join(" ") : '';
		fontList.on('success', function(){
			this.searchFontByName(searchedTerm, printFontList)
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
			this.searchFontByName(searchedTerm, function(err, filteredList){
				if (filteredList && filteredList.data.length === 1) {
					filteredList.getFirst().saveAt(variants, path, printResult);
				} else {
					printFontList(err, filteredList, 'More fonts mathces the request:');
				}
			})
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
			this.searchFontByName(searchedTerm, function(err, filteredList){
				if (filteredList && filteredList.data.length === 1) {
					filteredList.getFirst().install(variants, printResult);
				} else {
					printFontList(err, filteredList, 'More fonts mathces the request:');
				}
			})
		})
	});

program
	.version('1.0.0');

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
function printFontList(err, list, message){
	if (err) {
		printError(err)
		return;
	} else if (list.data.length === 0) {
		console.log('\nNo results found for: %s\n'.red, list._filterTerm);
	} else {
		message = message || 'Search reuslts for:'
		if (list._filterTerm)
			console.log('\n%s "%s"\n'.green, message, list._filterTerm.bold.blue);
		list.data.forEach(function(el){
			console.log(" * %s".bold.blue,  el.family);
			console.log("    Category: %s\n    Variants: %s\n    CSS Url: %s", el.getCategory(), el.getVariants().join(", "), el.getCssUrl());
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
		console.log('%s variant %s downloaded in %s'.green, el.family.bold, el.variant.bold, el.path.underline);
	})
	console.log('');
}

function printError(err) {
	console.log(err.message.bold.red);
}
