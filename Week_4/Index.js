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
  

let loadCount = 0;
let startTime = Date.now();


fetch('./json/combinedData.json').then(data => {
  //console.log('fetch', Date.now() - startTime)
  return data.json();
}).then(data => { 
  //console.log('then', Date.now() - startTime)
  const satData = data;
  const numberOfSatellites = Object.keys(satData).length;
  const loadBar = document.getElementById("myBar");
  
  const totalSeconds = 60 * 60 * 24 * 1;
  const timestepInSeconds = 40;

  const start = Cesium.JulianDate.fromDate(new Date());
  const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());

  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  viewer.timeline.zoomTo(start, stop);
  viewer.clock.multiplier = 40;
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  //console.log('timers', Date.now() - startTime);
  
  for(let sat in satData) {
    if(satData[sat].satrec.error === 0) {
      // if(loadCount % 100 === 0) {
      //   console.log('sat loop', Date.now() - startTime)
      // }
      let satrec = satData[sat].satrec;
      const positionsOverTime = new Cesium.SampledPositionProperty();
      //console.log(satData[sat])
      for (let i = 0; i < totalSeconds; i+= timestepInSeconds) {
        const time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
        const jsDate = Cesium.JulianDate.toDate(time);
        const positionAndVelocity = satellite.propagate(satrec, jsDate);
        const gmst = satellite.gstime(jsDate);
        const p = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        const position = Cesium.Cartesian3.fromRadians(p.longitude, p.latitude, p.height * 1000);

        positionsOverTime.addSample(time, position);   
      };

      viewer.entities.add({
        description: ``,
        position: positionsOverTime,
        point: { pixelSize: 6, color: Cesium.Color.RED }
      });

      loadCount++;
      //setTimeout(() => {
        let loadProgress = Math.floor((loadCount/numberOfSatellites) * 100);
        console.log(loadProgress);
        loadBar.style.width = loadProgress + "%";
      //}, 0);
    };
  }
  //console.log('Done', Date.now() - startTime)
});