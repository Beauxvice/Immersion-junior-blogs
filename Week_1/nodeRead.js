const fs = require('fs');
const readline = require('readline');

async function processLineByLine(fileName) {
    const fileStream = fs.createReadStream(fileName);

    const rl = readline.createInterface({
        input: fileStream
    });

    let output = '';
    for await (const line of rl) {
        output += `${line}\n`;
    }
return output;
}

const rawNoradData = processLineByLine(__dirname + '/noradData.txt')

console.log(rawNoradData)