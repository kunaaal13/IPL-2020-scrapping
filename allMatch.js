const request = require('request');
const cheerio = require('cheerio');
const baseUrl = 'https://www.espncricinfo.com/';
const scoreCard = require('./scorecard');

function getAllMatchesLink(url) {
  request(url, function (err, response, html) {
    if (err) {
      console.log(err);
    } else {
      extractAllLinks(html);
    }
  });
}

function extractAllLinks(html) {
  let $ = cheerio.load(html);
  let scorecardElems = $('a.ds-text-ui-typo.ds-underline-offset-4');

  for (let i = 0; i < scorecardElems.length; i++) {
    if (
      $(scorecardElems[i])
        .html()
        .includes('<span class="ds-text-compact-xs ds-font-medium">Scorecard</span>')
    ) {
      let link = $(scorecardElems[i]).attr('href');
      let fullLink = baseUrl + link;
      scoreCard.processScorecard(fullLink);
    } else {
      continue;
    }
  }
}

module.exports = {
  getAllMatchesLink: getAllMatchesLink,
};
