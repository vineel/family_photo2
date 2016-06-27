<slide-tray>
<div id="box">
	<div each={ family, index in families }>
		<div class="family_name">{ family.display_name }</div>
		<div class="family_thumbs">
			<div each={ asset in parent.assetsByFamily[family.family_extid] } class="placeholder"  id={ asset.id } onclick={ tapThumb }>
			<img src="../thumbs/{ asset.size1_url }">
			</div>

		</div>
	</div>
</div>
<div id="overlay" onclick={ tapOverlay }>
	<img id="big_img" src="../photos/user_photo-1463021663937.jpg" onclick={ tapZoom }>
</div>
	<style>
		body {
			background-color: #000;
		}
	</style>
	<style scoped>
		#overlay {
			background-color: rgba(0, 0, 0, 0.7);
			width:200px;
			height:200px;
			position: absolute;
			left:0;
			top:0;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			visibility: hidden;
		}
		#box {
			border: 2px solid #aa0;
			background-color:red;
		}
		.family_name {
			margin-top:20px;
		}
		.family_thumbs {
			display: flex;
			justify-content: left;
			flex-direction: row;
			flex-wrap: wrap;
		}
		.placeholder {
			width: 200px;
			height: 200px;
			background-color: #aaa;
			margin-right: 2px;
			margin-bottom: 2px;
			/*border-right:1px solid transparent;			*/
		}
		.placeholder img {
			width: 200px;
			height: 200px;
		}


		#container {
			display: flex;
			justify-content: left;
			align-content: left;
		}
		#big_img_div { 
			width:  500px; height:300px; overflow:visible;
			display: flex; justify-content: center; align-content: center;
		}
		.thumb_wrapper {
			width: 150px;
			height: 150px;
		}
		.thumb_img {
		width: 150px;
			height: 150px;
		}
		.one_family {
			display: flex;
			flex-direction: column;
			justify-content: left;
			align-content: left;
		}
		#pan_cover {
			/*background-color: green;*/
			border: 1px solid #fff;
			width: 500px;
			height:144px;
			position:absolute;
			left:0px;
			top:304px;
			cursor:pointer;
		}
	</style>
	<script>
		var thisTag = this
		var Hammer = require('hammerjs')

		thisTag.data = {}
		thisTag.account = {}
		thisTag.assets = []
		thisTag.families = []
		thisTag.assetsByFamily = {}
		thisTag.zoomedAsset = null

		var rowjam = require('rowjam')

		tapThumb(e) {
			console.log("tap: ", e)
			zoom_img(e.item.asset)
		}

		tapZoom(e) {
			e.cancelBubble = true
			var w = e.target.width
			var x = e.offsetX
			console.log("tapZoom w, x", w, x)
			if (x > w / 2) {
				show_image(1)
			} else {
				show_image(-1)
			}

			console.log("scroll",window.scroll)
		}


		tapOverlay(e) {
			unzoom_img()
			thisTag.box.style.display = 'block'
			thisTag.update()
			$(document).scrollTop(thisTag.savedScroll)
		}

		var getSlideData = function(srcEmail, dayStr) {
			$.getJSON( "api/index.php/slideshow",
				{
					email: srcEmail,
					day: dayStr
				},
				function( data ) {
					console.log("data", JSON.stringify(data));
					installEventHandlers();

					processData(data);
					// zoom_img(thisTag.assets[0]);
					thisTag.update();
				}
			)
		}

		thisTag.slidehowPanner = null
		var installEventHandlers = function() {
			
			// var container = document.getElementById('container');
			// var container = thisTag.container;
			// var panCover = document.createElement('div');
			// var panCover = thisTag.pan_cover;
			// thisTag.slideshowPanner =  new Hammer(panCover);
			// thisTag.slideshowPanner.on("panstart panleft panright panend tap press", function(ev) {
			// 	console.log("HAMMER: type:",ev.type, " additionalEvent:", ev.additionalEvent, " dX:", ev.deltaX, " vX:", ev.vX);
			// 	if (ev.type === 'panstart') {
			// 		startPan();
			// 	} else if (ev.type === 'panleft' || ev.type === 'panright') {
			// 		doPan(ev.type, ev.deltaX);
			// 	} else if (ev.type === "panend") {
			// 		endPan();
			// 	}
			// });
		}


		var asPx = function(val) {
			if (val === "") {
				return "0px"
			}
			if (typeof(val) === "number") {
				return val + "px"
			}
			if (typeof(val) === "string") {
				if (val.indexOf("px") >= 0) {
					return val
				}
				return val + "px"
			}
			return val
		}

		var asNum = function(val) {
			if (typeof(val) === "number") {
				return val
			}
			if (typeof(val) === "string") {
				if (val === "") {
					return 0
				}
				if (val.indexOf("px") >= 0) {
					var intStr = val.substr(0, val.length -2)
					return parseInt(intStr)
				}
				return parseInt(val)
			}
			return val
		}

		// var cEl = thisTag.container
		// var slideX = 0
		// var slidingMargin = 250
		// var setSlidePos = function(x) {
		// 	thisTag.container.style.left = asPx(x)
		// }
		// var getSlidePos = function() {
		// 	console.log("1. thisTag.container.style.left:", thisTag.container.style.left);
		// 	var tmp = asNum(thisTag.container.style.left);
		// 	console.log("2. ", tmp);
		// 	return asNum(thisTag.container.style.left);
		// }
		// var getSlideWidth = function() {
		// 	var w = thisTag.container.offsetWidth;
		// 	return asNum(w);
		// }
		// var startPan= function() {
		// 	slideX = getSlidePos();
		// 	console.log("START PAN left:", slideX);
		// }
		// var doPan = function(direction, dX) {
		// 	var newX = asNum(slideX) + dX;
		// 	console.log("slideX:", slideX, ' dX:', dX);
		// 	if (newX > slidingMargin) {
		// 		return;
		// 	}
		// 	var w = getSlideWidth();
		// 	var wPanCover = thisTag.pan_cover.offsetWidth;
		// 	console.log("right limit: ", (w - wPanCover));

		// 	if (newX < -(w - wPanCover + slidingMargin)) {
		// 		return;
		// 	}
		// 	setSlidePos(newX);
		// 	thisTag.update();
		// 	console.log("NEW LEFT:", thisTag.container.style.left);
		// };
		// var endPan = function() {
		// 	var x = getSlidePos();
		// 	if ( x > 0) {
		// 		setSlidePos(0);
		// 	}
		// 	var w = getSlideWidth();
		// 	var wPanCover = thisTag.pan_cover.offsetWidth;
		// 	if (x < -(w - wPanCover)) {
		// 		setSlidePos(-(w - wPanCover));
		// 	}
		// }

		var processData = function(data) {
			thisTag.data = data
			thisTag.assets = data.assets
			thisTag.account = data.account
			thisTag.families = data.families

			var jam = rowjam(data.assets, true)
			thisTag.assetsByFamily = jam.toLookup("family_extid")
			// console.log("families:", JSON.stringify(thisTag.assetsByFamily, null, 2));
			thisTag.familyKeys = jam.values('family_extid', true)
			console.log("familyList...",thisTag.families)
			console.log("assetsByFamily...", thisTag.assetsByFamily)

			thisTag.assets = []
			for (var f=0; f<thisTag.families.length; f++) {
				var familyExitId = thisTag.families[f].family_extid
				var familyAssets = thisTag.assetsByFamily[familyExitId]
				for (var a=0; a<familyAssets.length; a++) {
					var asset = familyAssets[a]
					thisTag.assets.push(asset)
				}
			}
			console.log(JSON.stringify(thisTag.assets, null, 2))

		}

		thisTag.on('mount', function() {
			console.log("mount asset-container");
			getSlideData('vineel@vineel.com', '2016-05-11');
			// this.fitBoxToScreen()
		});

		var fitBoxToScreen = function() {
			thisTag.update()
			var sw = window.innerWidth;
			var sh = window.innerHeight;
			// console.log("screen wh, ", sw, sh);
			thisTag.box.style.width = asPx(sw);
			thisTag.box.style.height = asPx(sh);
			thisTag.update()

		}

		var notificationCenter = {
			notifications: riot.observable(),
			listenTo: function (eventStr, eventFn) {
				this.notifications.on(eventStr, eventFn);
			},
			send: function(eventStr, p1, p2, p3) {
				this.notifications.trigger(eventStr, p1, p2, p3);
			}
		};

		var scaleToFit = function(imgW, imgH, maxW, maxH) {

			// calculate horiz ratio
			var wRatio = maxW *1.0 / imgW;
			var hRatio = maxH * 1.0 / imgH;
			var ratio = Math.min(wRatio, hRatio);
			console.log("wRatio:", wRatio, ' hRatio:', hRatio, ' ratio:', ratio);
			var newW = ratio * imgW;
			var newH = ratio * imgH;
			return [newW, newH];
		};

		// thisTag.getPageScroll = function() {
		// 	debugger
		// 	var doc = window.document;
		// 	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0)
		// 	return top
		// }

		var zoom_img = function(asset) {
			thisTag.update()
			var sw = window.innerWidth;
			var sh = window.innerHeight;
			// console.log("screen wh, ", sw, sh);
			thisTag.overlay.style.width = asPx(sw);
			thisTag.overlay.style.height = asPx(sh);

			var zoomScale = 0.8; // % of screen
			var boxW = sw * zoomScale;
			var boxH = sh * zoomScale;
			var imgSize = scaleToFit(asset.width, asset.height, boxW, boxH);
			// console.log("imgSize:", imgSize);
			thisTag.big_img.src = '/photos/' + asset.url;
			// console.log(this.big_img.src);
			thisTag.big_img.style.width = asPx(imgSize[0]);
			thisTag.big_img.style.height = asPx(imgSize[1]);
			thisTag.overlay.style.visibility = "initial"

			thisTag.zoomedAsset = asset


			thisTag.savedScroll = $(document).scrollTop()
			console.log("savedScroll=",  thisTag.savedScroll)
			thisTag.box.style.display = 'none'
		};



		var unzoom_img = function() {
			console.log("unzoom_img")
			thisTag.overlay.style.visibility = "hidden";
			thisTag.zoomedAsset = null
		};

		var show_image = function(direction) {
			var jam = rowjam(thisTag.assets, false)
			var idx = jam.indexOf('asset_id', '===', thisTag.zoomedAsset.asset_id);
			var nextIndex  = idx + direction
			if (nextIndex > thisTag.assets.length -1) {
				nextIndex = 0
			} else if (nextIndex < 0) {
				nextIndex = thisTag.assets.length -1
			}
			console.log(nextIndex)
			var nextAsset = thisTag.assets[nextIndex]
			console.log(nextAsset)
			zoom_img(nextAsset)
		}

		// // register the notificationCenter throughout the app
		// riot.mixin("notificationcenter", notificationCenter);
		// notificationCenter.listenTo('zoom_img', zoom_img);

		// console.log("hello 1")

	</script>

</slide-tray>