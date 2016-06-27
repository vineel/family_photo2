<slideshow-viewer>
<div id="box">
	<div id='big_img_div'>
		<img id="big_img" src="">
	</div>
	<div id="container">
		<div class="one_family" each={ family, index in families }>
			<asset-listing assets={ parent.assetsByFamily[family.family_extid] }></asset-listing>
			<family-name family={ family }></family-name>
		</div>
	</div>
	<div id="pan_cover">
	</div>
</div>
	<style scoped>
		#box {
			background-color: green;
			border: 2px solid #aa0;
		}
		#container {
			display: flex;
			justify-content: left;
			align-content: left;
			/*background-color: red;*/
			position:absolute;
		}
		#big_img_div { 
			width:  500px; height:300px; overflow:visible;
			display: flex; justify-content: center; align-content: center;
		}
		.one_family {
			/*margin-right: 20px;*/
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
		var thisTag = this;
		var Hammer = require('hammerjs');

		thisTag.data = {};
		thisTag.account = {};
		thisTag.assets = [];
		thisTag.families = [];
		thisTag.assetsByFamily = {};
		thisTag.zoomedAsset = null;

		var rowjam = require('rowjam');

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
					zoom_img(thisTag.assets[0]);
					thisTag.update();
				}
			);
		};

		thisTag.slidehowPanner = null;
		var installEventHandlers = function() {
			// var container = document.getElementById('container');
			var container = thisTag.container;
			// var panCover = document.createElement('div');
			var panCover = thisTag.pan_cover;
			thisTag.slideshowPanner =  new Hammer(panCover);
			thisTag.slideshowPanner.on("panstart panleft panright panend tap press", function(ev) {
				console.log("HAMMER: type:",ev.type, " additionalEvent:", ev.additionalEvent, " dX:", ev.deltaX, " vX:", ev.vX);
				if (ev.type === 'panstart') {
					startPan();
				} else if (ev.type === 'panleft' || ev.type === 'panright') {
					doPan(ev.type, ev.deltaX);
				} else if (ev.type === "panend") {
					endPan();
				}
			});
		}


		var asPx = function(val) {
			if (val === "") {
				return "0px";
			}
			if (typeof(val) === "number") {
				return val + "px";
			}
			if (typeof(val) === "string") {
				if (val.indexOf("px") >= 0) {
					return val;
				}
				return val + "px";
			}
			return val;
		}

		var asNum = function(val) {
			if (typeof(val) === "number") {
				return val;
			}
			if (typeof(val) === "string") {
				if (val === "") {
					return 0;
				}
				if (val.indexOf("px") >= 0) {
					var intStr = val.substr(0, val.length -2);
					return parseInt(intStr);
				}
				return parseInt(val);
			}
			return val;
		}

		var cEl = thisTag.container;
		var slideX = 0;
		var slidingMargin = 250;
		var setSlidePos = function(x) {
			thisTag.container.style.left = asPx(x);
		}
		var getSlidePos = function() {
			console.log("1. thisTag.container.style.left:", thisTag.container.style.left);
			var tmp = asNum(thisTag.container.style.left);
			console.log("2. ", tmp);
			return asNum(thisTag.container.style.left);
		}
		var getSlideWidth = function() {
			var w = thisTag.container.offsetWidth;
			return asNum(w);
		}
		var startPan= function() {
			slideX = getSlidePos();
			console.log("START PAN left:", slideX);
		}
		var doPan = function(direction, dX) {
			var newX = asNum(slideX) + dX;
			console.log("slideX:", slideX, ' dX:', dX);
			if (newX > slidingMargin) {
				return;
			}
			var w = getSlideWidth();
			var wPanCover = thisTag.pan_cover.offsetWidth;
			console.log("right limit: ", (w - wPanCover));

			if (newX < -(w - wPanCover + slidingMargin)) {
				return;
			}
			setSlidePos(newX);
			thisTag.update();
			console.log("NEW LEFT:", thisTag.container.style.left);
		};
		var endPan = function() {
			var x = getSlidePos();
			if ( x > 0) {
				setSlidePos(0);
			}
			var w = getSlideWidth();
			var wPanCover = thisTag.pan_cover.offsetWidth;
			if (x < -(w - wPanCover)) {
				setSlidePos(-(w - wPanCover));
			}
		}

		var processData = function(data) {
			thisTag.data = data;
			thisTag.assets = data.assets;
			thisTag.account = data.account;
			thisTag.families = data.families;

			var jam = rowjam(data.assets, true);
			thisTag.assetsByFamily = jam.toLookup("family_extid")
			// console.log("families:", JSON.stringify(thisTag.assetsByFamily, null, 2));
			thisTag.familyKeys = jam.values('family_extid', true);
			console.log("familyList...",thisTag.families);
			console.log("assets...", thisTag.assetsByFamily);
		}

		thisTag.on('mount', function() {
			console.log("mount asset-container");
			getSlideData('vineel@vineel.com', '2016-05-11');
		});

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

		var zoom_img = function(asset) {
			thisTag.big_img.src = '/photos/' + asset.url;
			var newDim = scaleToFit(asset.width, asset.height, $('#big_img_div').width(), $('#big_img_div').height());
			thisTag.big_img.width = newDim[0];
			thisTag.big_img.height = newDim[1];
		};

		// register the notificationCenter throughout the app
		riot.mixin("notificationcenter", notificationCenter);
		notificationCenter.listenTo('zoom_img', zoom_img);

	</script>

</slideshow-viewer>