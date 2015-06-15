// var config = sails.config.app_const;

/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  sails.on('lifted', function() {
    console.log("====livedoorRSS====");
    console.log("::SERVER STARTED::");
    console.log("::FETCH FEEDS IN 30 SECONDS...");
    setInterval(function(){
      RSS.update_latest_rss();
    }, 30000);
    // RSS.find_related_feed("557daffc7612267a0a6bf0b9");
    setTimeout(function(){
      RSS.update_related_feed();
    }, 40000);
  });

  cb();
};
