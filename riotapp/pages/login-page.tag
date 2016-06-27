<login-page>
	<div class="altbody">
	<h1>Login Page</h1>
		<form-engine id="form1"></form-engine>
	</div>

	<script>
		var thisTag = this
		var utils = riot.mixin("utils")

		thisTag.on('mount', function() {
			console.log(thisTag.formEngine)
			var form = thisTag.tags['form-engine']
			console.log("form", form)
			var ftag = utils.getTagById(thisTag, 'form1')
			console.log("found tag", ftag)
			ftag.addField('first','text','First Name',40)
			ftag.addField('last','text','Last Name',40)
			ftag.start()
		})
	</script>

</login-page>