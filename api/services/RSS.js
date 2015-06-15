var config = sails.config.app_const;
var xmlParser = require('xml2js');
var http = require('http');
async = require("async");


module.exports = {
  update_latest_rss: function(){
    DEBUG.success("START updating feeds for all categories");
    async.each(config.rss_categories,
      function(category, callback){
        // console.log("Processing " + category.name);
        RSS.update_single_category(category, callback);
      },

      function(error){
        console.log("DONE");
      }
    );
  },

  update_single_category: function(category, updateCb){
    var url = category.link;
    http.get(url, function(res) {
      res.setEncoding('utf8');

      DEBUG.success("Link " + url + " requested");
      DEBUG.success("Response code = " + res.statusCode);
      var content = "";

      res.on("data", function(chunk) {
        content += chunk;
      });

      res.on('end', function() {
        xmlParser.parseString(content, function(error, feed_json){
          if(error || typeof(feed_json) != 'undefined'){
            try{
              var feed_list = feed_json["rss"]["channel"][0]["item"];
              async.each(feed_list,
                function(feed, callback){
                  Feed.find({title: feed["title"]}).exec(function onNewFeedCreated(error, found){
                    if(error) return console.error(error);
                    if(found.length == 0){
                      feed.category = category.name;
                      feed.relate = [];
                      Feed.create(feed).exec(function(error, new_feed){
                        if(error) return consle.error(error);
                        if(new_feed){
                          console.log("Found new feed " + new_feed.title + " for category = " + category.name);
                          sails.sockets.blast('onNewFeed'+category.name, {status: true, feed: new_feed});
                          callback();
                        }
                      });
                    }else{
                      callback();
                    }
                  });
                },
                function(error){
                  console.log("DONE " + category.name);
                  updateCb();
                  return true;
                });
            }catch(err){
              console.log("ERROR " + category.name);
              updateCb();
              return false;
            }

          }else{
            Console.log("FAILED " + category.name);
            updateCb();
            return false;
          }
        });
      });

    }).on('error', function(e) {
      DEBUG.error("ERROR requesting feed link " + url);
      DEBUG.error(e.message);
    });
  },

  update_related_feed: function(){
    console.log("Finding matches...");
    async.series([
      function(callback){
        // Feed.find([{category: "top"},{category:"trend"}]).populate('relate').exec(function onAllFeedFound(error, feeds){
        Feed.find(config.rss_similar_category).populate('relate').exec(function onAllFeedFound(error, feeds){
          if(error) return console.error(error);
          if(feeds.length > 0){
            var feed;
            for(var i in feeds){
              if(feeds[i].similar_found == false && feeds[i].relate.length == 0){
                feed = feeds[i];
                break;
              }
            }
            if(feed){
              var web_agent = require('cheerio-httpcli');
              var url_encode = require("querystring");
              var encoded_query = url_encode.escape(feed.title);

              web_agent.fetch('http://www.google.co.jp/search',{q: feed.title}, function(err, $, res, body){
                var title_link;
                var main_feed = feed;
                if(typeof($) != 'undefined'){
                  var search_results = $('#rso .srg li.g');
                  if(search_results){
                    console.log("There are total " + search_results.length + " from Google matching " + main_feed.title);
                    search_results = search_results.slice(0,4);
                    async.each(search_results,
                      function(result, callbackx){
                        title_link = $(result).find('h3');
                        var feed = {
                          title: title_link.text(),
                          link: title_link.find('a').attr('href'),
                          description: $(result).find('span.st').text()
                        };
                        SimilarFeed.findOrCreate({title: feed["title"]},feed).exec(function onNewFeedCreated(error, new_feed){
                          if(error) return console.error(error);
                          if(new_feed){
                            main_feed.relate.add(new_feed.id);
                            main_feed.save(function(error){
                              if(error) return console.error(error);
                              DEBUG.success("Match " + main_feed.title + " with feed " + new_feed.title);
                              sails.sockets.blast('onNewRelateFound',{status: true, feed: main_feed, relate: new_feed});
                              callbackx();
                              // return true;
                            });
                          }
                        });
                      },

                      function(error){
                        console.log("DONE FETCHING " + search_results.length + " RELATED FEEDs FOR " + feed.title);
                        Feed.update({title: feed.title},{similar_found: true}).exec(function onUpdateFeed(error, feed){
                          callback(null, feed);
                        });
                      }
                    );
                  }else{
                    Feed.update({title: feed.title},{similar_found: true}).exec(function onUpdateFeed(error, feed){
                      callback(null, {title: 'NONE'});
                    });
                    console.log("COULD NOT FETCH FEES FOR " + feed.title);
                  }
                }else{
                  callback(null, {title: 'NONE'});
                  console.log("COULD NOT FETCH FEES FOR " + feed.title);
                }
              });
            }else{
              callback(null, {title: 'NONE'});
              console.log("THERE IS NO FEED NEEDED TO FIND MATCH");
            }
          }else{
            callback(null, {title: 'NONE'});
            console.log("THERE IS NO FEEDS");
          }
        });
      }
    ], function(error, results){
      setTimeout(function(){
        RSS.update_related_feed();
      },randomInterval());
    });

  }
};

function randomInterval(){
  var _to = 9;
  var _from = 1;
  return (1000*Math.floor(Math.random() * (_to - _from + 1)) + _from);
}
