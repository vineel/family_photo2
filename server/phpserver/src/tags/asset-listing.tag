<asset-listing>
	<div class="container">
		<asset each={ data in assets }></asset>
	</div>
	<script>
		var thisTag = this;

		thisTag.assets = thisTag.opts.assets;

		console.log("asset-listing:", thisTag.opts.assets);

	</script>
	<style scoped>
		.container {
			display: flex;
			flex-direction: row;
			justify-content: flex-center;
			align-items: flex-center;
			flex-wrap: wrap;
		}

	</style>
</asset-listing>