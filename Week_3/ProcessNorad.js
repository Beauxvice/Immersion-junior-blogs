const fs = require('fs');
const readline = require('readline');
const satellite = require(__dirname + '/lib/satellite.js');

async function processNORAD(filename) {
  const fileStream = fs.createReadStream(filename);
  let objList = {};
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let counter = 0;
  
  for await (const line of rl) {
    if (counter == 0) {
      noradSat = new Sat;
      counter += 1;
    } else if (counter == 1) {
      noradSat.tle1 = line;
      counter += 1;
    } else if (counter == 2) {
      noradSat.tle2 = line;
      noradSat.satrec = satellite.twoline2satrec(noradSat.tle1, noradSat.tle2)
      objList[line.slice(2, 7)] = noradSat;
      counter = 0;
    }
  }
  return objList;
}

const noradData = processNORAD(__dirname + '/data/noradData.txt');

noradData.then((data) => {
  const parsed = JSON.stringify(data, null, 4);
  fs.writeFileSync(__dirname + '/json/noradData.json', parsed, 'utf8');
});

class Sat {  
  constructor() {

  }
};
  
  
