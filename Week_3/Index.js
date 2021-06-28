Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0N2I2NTY0NS00YWI2LTQ3YzktOTQwOS0yMjA5MWY4OWNkMGQiLCJpZCI6NTc0MDMsImlhdCI6MTYyMjI4MzA5Mn0.PbI4SSpd4gfbw9XIsBlly_9ZzBXpXqnVcC8l-0rJrcA'

const viewer = new Cesium.Viewer('cesiumContainer', {
terrainProvider: Cesium.createWorldTerrain()
});
// Add Cesium OSM Buildings.
const osmBuildings = viewer.scene.primitives.add(Cesium.createOsmBuildings());

// Fly the camera to San Francisco using longitude, latitude, and height.
viewer.camera.flyTo({
destination: Cesium.Cartesian3.fromDegrees(-122.39053, 37.61779, 40000000)
});
  
const totalSeconds = 60 * 60 * 24 * 1;
const timestepInSeconds = 40;

const start = Cesium.JulianDate.fromDate(new Date());
const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());

viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.timeline.zoomTo(start, stop);
viewer.clock.multiplier = 1;
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

fetch('./json/combinedData.json').then(data => {
  return data.json();
}).then(data => { 
  const satData = data;
  let startTime = Date.now();
  const numberOfSatellites = Object.keys(satData).length;
  let counter = 0;

  for(let sat in satData) {
    
    if(satData[sat].satrec.error === 0) {
      counter++;

      let satrec = satData[sat].satrec;
      const positionsOverTime = new Cesium.SampledPositionProperty();
      
      for (let i = 0; i < totalSeconds; i+= timestepInSeconds) {

        const time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
        const jsDate = Cesium.JulianDate.toDate(time);
        const gmst = satellite.gstime(jsDate);

        const positionAndVelocity = satellite.propagate(satrec, jsDate);
        const p = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        const position = Cesium.Cartesian3.fromRadians(p.longitude, p.latitude, p.height * 1000);

        positionsOverTime.addSample(time, position);   
      };

      const satellitePoint = viewer.entities.add({
      description: `Satellite name: ${satData[sat].officialucsSatName} --- Country of registry: ${satData[sat].countryOfRegistry} --- User: ${satData[sat].users} --- Purpose: ${satData[sat].purpose}`,
      position: positionsOverTime,
      point: { pixelSize: 3, color: Cesium.Color.RED }
      });  
    };
  }
  console.log(`Number of satellites loaded ${counter} / ${numberOfSatellites}`);
  console.log('Finished in ', (Date.now() - startTime) / 1000, 's');
});