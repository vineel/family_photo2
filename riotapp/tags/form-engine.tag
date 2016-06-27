<form-engine>
	<form id="form">
		<ul>
			<li each={f in fields} id={ f.name }>
				<div class="label">{ f.label }</div>
				<div class="input"><input type='text' name={ f.name } onkeypress={ checkKeys }></div>
			</li>
			<li id="submission">
				Please Wait...
			</li>
		</ul>
	</form>

	<style scoped>
		form ul li {
			display: none;
		}
	</style>

	<script>
		var thisTag = this
		thisTag.fields = []
		thisTag.values = {}
		thisTag.currentFieldIndex = -1

		checkKeys(e) {
			console.log("e",e)
			if (e.keyCode == 13) {
				thisTag.nextField()
				return false
			}
			return true
		}

		thisTag.addField = function (name, type, label, maxLength) {
			thisTag.fields.push({name: name, type: type, label: label, max: maxLength})
			thisTag.values.push('')
			thisTag.update()
		}

		thisTag.renderField = function (index) {
			var f = thisTag.fields[index]
			$("li#" + f.name).css("display","flex")
			$("li#" + f.name + " > div.input > input").focus()
		}

		thisTag.getValueFromDom = function(index) {
			var f = thisTag.fields[index]
			$("li#" + f.name).css("display","flex")
			$("li#" + f.name + " > div.input > input").focus()
		}

		thisTag.hideAll = function() {
			$('li').css('display','none')
		}

		thisTag.nextField = function() {
			if (thisTag.currentFieldIndex === thisTag.fields.length -1) {
				thisTag.submission()
			} else {
				if (thisTag.currentFieldIndex > 0) {

				}
				thisTag.currentFieldIndex += 1
				thisTag.hideAll()
				thisTag.renderField(thisTag.currentFieldIndex)
			}
		}

		thisTag.submission = function() {
			thisTag.hideAll()
			$("li#submission").css("display","flex")
		}

		thisTag.start = function() {
			thisTag.currentFieldIndex = 0;
			thisTag.renderField(thisTag.currentFieldIndex)
		}
	</script>
</form-engine>