const fs = require('fs');
const readline = require('readline');
const rawSatelliteData = require(__dirname + '/json/noradData.json');



async function processUCS(filename) {
    const fileStream = fs.createReadStream(filename);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        line.split('\n').map((ucsSat)=> ucsSat.split('\t').slice(0, 27))
        .map((ucsSat)=> {
            let ent = {
                "altucsSatName": ucsSat[0],
                "officialucsSatName": ucsSat[1],
                "countryOfRegistry": ucsSat[2],
                "countryOfOperator": ucsSat[3],
                "owner": ucsSat[4],
                "users": ucsSat[5],
                "purpose": ucsSat[6],
                "detailedPurpose": ucsSat[7],
                "classOfOrbit": ucsSat[8],
                "typeOfOrbit": ucsSat[9], 
                "contractor": ucsSat[21],
                "countryOfContractor": ucsSat[22],
                "cosparNumber": ucsSat[25]
            };
            
            if (!!rawSatelliteData[ucsSat[26]]) {
                Object.assign(rawSatelliteData[ucsSat[26]], ent);
            }
        });
    }
    return rawSatelliteData;
} 

const ucsData = processUCS(__dirname + '/data/ucsData.txt');

ucsData.then((data) => {
    const parsed = JSON.stringify(data, null, 4);
    fs.writeFileSync(__dirname + '/json/combinedData.json', parsed, 'utf8');
});
