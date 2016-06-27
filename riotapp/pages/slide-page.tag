<slide-page>
  <gallery></gallery>
  <div id="box">
    <div each={ family, index in families }>
      <div class="family_name">{ family.display_name }</div>
      <div class="family_thumbs">
        <div each={ asset in parent.assetsByFamily[family.family_extid] } class="placeholder"  
             id={ asset.id } onClick={ tapThumb }>
             <img src={ window.MEDIA_SERVER_PREFIX + "thumbs/" + asset.size1_url }>
        </div>
      </div>
    </div>
  </div>


  <script>
    var thisTag = this
    var rowjam = require('rowjam')
    var notificationCenter = riot.mixin('notification_center');

    tapThumb(e) {
      console.log("tap thumb!", e)
      var tapAssetId = e.item.asset.asset_id
      notificationCenter.send('got_data', thisTag.assets, tapAssetId)
    }

    /* takes slide JSON and massages it to be useful */
    var processData = function(data) {
      thisTag.data = data;
      thisTag.assets = data.assets;
      thisTag.account = data.account;
      thisTag.families = data.families;

      var jam = rowjam(data.assets, true);
      thisTag.assetsByFamily = jam.toLookup("family_extid")
      // console.log("families:", JSON.stringify(thisTag.assetsByFamily, null, 2));
      thisTag.familyKeys = jam.values('family_extid', true);
      // console.log("familyList...",thisTag.families);
      // console.log("assets...", thisTag.assets);

      // notificationCenter.send('got_data', thisTag.assets)
    }

    /* retrieve slide JSON from server */
    var getSlideData = function(srcEmail, dayStr) {
      $.getJSON( window.API_SERVER_PREFIX + "api.php/slideshow",
        {
          email: srcEmail,
          day: dayStr
        },
        function( data ) {
          console.log("data", JSON.stringify(data));
          // installEventHandlers();

          processData(data);
          // zoom_img(thisTag.assets[0]);
          thisTag.update();
        }
      )
    }

    this.on('mount', function() {
      getSlideData('vineel@vineel.com', '2016-05-11');
    })
  </script>

    <style scoped>
    #box {
      border: 2px solid #aa0;
      background-color:#000;
      color:#ddd;
    }
    .family_name {
      font-family: "Helvetica Nueue", "Arial";
      font-size:18px;
      margin-top:20px;
    }
    .family_thumbs {
      display: flex;
      justify-content: left;
      flex-direction: row;
      flex-wrap: wrap;
    }
    .placeholder {
      width: 200px;
      height: 200px;
      background-color: #aaa;
      margin-right: 2px;
      margin-bottom: 2px;
      /*border-right:1px solid transparent;     */
    }
    .placeholder img {
      width: 200px;
      height: 200px;
    }
  </style>
</slide-page>