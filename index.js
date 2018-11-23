/**
 * Wood Plugin Module.
 * elasticsearch
 * by jlego on 2018-11-23
 */
const elasticsearch = require('elasticsearch');
const { Util } = require('wood-util')();

module.exports = (app = {}, config = {}) => {
  let client = new elasticsearch.Client(config);

  client.ping({
    requestTimeout: 30000,
  }, function (error) {
    if (error) {
      console.error('elasticsearch cluster is down!');
    } else {
      console.log('elasticsearch is well');
    }
  });

  app.Search = async function({index, type, limit=20, page=1, query = {}}) {
    let searchParams = {
      index,
      type,
      from: (page - 1) * limit,
      size: limit,
      body: {
        query: {
          match: query
        }
      }
    };
    
    const res = await Util.catchErr(client.search(searchParams));
    if(res.err) throw Util.error(res.err);
    let list = [], total = 0, totalpage = 0;
    if(res.data){
      list = res.data.hits.hits.map(item => {
        let newItem = item._source;
        if(item._id) newItem._id = item._id;
        return newItem;
      });
      total = res.data.hits.total;
      totalpage = Math.ceil(res.data.hits.total / limit);
    }
    return {
      list,
      limit,
      page,
      total,
      totalpage
    }
  }

  if(app.addAppProp) app.addAppProp('Search', app.Search);
  return app;
}