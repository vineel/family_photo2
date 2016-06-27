<asset>
	<div class="thumb" id={ asset_id }>
		<img id='thumbimg' src="" onclick={ tapThumb }>
	</div>

	<script>
		var thisTag = this;
		thisTag.asset_id = thisTag.opts.asset_id;

		var notificationCenter = riot.mixin('notificationcenter');

		console.log("thisTag.opts", thisTag.data);
		var imgUrl = "/thumbs/" + thisTag.data.size1_url;
		var meta = JSON.parse(thisTag.data.metadata);
		var imgW = meta['size1']['width'];
		var imgH = meta['size1']['height'];
		var orientation = meta['size1']['orientation']; // h or v

		thisTag.on('mount', function() {
			thisTag.thumbimg.src=imgUrl;
			thisTag.thumbimg.width = imgW;
			thisTag.thumbimg.height = imgH;
			thisTag.asset_id = thisTag.data.asset_id;
			thisTag.update();
		});

		tapThumb(e) {
			console.log("clicked data", thisTag.data);
			notificationCenter.send('zoom_img', thisTag.data);
		}
	</script>
	<style scoped>
	.thumb {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		cursor: pointer;
	}
	</style>
</asset>