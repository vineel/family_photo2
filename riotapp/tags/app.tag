<app>
	<div>
		<div id="content"></div>
	</div>
	<script>
		// keep a reference to this tag across all contexts
		var thisTag = this;

		// tell riot router to start routing
		riot.route.start(true);

		// tell riot router to make urls that look like this:
		// http://localhost:3000/#/...
		riot.route.base('#/')


		thisTag.on('mount', function() {
			// tell index URL to redirect to the overview page URL
			riot.route('/', function() {
				riot.route('/pages/simple-page');
			});

			// capture any URL that lookslike /pages/sometag and set tagName to sometag
			riot.route('/pages/*', function(tagName) {
				// debugger
				// create instance of tag and insert it into the "content" div
				riot.mount(thisTag.content, tagName, null);
			});

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
		// register the notificationCenter throughout the app
		riot.mixin("notification_center", notificationCenter);

		var utils = {
			getTagById: function(context, tagId) {
				console.log("this.tags", context.tags)
				for (var tagType in context.tags) {
					console.log("tagType", tagType)
					var tagsOfType = context.tags[tagType]
					if (Array.isArray(tagsOfType)) {
						for (var i=0; i<tagsOfType.length; i++) {
							var t = tagsOfType[i]
							console.log("? t.opts.id", t.opts.id, "===", tagId)
							if (t.opts.id === tagId) {
								return t
							}							
						}
					} else {
						if (tagsOfType.opts.id === tagId) {
							return tagsOfType
						}
					}
				}

				return null;
			}

		}
		riot.mixin("utils", utils)

	</script>

</app>