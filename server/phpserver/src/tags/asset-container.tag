<asset-container>
	<div>
		<asset each={ asset, index in assets }></asset>
	</div>

	<script>
		var thisTag = this;
		thisTag.assets = [];

		var getSlideData = function(srcEmail, dayStr) {
			$.getJSON( "api/index.php/slideshow",
				{
					email: srcEmail,
					day: dayStr
				},
				function( data ) {
					console.log("data", JSON.stringify(data));
					thisTag.assets = data.assets;
					console.log("asset count=", thisTag.assets.length);
					thisTag.update();
				}
			);
		};

		thisTag.on('mount', function() {
			console.log("mount asset-container");
			getSlideData('vineel@vineel.com', '2016-05-11');
		});
	</script>

	<style scoped>
		div {
			display: flex;
			justify-content: flex-start;
			-webkit-justify-content: flex-start;
			flex-flow: row wrap;
			text-align:left;
			background-color: #000;
			border: 1px solid #111;
			color:#a00;
		}
	</style>
</asset-container>