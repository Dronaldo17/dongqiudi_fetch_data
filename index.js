'use strict';

const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const _ = require('lodash');

const leagueMap = {
  '中超': 51,
  '英超': 8,
  '西甲': 7,
  '德甲': 9,
  '意甲': 13,
  '法甲': 16,
  '欧冠': 10
};

const rankMap = {
  '积分榜': 'team_rank',
  '射手榜': 'goal_rank',
  '助攻榜': 'assist_rank'
};

const dump = (league, rank) => {
  const rst = {
    name: league + rank,
    attr: [],
    data: []
  };

  return requestPromise({
    uri: 'http://dongqiudi.com/data',
    qs: {
      competition: leagueMap[league],
      type: rankMap[rank]
    }
  }).then((html) => {
    const $ = cheerio.load(html);
    $('#stat_detail > .list_1').children().each(function(idx, ele) {
      if ((rank === '积分榜' && idx === 1) || (rank !== '积分榜' && idx === 0)) {
        $(this).children().each(function(idx, ele) {
          rst.attr.push(_.trim($(this).text()));
        });
      } else if ((rank === '积分榜' && idx > 1) || (rank !== '积分榜' && idx > 0)) {
        const itm = {};
        $(this).children().each(function(idx, ele) {
          itm[rst.attr[idx]] = _.trim($(this).text());
        });
        rst.data.push(itm);
      }
    });
    delete rst.attr;
    return rst;
  });
};

Promise.all(_.flatten(_.map(_.keys(leagueMap), (l) => {
  return _.map(_.keys(rankMap), (r) => {
    return dump(l, r);
  });
}))).then((rows) => {
  console.dir(rows, {depth: null});
  return;
}).catch((err) => {
  console.log(err);
});
