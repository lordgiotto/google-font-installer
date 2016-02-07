Google Font Installer
=============

Google Font Installer is written in NodeJS and let you Search, Donwload and Install any font offered by Google Web Fonts.

You can use it in two ways:
- installing the module system wide and using the Command Line Interface (CLI)
- requiring the module in your project and use the APIs

###### Font installation footnote
In Linux and OSX, the font will be installed in the user's font directory (~/.fonts for Linux, ~/Library/Fonts for OSX).
In Windows, due to the fact that font installation require some register modifications, I prefered to create a little WScript (a windows script that use ActiveX windows interface) and spawn a `cscript` process to install the font in _'windows native way'_.

# CLI

First of all you have to install google-font-installer in your system

```
$ sudo npm install -g google-font-installer
```
If you are on a Windows Machine, you have to omit `sudo` before `npm`

Now, from your terminal emulator, you can use the command `gfi`

### Search a font

```
$ gfi search [family_name]
```
The search is really permissive, so you can specify only few characters and view all the font families that contains these characters. Words order is also not important.
For instance, search for _Source Sans_ or _Sans Source_ will produce the same result.

### Download a font

```
$ gfi download [family_name] [-d|--dest destination_folder] [-v|--variants comma_separeted_variants]
```

If **family_name** will match more than one family, nothing will be downloaded: a list of alternatives will help you better specify the font family name.

Download command accepts two options:
- `-d` or `--dest` let you specify the folder where to download the fonts. If this option is omitted the fonts will be download in the folder in which the command was called (or in the home directory if this folder is not writable by the user)
- `-v` or `--variants` let you specify which variants of the font will be downloaded. You have to write each variant separated by the other with a comma. For exemple `$ gfi download Source Sans Pro -v 300,400`. If omitted, all variants will be downloaded.

### Install a font
```
$ gfi install [family_name] [-v|--variants comma_separeted_variants]
```

If **family_name** will match more than one family, nothing will be installed: a list of alternatives will help you better specify the font family name.

Install command accepts only one option:
- `-v` or `--variants` let you specify which variants of the font will be installed. You have to write each variant separated by the other with a comma. For exemple `$ gfi install Source Sans Pro -v 300,400`. If omitted, all variants will be downloaded.

### Exemples
Search the _source_ keyword:
```
$ gfi search source

Search reuslts for: "source"

 * Source Code Pro
    Category: monospace
    Variants: 200, 300, regular, 500, 600, 700, 900
    CSS Url: https://fonts.googleapis.com/css?family=Source+Code+Pro
 * Source Sans Pro
    Category: sans-serif
    Variants: 200, 200italic, 300, 300italic, regular, italic, 600, 600italic, 700, 700italic, 900, 900italic
    CSS Url: https://fonts.googleapis.com/css?family=Source+Sans+Pro
 * Source Serif Pro
    Category: serif
    Variants: regular, 600, 700
    CSS Url: https://fonts.googleapis.com/css?family=Source+Serif+Pro
```
Download Source Sans Pro 600 and 700italic:
```
$ gfi download source sans -v 600,700italic

Source Sans Pro variant 600 downloaded in /home/user/someFolder/SourceSansPro-600.ttf
Source Sans Pro variant 700italic downloaded in /home/user/someFolder/SourceSansPro-700italic.ttf
```
Install Lato 100
```
$ gfi install lato -v 100

Lato variant 100 downloaded in /home/user/.fonts/Lato-100.ttf

```
# APIs
First of all you have to install the module in you NodeJS project:
```
$ npm install google-font-installer --save
```
And then you can require it in your code:
```js
var GoogleFontList = require('google-font-installer');
```

To use this API is necessary to obtain a Browser Key enabled to Google Font API from the [Google Developer Dashboard](https://console.developers.google.com/).

### GoogleFontList

**GoogleFontList** is a class that can be instanced with the Google API Key as only argument.
```js
var fontList = new GoogleFontList('API_KEY');
```
If you prefer you can also create an instance without the apiKey and call the methods `.setApiKey('API_KEY')` and `.downloadList()` in a second moment.
```js
var fontList = new GoogleFontList();
fontList.setApiKey('API_KEY');
fontList.downloadList();
```

#### Events
###### `'success'`
Emitted when the Font List is downloaded from Google and the data are converted, stored and processed. Callback contains only one argument for convenience: the object itself
###### `'error'`
Emitter if something go wrong in downloading, coverting or processing data. The Callback argument is the error object.

#### Public properties
###### `data` [Array]
Array of GoogleFont instances, a class that extends the data provided by the Google APIs. Empty until 'success' event.
###### `apiKey` [String]
The Google APIs Key setted with the constructor or with setApiKey().

#### Public methods

###### `setApiKey('API_KEY')`
- _API_KEY_ [String]
- Returns [String|Boolean] If apiKey is a valid string, return the apiKey trimmed, else returns false.

Used to set the apiKey to download data from Google Web Font APIs.

###### `downloadList()`
Download the list from Google Web Font APIs.

###### `parseRawData(rawData)`
- _rawData_ [String] String in valid JSON format.

Parse raw data in valid JSON format. Used internally, but public for convenience if someone prefers to use the object without downloading the list (ex. cached data).

###### `populate(jsonData)`
- _jsonData_ [Array] An array of Object rappresenting the font like Google does.

Populate the object `data` property with an array of GoogleFont instances, based on the data provided by Google Apis. Used internally, but public for convenience if someone prefers to use the object without downloading and parsing the list (ex. cached data).

###### `clone()`
- Returns [GoogleFontList] A new instance of GoogleFontList

Return a new instance of the object, with the same `data` and `apiKey` properties.

###### `searchFont(term, field, callback)`
- term [String] The string to search for.
- field [String] The property of the GoogleFont instance to test.
- callback(err, fontList) [Function] Mandatory callback with optional error obj and a new instance of GoogleFontList with the searched subset of Fonts

Function with callback used to search a specific string inside a specific property of googleFont object.

###### `searchFontByName(term, callback)`
- term [String] The string to search for.
- callback(err, fontList) [Function] Mandatory callback with optional error obj and a new instance of GoogleFontList with the searched subset of Fonts

Same as searchFont, but specific for the Family property. (the font name)

###### `searchFontByType(term, callback)`
- term [String] The string to search for.
- callback(err, fontList) [Function] Mandatory callback with optional error obj and a new instance of GoogleFontList with the searched subset of Fonts

Same as searchFont, but specific for the Category property. (for instance serif, sans-serif, display, etc)

###### `getFirst()`
- Returns [GoogleFont|Boolean] If not empty, return the first GoogleFont instance inside
GoogleFontList `data` property, else return false.

###### `isSingle()`
- Returns [Boolean] Returns true if the is only one GoogleFont in GoogleFontList `data` property, else return false.

###### `forEachFont(fn)`
- fn [Function] The function to execute.

Execture fn foreach GoogleFOnt in GoogleFontList `data` property. It's async.


### GoogleFont
Class that extends data structure provided by Google APIs.

It's instanced by the populate method of GoogleFontList, called internally by the constructor or by parseRawData method.

**Every object inside the `data` property of GoogleFontList is an instance of this class.**

#### Public properties

###### `family` `category` `version` `lastModified` [String]
Inherits by Google Font API structure, respectively the font name, the font type (serif, sans-serif, etc), the version and the string rappresenting the last modification data.
###### `subsets` [Array]
Inherits by Google Font API structure, a list of the available subsest for that font.
###### `variants` [Array]
Inherits by Google Font API structure, a list of all available variants (weights) for that font.
###### `files` [Object]
Inherits by Google Font API structure, an object with key-value of variant and ttf remote file.
###### `cssUrl` [String]
Url of the css file containing the ready-to-use imports for the web about that specific font.

#### Public methods

###### `getFamily()` `getCategory()` `getVariants()` `getSubsets()` `getVersion()` `getLastMod()` `getFileList()` `getCssUrl()`
Method to access to the public properties: it's a better idea use them insteed the properties for a future-proof reason. Maybe someday google will decide to changhe his properties names.
All returns the type of the property, except `GetLastMod()` that return a new Date instance.

##### `hasVariant(variant)`
- variant [String] The name of a variant (300, 500, etc);
- Returns [Boolean] true if the font has that variant, else returns false.

##### `getFiles(variants)`
- variants [String|Array] A string of the variant or an array with multiple variants.
- Returns [Boolean] Returns an object with key the requested variant and value the respetive file (or false if the is no file for that variant).

##### `saveAt(variants, destFolder, callback)`
- variants [String|Array] A string of the variant or an array with multiple variants.
- destFolder [String] A valid path of the destination folder for the file download.
- callback(err, result) [Function] Optional callback with eventually an error obj and and the result Array of Objects.
    - result [Array] An Array containing one object for each downloaded file, with the following properties:
        - _family_: the downloaded font family
        - _variant_: the downloaded variant
        - _path_: the path of the downloaded file

Download specified variants of the font in the destination folder directory.

##### `download(variants, callback)`
- variants [String|Array] A string of the variant or an array with multiple variants.
- callback(err, result) [Function] Optional callback with eventually an error obj and and the result Array of Objects.
    - result [Array] An Array containing one object for each downloaded file, with the following properties:
        - _family_: the downloaded font family
        - _variant_: the downloaded variant
        - _path_: the path of the downloaded file

Download specified variants of the font in the current directory (where the script is called).

##### `install(variants, callback)`
- variants [String|Array] A string of the variant or an array with multiple variants.
- callback(err, result) [Function] Optional callback with eventually an error obj and and the result Array of Objects.
    - result [Array] An Array containing one object for each installed file, with the following properties:
        - _family_: the installed font family
        - _variant_: the installed variant
        - _path_: the path of the installed file

Install specified variants of the font. The destination folder depends on the platform used:
- Linux: _~/.fonts/_
- OSX: _~/Library/Fonts/_
- Windows: The file is not copied into c:\Windows\Fonts, but is used a WScript that install the font invoking the font install windows function.

### Exemples
```js
var GoogleFontlist = require('google-font-installer');

var fontList = new GoogleFontlist('VALID_API_KEY');

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
```
