var config = sails.config.app_const;

module.exports = {
  connection: 'MongodbServer',
  // connection: 'MysqlServer',
  // tableName: 'session',
  attributes: {
    category: 'String',
    title: 'String',
    link: 'String',
    description: 'String',
    feed: {
      model: 'Feed',
      via: 'relate'
    }
  }
}
