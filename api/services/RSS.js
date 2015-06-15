var config = sails.config.app_const;
var xmlParser = require('xml2js');
var http = require('http');

module.exports = {
  update_latest_rss: function(){
    DEBUG.success("START updating feeds");
    for(var category in config.rss_categories){
      setTimeout(function(){
        RSS.update_single_category(category);
      }, config.INTEVAL_UPDATE_BETWEEN_CATEGORY);
    }
  },

  update_single_category: function(category, updateCb){
    var url = this.generate_url_for_category(category);
    http.get(url, function(res) {
      DEBUG.success("Link " + url + " requested");
      DEBUG.success("Response code = " + res.statusCode);
      var content = "";

      res.on("data", function(chunk) {
        content += chunk;
      });

      res.on('end', function() {
        xmlParser.parseString(content, function(error, feed_json){
          var feed_list = feed_json["rss"]["channel"][0]["item"];
          // for(var i in feed_list){
          async.map(feed_list, function iterator (feed, mapCb){
            // var feed = feed_list[i];
            // console.log(feed.title);
            Feed.find({title: feed["title"]}).exec(function onNewFeedCreated(error, found){
              if(error) return mapCb(error);
              if(found.length==0){
                Feed.create(feed).exec(function(error, new_feed){
                  //Feed being added into DB
                  if(error) return mapCb(error);
                  if(new_feed){
                    DEBUG.success(new_feed.title + " added as in category = " + config.rss_categories[category]);
                    setTimeout(function(){
                      RSS.find_related_feed(new_feed.id);
                    }, config.INTERVAL_FIND_RELATE_FEED);
                    return mapCb(null, {});
                  }
                });
              }
            });
          });

        });
      });

    }).on('error', function(e) {
      DEBUG.error("ERROR requesting feed link " + url);
      DEBUG.error(e.message);
    });
  },

  find_related_feed: function(_feed_id){
    Feed.findOne({id: _feed_id}).populate('relate').exec(function onFeedFound(error, feed){
      if(error) return DEBUG.error(error);
      if(feed){
        var web_agent = require('cheerio-httpcli');
        var url_encode = require("querystring");
        var encoded_query = url_encode.escape(feed.title);
        // console.log(encoded_query);
        web_agent.fetch('http://www.google.co.jp/search',{q: feed.title}, function(err, $, res, body){
          // var results = [];
          var title_link;
          var main_feed = feed;
          $('#rso .srg li.g').each(function (index) {
            if(index<3){
              title_link = $(this).find('h3');
              var feed = {
                title: title_link.text(),
                link: title_link.find('a').attr('href'),
                descrip: $(this).find('span.st').text()
              };
              SimilarFeed.findOrCreate({title: feed["title"]},feed).exec(function onNewFeedCreated(error, new_feed){
                if(error){
                  DEBUG.error(error);
                }
                if(new_feed){
                  // console.log(main_feed);
                  main_feed.relate.add(new_feed.id);
                  main_feed.save(function(error){
                    if(error){
                      DEBUG.error(error);
                    }else{
                      DEBUG.success("Match " + main_feed.title + " with feed " + new_feed.title);
                    }
                  });
                }
              });
            }else{
              return false;
            }
          });
        });
      }
    });
  },

  generate_url_for_category: function(_category){
    if(_category){
      return (config.rss_url_root + _category + "." + config.rss_url_extension);
    }else{
      return false;
    }
  }
};
