# Charts
Modification of the plotly charts to adapt linear gradient coloring fill

## 1. Technology ###
For the charts we use a simple D3.js based library called Plotly. 

JavaScript Plotly Documentation [here](https://plot.ly/javascript/)

## 2. Simple Line Graph Example

We start by simply adding a `div` object in our html file.
```html
<html>
 <head>
    <!-- Import Plotly.js Library -->
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    ...
 </head>

 <body>
   <!-- The div container for our graph, specify the id -->
   <div id="myDiv"></div>
   ...
 </body>

 <script></script>
</html>
```

In the script section we create the variable that will hold the data and specify the graph type.
```javascript
var data = {
    type: 'scatter',
    x: xDataAray, // e.g. [1, 2, 3, 4]
    y: yDataArray // e.g. [1, 2, 3, 4]
 };
```
Note that the `x` and the `y` variable __must__ have the same dimension.

To change the styling of the graph we could simply add fields to our `data` variable

```javascript
var data = {
    type: 'scatter', 
    x: xDataArray,
    y: yDataArray,
    mode: 'lines',
    line: {
      color: 'rgb(55, 128, 191)', // line color
      width: 3  // line width in pixels
    },
    fill: 'tozeroy' // fill the area underneath the graph
 };
```
Now specify the `layout` 
```javascript
var layout = {
  title: 'My Line Chart',
  width: 500, // graph width in pixels
  height: 300, // graph height in pixels
  margin: {
    t: 40, // top margin in pixels
    l: 20, // left margin in pixels
    r: 20, // right margin in pixels
    b: 10 // bottom margin in pixels
  }
};
```
Other `layout` fields described [here](https://plot.ly/python/reference/#layout)

Finally, to plot the line graph simply add the code snippet below where `myDiv` specifies the `div` container's `id` that will be holding the graph.
```javascript
Plotly.newPlot('myDiv', [data], layout);
```

##### Simple Line Chart
![]()

Other line graph variations and examples could be found [here](https://plot.ly/javascript/line-charts/)

## 3. Linear Gradient Colors Explained

The file [historCharts.js](http://stgit.dcs.gla.ac.uk/tp3-2018-cs07/dashboard/blob/master/project_aurora/static/js/historyCharts.js) contains the supported color schemes in the variable `colormaps`. The function `addGrad` in the [historCharts.js](http://stgit.dcs.gla.ac.uk/tp3-2018-cs07/dashboard/blob/master/project_aurora/static/js/historyCharts.js) allows to smooth the transition between colors depending on the values. This allows to for better visualisation of the data.

For each graph the line color and the fill color are computed dynamically depending on the thresholds we define and the color map we choose.

Let's change the coloring of the [graph]().

Add the library `historyCharts.js` to the html `<head>` by adding the code snippet to the head.
```html
   <script src="historyCharts.js"></script>
```

Then define the thresholds and choose the color map to be used in the `<script>` section. 
```javascript
   var lowerThreshold = 15;
   var upperThreshold = 23;
   var colorMap = 'viridis'; // look at the supported colormaps
```
Then we call the `addGrad` function to add the `linearGradient` stop-colors to the graph
```javascript
   var graphId = 'myDiv'; // specify the graph for which linear gradient colors are added
   addGrad(lowerThreshold, upperThreshold, xDataArray, yDataArray, graphId, colorMap);
```
Then update the graph by calling the `updateGrad` function
```javascript
   updateGrad(graphId);
```
##### Linear Gradient Colors Line Chart
![]()

## 4. How to Add New Color Maps
We would highly recommend using this [website](http://angrytools.com/gradient/) to create your own linear gradient colors. You need to specify exactly __three__ colors that suit together. 
*  The first color indicates when the sensor's values are very close to or below the lower limit (low)
*  The second color indicates the desired state of the sensor's data (desired)
*  The third color indicates when the sensor's values are very close to or above the upper limit (high)

Then add this to the `colormap` variable in the [historCharts.js]() file as an array of 3 integers where each integer corresponds to the color channel RGB.

```javascript
  'myColorMap' : {
    'color1' : [0, 0, 255],    // low
    'color2' : [20, 225, 34],  // desired
    'color3' : [255, 0, 0]     // high
   }
```
Then follow the steps from the previous section
```javascript
   var colorMap = 'myColorMap'; // choose your own colormap id

   addGrad(lowerThreshold, upperThreshold, xDataArray, yDataArray, graphId, colorMap);
   updateGrad(graphId);
```
##### Result
![]()
