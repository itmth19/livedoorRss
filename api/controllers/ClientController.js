var config = sails.config.app_const;
async = require("async");

module.exports = {
  init: function (req, res) {
    if(req.isSocket == true){
      res.json({
        status: true,
        categories: config.rss_categories
      })
    }
  },
  requestfeed: function(req, res){
    var _socket_id = sails.sockets.id(req.socket);
    // var result = [];
    var categories = config.rss_categories;
    async.each(categories,
    function(_category, callback){
      Feed.find({where:{category:_category.name}, sort: 'createdAt DESC'}).limit('10').populate('relate',{limit: 3}).exec(function onFeedFound(error, feeds){
        if(error) return console.error(error);
        if(feeds.length > 0){
          // result[_category] = feeds;
          sails.sockets.emit(_socket_id, 'onFeed', {status: true, category:_category.name, feeds: feeds});
          callback();
        }else{
          callback();
        }
      });
    },

    function(error){
      console.log("Send all feeds to cilent");

    });

    res.json({
      status: true
    })
  }
}
