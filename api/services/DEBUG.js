var config = sails.config.app_const;

module.exports = {
  error: function(data){
    console.log("::DEBUG::ERROR::");
    console.error(data);
  },

  success: function(data){
    console.log("::DEBUG::SUCCESS::", data);
  },
};
