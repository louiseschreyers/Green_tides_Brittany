# Monitoring green macroalgae proliferation on beaches using Landsat 5 and 8 in Google Earth Engine 
## Purpose
Run a simple detection tool to estimate green macroalgae surfaces on beaches using Landsat SR data in the Google Earth Engine environment. 

## About the data
The detection tool uses the Google Earth Engine API and the Landsat 5 and 8 Surface Reflectance data. 

## How to use the Javascript templates 
The JavaScript templates are located into the **GEE_scripts** folder. Duplicate the JavaScript template of interest in Google Earth Engine editor. Using the templates, it is possible to detect green macroalgae accumulation on beaches using Landsat 5 or 8 SR imagery, and estimating the area covered by the macroalgae. Spectral signatures of pixels corresponding to different features on the beaches (water, sand and algae) can also be retrieved and exported into a graph and .csv file. 
A Google Earth Engine account is required, as well as uploading the shapefiles or geometries of interest. Four shapefiles are provided into the **resources** folder, corresponding to four beaches in Northern Brittany, France. 


