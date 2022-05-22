const baseUrl = 'https://www.espncricinfo.com/';

const request = require('request');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

function processScorecard(url) {
  request(url, (err, res, html) => {
    if (err) {
      console.error(err);
    } else {
      // console.log(html);

      extractMatchDetails(html);
    }
  });
}

function extractMatchDetails(html) {
  const $ = cheerio.load(html);
  let result = $('p.ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title>span').text();

  let details = $('div.ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid').text();
  let finalDetails = details.slice(0, details.indexOf('<')).split(',');

  let venue = finalDetails[1].trim();
  let date = finalDetails[2] + ',' + finalDetails[3];
  date = date.trim();

  let innings = $('div.ds-bg-fill-content-prime.ds-rounded-lg');
  let htmlStr = '';
  for (let i = 0; i < innings.length; i++) {
    htmlStr += $(innings[i]).html();

    let teamName = $(innings[i]).find('span.ds-text-tight-s.ds-font-bold.ds-uppercase').text();
    teamName = teamName.split('INNINGS')[0].trim();

    let opponentIndex = i == 0 ? 1 : 0;
    let opponentName = $(innings[opponentIndex])
      .find('span.ds-text-tight-s.ds-font-bold.ds-uppercase')
      .text();
    opponentName = opponentName.split('INNINGS')[0].trim();

    console.log(`${date}, ${venue}, ${teamName} vs ${opponentName}, ${result}`);

    //current innings
    let currentInning = $(innings[i]);
    let allRows = currentInning.find(
      'table.ds-w-full.ds-table.ds-table-xs.ds-table-fixed.ci-scorecard-table>tbody>tr.ds-border-b.ds-border-line.ds-text-tight-s'
    );

    // console.log(allRows.text());

    for (let j = 0; j < allRows.length - 1; j++) {
      let allCols = $(allRows[j]).find('td');
      let isWorthy =
        $(allCols[0]).hasClass('ds-border-b.ds-border-line.ds-text-tight-s') && allCols.length == 8;

      if (!isWorthy) {
        let playerName = $(allCols[0]).text().trim();
        let runs = $(allCols[2]).text().trim();
        let balls = $(allCols[3]).text().trim();
        let fours = $(allCols[5]).text().trim();
        let sixes = $(allCols[6]).text().trim();
        let sr = $(allCols[7]).text().trim();

        console.log(`${playerName} || ${runs} || ${balls} || ${sixes} || ${fours} || ${sr}`);

        processPlayer(
          teamName,
          playerName,
          runs,
          balls,
          fours,
          sixes,
          sr,
          opponentName,
          venue,
          date,
          result
        );
      }
    }
  }
}

function processPlayer(
  teamName,
  playerName,
  runs,
  balls,
  fours,
  sixes,
  sr,
  opponentName,
  venue,
  date,
  result
) {
  let teamPath = path.join(__dirname, 'ipl', teamName);
  dirCreater(teamPath);
  let filePath = path.join(teamPath, playerName + '.xlsx');
  let content = excelReader(filePath, playerName);
  let playerObj = {
    teamName,
    playerName,
    runs,
    balls,
    fours,
    sixes,
    sr,
    opponentName,
    venue,
    date,
    result,
  };
  content.push(playerObj);
  excelWriter(filePath, content, playerName);
}

function dirCreater(filePath) {
  if (fs.existsSync(filePath) == false) {
    fs.mkdirSync(filePath);
  }
}
function excelWriter(filePath, json, sheetName) {
  let newWB = xlsx.utils.book_new();
  let newWS = xlsx.utils.json_to_sheet(json);
  xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
  xlsx.writeFile(newWB, filePath);
}
function excelReader(filePath, sheetName) {
  if (fs.existsSync(filePath) == false) {
    return [];
  }
  let wb = xlsx.readFile(filePath);
  let excelData = wb.Sheets[sheetName];
  let ans = xlsx.utils.sheet_to_json(excelData);
  return ans;
}

module.exports = {
  processScorecard: processScorecard,
};
