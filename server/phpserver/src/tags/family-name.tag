<family-name>
<div class='family_name'>{ display_name }</div>

<script>
	var thisTag = this;
	// console.log(thisTag);
	thisTag.on('mount', function() {
		// console.log("mounted:", thisTag.opts.family.display_name);
		thisTag.display_name = thisTag.opts.family.display_name;
		thisTag.update();
	});
</script>

<style>
.family_name {
	color:#eee;
	font-family: Helvetica;
	font-size:1em;
	border-bottom: 1px solid #222;
	padding:.4em;
	padding-left: 0;
	margin-left:0;
	margin-top:10px;
}
</style>
</family-name>