<gallery>
	<!-- Root element of PhotoSwipe. Must have class pswp. -->
	<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">

	    <!-- Background of PhotoSwipe. 
	         It's a separate element as animating opacity is faster than rgba(). -->
	    <div class="pswp__bg"></div>

	    <!-- Slides wrapper with overflow:hidden. -->
	    <div class="pswp__scroll-wrap">

	        <!-- Container that holds slides. 
	            PhotoSwipe keeps only 3 of them in the DOM to save memory.
	            Don't modify these 3 pswp__item elements, data is added later on. -->
	        <div class="pswp__container">
	            <div class="pswp__item"></div>
	            <div class="pswp__item"></div>
	            <div class="pswp__item"></div>
	        </div>

	        <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
	        <div class="pswp__ui pswp__ui--hidden">

	            <div class="pswp__top-bar">

	                <!--  Controls are self-explanatory. Order can be changed. -->

	                <div class="pswp__counter"></div>

	                <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>

	                <button class="pswp__button pswp__button--share" title="Share"></button>

	                <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>

	                <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>

	                <!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->
	                <!-- element will get class pswp__preloader--active when preloader is running -->
	                <div class="pswp__preloader">
	                    <div class="pswp__preloader__icn">
	                      <div class="pswp__preloader__cut">
	                        <div class="pswp__preloader__donut"></div>
	                      </div>
	                    </div>
	                </div>
	            </div>

	            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
	                <div class="pswp__share-tooltip"></div> 
	            </div>

	            <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
	            </button>

	            <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
	            </button>

	            <div class="pswp__caption">
	                <div class="pswp__caption__center"></div>
	            </div>
	        </div>
	    </div>

	<script>
		var prefix = window.MEDIA_SERVER_PREFIX + "photos/"
		var thisTag = this
		var notificationCenter = riot.mixin('notification_center');
		thisTag.assets = []
		thisTag.items = []
		thisTag.gallery = null

		thisTag.indexOfAsset = function(assetIdToFind) {
			for (var i=0; i<thisTag.assets.length; i++) {
				var asset = thisTag.assets[i]
				if (asset.asset_id === assetIdToFind) {
					return i;
				}
			}
			return 0;
		}

		notificationCenter.listenTo('got_data', function(data, assetIdToShow) {
			thisTag.assets = data
			thisTag.items = []
			for (var i=0; i<data.length; i++) {
				var asset = data[i]
				var item = {
					src: prefix + asset.url,
					w: asset.width,
					h: asset.height
				}
				thisTag.items.push(item)
			}

			var firstAsset = thisTag.indexOfAsset(assetIdToShow)
			thisTag.showGallery(firstAsset)
		})


		

		showGallery(firstAsset) {
			var pswpElement = document.querySelectorAll('.pswp')[0];

			// define options (if needed)
			var options = {
			    index: firstAsset
			};

			// Initializes and opens PhotoSwipe
			console.log("PhotoSwipe", PhotoSwipe)
			thisTag.gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, thisTag.items, options);
			thisTag.gallery.init();
		}
	</script>


	<style scoped>
	#lightbox {
		background-color: rgba(255,255,255,120);
		color: #F00;
	}
	</style>
</gallery>