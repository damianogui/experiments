String source = "20161126.kml"; //Our KML file from Google Location History  (https://www.google.it/maps/timeline)

//declare XML elements we're interested in
XML kml;
XML document;
XML placemark;  

//data values we want to save
String where; //address
String when; //timestamp 
float lon; //longitude
float lat; //latitude

//min and max LAT/LON, so we can map them to our window
float minLat;
float maxLat;
float minLon;
float maxLon; 

//number of placemarks we want to get
int n = 1000;
int placemarkCounter;

//placemarks' arrays
float placemarkX[] = new float[n];
float placemarkY[] = new float[n];
float mappedX[] = new float[n];
float mappedY[] = new float[n];
String[] name = new String[n];

void setup() {
  size(1200, 700);
  frame.setResizable(true);
  pixelDensity(2); //retina support
  
  parseKML(); //let's parse!
}

void parseKML() {
  kml = loadXML(source);
  document = kml.getChild("Document");

  int len = document.getChildCount(); //length of the whole file
  
  //let's go through the document, looking for coordinates
  for ( int i = 0; i < len; i++ ) { 
    if ( document.getChild(i).getName() == "Placemark") {
      for ( int h = 0; h < document.getChild(i).getChildCount(); h++ ) {
        if (document.getChild(i).getChild(h).getName() == "gx:Track") {
          for ( int j = 0; j < document.getChild(i).getChild(h).getChildCount(); j++ ) {
            if (document.getChild(i).getChild(h).getChild(j).getName() == "gx:coord") {
              
              //Eureka! let's add this placemark to the counter 
              placemarkCounter +=1;
              
              // get the coordinates and split them
              float[] coordsArr; //array for LAT and LON
              coordsArr = float(split(document.getChild(i).getChild(h).getChild(j).getContent(), " "));
              lon = coordsArr[0];
              lat = coordsArr[1];
              
              //put some starting point for the mapping
              if (placemarkCounter == 1){
              minLat = coordsArr[1];
              maxLat = coordsArr[1];
              minLon = coordsArr[0];
              maxLon = coordsArr[0]; 
              }
              
              //should we update the extremes?
              placemarkX[placemarkCounter] = lon;
              if (lon < minLon) {
                minLon = lon;
              }
              if (lon > maxLon) {
                maxLon = lon;
              }
              placemarkY[placemarkCounter] = lat;
              if (lat < minLat) {
                minLat = lat;
              }
              if (lat > maxLat) {
                maxLat = lat;
              }

              //what and where?
              name[placemarkCounter] = document.getChild(i).getChild("name").getContent();
              when = document.getChild(i).getChild("TimeSpan").getChild("begin").getContent();     

              //Let's see what we've got
              println("Location Point: when "+when+" | lon "+lon+" | lat "+lat+" "+name[j]);
            }
          }
        }
      }
    }
  }
}

void draw() {
  background(255);
  
  //loop through the placemark that we have collected
  for (int i = 1; i<1000; i++) {
    if (placemarkX[i] != 0) {
      
      //map the coordinates to our window
      mappedX[i] = map (placemarkX[i], minLon, maxLon, 50, width-100);
      mappedY[i] = map (placemarkY[i], maxLat, minLat, 50, height-50);

      //draw points
      noStroke();
      fill(0);
      ellipse(mappedX[i], mappedY[i], 5, 5);
      
      //draw lines
      if (i > 1) {
        stroke(0,50);
        line(mappedX[i], mappedY[i], mappedX[i-1], mappedY[i-1]);
      }
      
      //write name
      textSize(8);
      text(name[i], mappedX[i]+5, mappedY[i]+5);
    }
  }
}