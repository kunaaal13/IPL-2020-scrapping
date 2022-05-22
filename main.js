const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595';
const baseUrl = 'https://www.espncricinfo.com/';

const request = require('request');
const cheerio = require('cheerio');
const allMatches = require('./allMatch');
const fs = require('fs');
const path = require('path');

//ipl folder
const iplPath = path.join(__dirname, 'ipl');
dirCreater(iplPath);

request(url, (err, res, html) => {
  if (err) {
    console.error(err);
  } else {
    // console.log(html);

    extractLinks(html);
  }
});

// Get view all matches link from homepage
function extractLinks(html) {
  const $ = cheerio.load(html);
  let anchorElem = $(
    '.ds-block.ds-text-center.ds-uppercase.ds-text-ui-typo-primary.ds-underline-offset-4'
  );
  let link = anchorElem.attr('href');
  let fullLink = baseUrl + link;

  allMatches.getAllMatchesLink(fullLink);
}

function dirCreater(filePath) {
  if (fs.existsSync(filePath) == false) {
    fs.mkdirSync(filePath);
  }
}
