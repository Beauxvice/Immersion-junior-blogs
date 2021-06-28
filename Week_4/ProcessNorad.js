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

  generateSatrec(days, resolution, path) {
    const totalSeconds = 60 * 60 * 24 * days;
    const timestepInSeconds = resolution;
    const start = this.Cesium.JulianDate.fromDate(new Date());
    const stop = this.Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
    this.viewer.clock.startTime = this.start.clone();
    this.viewer.clock.stopTime = this.stop.clone();
    this.viewer.clock.currentTime = this.start.clone();
    this.viewer.timeline.zoomTo(start, stop);
    this.viewer.clock.multiplier = 40;
    this.viewer.clock.clockRange = this.Cesium.ClockRange.LOOP_STOP;

    const positionsOverTime = new this.Cesium.SampledPositionProperty();
    const polylineArray = [];
    for (let i = 0; i < totalSeconds; i+= timestepInSeconds) {
      const time = this.Cesium.JulianDate.addSeconds(start, i, new this.Cesium.JulianDate());
      const jsDate = this.Cesium.JulianDate.toDate(time);
      const positionAndVelocity = this.satellite.propagate(this.satrec, jsDate);
      const gmst = this.satellite.gstime(jsDate);
      const p = this.satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      const position = this.Cesium.Cartesian3.fromRadians(p.longitude, p.latitude, p.height * 1000);

      this.positionsOverTime.addSample(time, position);
      if(path) {
        if(i === 0 || i % 3 === 0) {
          this.polylineArray.push(p.longitude, p.latitude, p.height * 1000);
        }
      }
    };
      
    // Visualize the satellite with a red dot.
    const satellitePoint = this.viewer.entities.add({
      description: `Satellite name: ${dataStructure[j].noradNumber}, Country of origin: ${dataStructure[j].countryOfContractor}, Use: ${dataStructure[j].purpose}, Class of orbit: ${dataStructure[j].classOfOrbit}, Type of orbit: ${dataStructure[j].typeOfOrbit}`,
      position: positionsOverTime,
      point: { pixelSize: 6, color: Cesium.Color.RED }
    });
    
    if(path) {
      const satLine = this.viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromRadiansArrayHeights(polylineArray),
          width: .5,
          material: Cesium.Color.GREY,
        }
      });
    }
    
  }
};
  
  
