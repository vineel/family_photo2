<family-section>
	<div class='family_name'>{ display_name }</div>

	<script>
		var thisTag = this;
		thisTag.on('mount', function() {
			thisTag.assets = thisTag.opts.assets;
			thisTag.family = thisTag.opts.family;
			thisTag.display_name = thisTag.family.display_name;
			thisTag.update();
		});
	</script>

	<style>
	.family_name {
		color:#eee;
		font-family: Helvetica;
		font-size:1em;
		border-bottom: 1px solid #eee;
		padding:.4em;
	}
	</style>

</family-section>