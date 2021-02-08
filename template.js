// *** PART 1: DATA PREPARATION: SHAPEFILE LOADING, CREATING A COLLECTION OVER LANDSAT 5 ***
// Import shapefile for the studied sites 

var Locquirec = ee.FeatureCollection("users/lschreyers/Locquirec");
var St_Michel = ee.FeatureCollection("users/lschreyers/St_Michel_Greve");

// Create a feature collection for the two sites 
var beach1 = St_Michel.first().geometry();
var beach2 = Locquirec.first().geometry(); 
var beaches = ee.FeatureCollection([beach1, beach2]); 

//Visualize them
Map.addLayer(beaches, {color:'blue'},"Saint-Michel-en-Grève area");
Map.centerObject(beaches,13); 

//Load Landsat 5 Surface Reflectance collection and filter by years and months

var l5= ee.ImageCollection("LANDSAT/LT05/C01/T1_SR")
.filter(ee.Filter.calendarRange(1984,1984,'year'))
.filter(ee.Filter.calendarRange(4,10,'month'))

//filter according to drawn boundary
.filterBounds(beaches) 
//filter according to cloud coverage
.filterMetadata('CLOUD_COVER', 'less_than', 30)
// sort by cloud coverage
.sort('CLOUD_COVER'); 

//Print the Landsat 5 collection
print (l5, 'Collection of Landsat 5 images in 1984'); 


// Excluding some images that do not meet the criteria (too much cloud or high tide)
var l5primary = l5
.filter(ee.Filter.date('1984-04-09','1984-04-13').not()) // two images excluded here
.filter(ee.Filter.date('1984-06-13','1984-06-14').not()); 

var l5final = l5primary
.sort('SENSING_TIME'); 

// Display the final collection for Landsat 5 images
print(l5final,"Landsat 5 final collection for 1984");


// *** PART 2: VISUALIZE ONE OR A FEW IMAGE(S) 

// Select image of interest  
var image1 = ee.Image('LANDSAT/LT05/C01/T1_SR/LT05_203026_19840426') 
.clip(beaches); 

// Visualization parameters for true color composite for Landsat 5 (to be adapted for Landsat 8)
var trueColor432Vis_L5 = {
  min: 0,
  max: 3000,
  bands: ['B4','B3','B2'],
  //gamma: 0.75
};

// NDVI expression
var NDVI = image1.expression('(NIR - red) / (NIR + red)', 
{
  red: image1.select('B3'), 
  NIR: image1.select('B4'), 
}); 

// NDWI expression
var NDWI = image1.expression('(green - NIR) / (NIR + green)', 
{
  green: image1.select('B2'), 
  NIR: image1.select('B4'), 
}); 

// Mask visualization parameter 
var NDVIvis = {min: 0, max: 1, palette: ['BDFFC9','1E4026']}; 

var NDVIMasked = NDVI.updateMask(NDVI.gt(0.22).and(NDWI.lt(-0.2)));

// Load images - True color version and algae mask 
Map.addLayer(image1, trueColor432Vis_L5, "True Color");
Map.addLayer(NDVIMasked,NDVIvis, "Algae mask"); 

// *** PART 3: CALCULATE AREA COVERED BY GREEN MACROALGAE AND CREATE A CHART ***
//Define NDVI and NDWI threshold values 
var NDVIThreshold_L5 = 0.22 ;
var NDWIThreshold_L5 = -0.2; 

// Create a function to detect all pixels that meet the defined conditions 
var algaefunction_L5 = function(image){
  //add the NDVI band to the image collection with a coefficient for later comparison with Landsat 8 products 
  var NDVI_L5 = image.normalizedDifference(['B4', 'B3']).multiply(1.036).rename('NDVI'); 
  //add the NDWI band to the image collection 
  var NDWI_L5 = image.normalizedDifference(['B2','B4']).rename('NDWI');
  //get pixels above the NDVI threshold and below the NDWI threshold  
  var algae_L5 = NDVI_L5.gt(NDVIThreshold_L5).and(NDWI_L5.lt(NDWIThreshold_L5));
  //mask those pixels from the image

  image = image.updateMask(algae_L5).addBands(NDVI_L5);

//Calculate the area covered by these pixels
  var area_L5 = ee.Image.pixelArea();
  var algaeArea_L5 = algae_L5.multiply(area_L5).rename('algaeArea_L5');

  image = image.addBands(algaeArea_L5);

  var stats = algaeArea_L5.reduceRegion({
    reducer: ee.Reducer.sum(), 
    geometry: beaches, 
    scale: 30,
  });

  return image.set(stats);
};


// Update the Landsat 5 collection, adding the new band on algae estimated surface 
var collection = l5final.map(algaefunction_L5); 
print(collection);

//Create a chart displaying the surface estimates by date
var chart_l5 = ui.Chart.image.seriesByRegion(
  collection, beaches, ee.Reducer.sum(), 'algaeArea_L5',30)
  .setChartType('ScatterChart')
  .setSeriesNames(['Saint-Michel-en-Grève','Fonds de la Baie'])
  .setOptions({
  title: "Green tide area at Saint-Michel-en-Grève",
  vAxis: {title: 'Area in m2'},
  pointSize:4,
  lineWidth:1,
  series: {
            0: {color: 'FF0000'}, // Saint-Michel-en-Grève
            1: {color: '0000FF'}, // Fonds-de-la-Baie
}
});

print(chart_l5); 



