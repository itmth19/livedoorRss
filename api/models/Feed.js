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
    mobile: 'String',
    pubDate: 'Date',
    guid: 'String',
    relate: {
      collection: 'SimilarFeed',
      via: 'feed'
    }
  }
}
