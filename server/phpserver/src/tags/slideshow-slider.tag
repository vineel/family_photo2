<slideshow-slider>
	<div id='big_img_div'>
		<img id="big_img" src="">
	</div>
	<div id="container">
		<div each={ family, index in families }>
			<family-name family={ family }></family-name>
			<asset-listing assets={ parent.assetsByFamily[family.family_extid] }></asset-listing>
		</div>

	</div>
	<style scoped>
		#big_img_div { 
			width:  500px; height:300px; background-color: green;overflow:visible;
			display: flex; justify-content: center; align-content: center;
		}
	</style>
	<script>
		var thisTag = this;
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
					// processData(data);
					// zoom_img(thisTag.assets[0]);
					// thisTag.update();
				}
			);
		};

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

</slideshow-slider>