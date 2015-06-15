module.exports.app_const = {
  rss_url_root:'http://news.livedoor.com/topics/rss/',
  rss_url_extension: 'xml',
  rss_categories: [
    {label:'主要', name: 'top', link: 'http://news.livedoor.com/topics/rss/top.xml'},
    {label:'国内', name: 'dom', link: 'http://news.livedoor.com/topics/rss/dom.xml'},
    {label:'海外', name: 'int', link: 'http://news.livedoor.com/topics/rss/int.xml'},
    {label:'IT 経済', name: 'eco', link: 'http://news.livedoor.com/topics/rss/eco.xml'},
    {label:'芸能', name: 'ent', link: 'http://news.livedoor.com/topics/rss/ent.xml'},
    {label:'スポーツ', name: 'spo', link: 'http://news.livedoor.com/topics/rss/spo.xml'},
    {label:'映画', name: '52', link: 'http://news.livedoor.com/rss/summary/52.xml'},
    {label:'グルメ', name: 'gourmet', link: 'http://news.livedoor.com/topics/rss/gourmet.xml'},
    {label:'女子', name: 'love', link: 'http://news.livedoor.com/topics/rss/love.xml'},
    {label:'トレンド', name: 'trend', link: 'http://news.livedoor.com/topics/rss/trend.xml'}
  ],
  rss_similar_category:[
    {category: 'top'},
    {category: 'dom'},
    {category: 'int'},
    {category: 'eco'},
    {category: 'ent'},
    {category: 'spo'},
    {category: '52'},
    {category: 'gourmet'},
    {category: 'love'},
    {category: 'trend'}
  ],

  INTERVAL_FIND_RELATE_FEED: 2000,
  INTEVAL_UPDATE_BETWEEN_CATEGORY:30000,
  INTEVAL_UPDATE_RELATE_FEED: 3000,
};
