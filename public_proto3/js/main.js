console.log("starting main.js")
requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'jquery-3.0.0'
    }
})
requirejs(["vineel", "rowjam", "jquery"], function(vineel, rowjam, $) {
	console.log("inside requirejs.vineel", vineel)
	console.log("defining rowjam", rowjam)

	console.log("JQUERY: ", $)

	window.vineelio = this

	$("#go_do_it").click(myHandler())

	function myHandler(e) {
		console.log("myHandler()")
	}
	// $('#msg').html('hello world')
	// var startGetData = function() {	
	// 	var jam = rowjam(data.assets, true)
	// 	thisTag.assetsByFamily = jam.toLookup("family_extid")
	// 	// console.log("families:", JSON.stringify(thisTag.assetsByFamily, null, 2));
	// 	thisTag.familyKeys = jam.values('family_extid', true)
	// 	console.log("familyList...",thisTag.families)
	// 	console.log("assetsByFamily...", thisTag.assetsByFamily)

	// 	thisTag.assets = []
	// 	for (var f=0; f<thisTag.families.length; f++) {
	// 		var familyExitId = thisTag.families[f].family_extid
	// 		var familyAssets = thisTag.assetsByFamily[familyExitId]
	// 		for (var a=0; a<familyAssets.length; a++) {
	// 			var asset = familyAssets[a]
	// 			thisTag.assets.push(asset)
	// 		}
	// 	}
	// }
	// return {
	// 	startGetData: startGetData
	// }
})