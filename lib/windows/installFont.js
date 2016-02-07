if (WScript.Arguments.length === 1) {
	var path = WScript.Arguments(0);
	var pathParts = path.split("\\");
	var filename = pathParts.pop();
	var folder = pathParts.join("\\");
	var objShell = new ActiveXObject("shell.application");
	var objFontFolder = objShell.NameSpace(folder);
	var objFontFolderItem = objFontFolder.ParseName(filename);
	objFontFolderItem.InvokeVerb("Install");
}
