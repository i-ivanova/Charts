// Supported dcolormaps
var colormaps = {
  'yellows' : {
    'color1' : [255, 251, 224],
    'color2' : [255, 243, 160],
    'color3' : [255, 227, 18]
  },

  'blues' : {
    'color1' : [214, 241, 255],
    'color2' : [115, 185, 223],
    'color3' : [23, 139, 202]
  },

  'viridis' : {
    'color1' : [255, 255, 0],
    'color2' : [25, 156, 51],
    'color3' : [21, 43, 163]
  },

  'plasma' : {
    'color1' : [255, 241, 51],
    'color2' : [255, 59, 147],
    'color3' : [10, 66, 171]
  },

  'autumn' : {
    'color1' : [255, 255, 0],
    'color2' : [255, 153, 102],
    'color3' : [160, 0, 0]
  },

  'cool' : {
    'color1' : [0, 255, 255],
    'color2' : [169, 0, 191],
    'color3' : [227, 0, 0]
  }
}

/**
 * Update the graph's gradient on resize
 * @param {string} graphId - the id of the graph
 */
function updateGrad(graphId){
    var line = d3.select("#" + graphId + " svg.main-svg g.cartesianlayer g.plot g.lines path");
    line.style( "stroke", "url('#lgrad" + graphId +"')")
        .style("stroke-width", "4px");
    var fill = d3.select("#" + graphId + " svg.main-svg g.cartesianlayer g.plot g.fills path");
    fill.style( "fill", "url('#lgrad" + graphId +"')")
        .style( "opacity", "0.5");
}

/** Helper Function. Computes the color for the next stop color based on the
 * average value the specific slice of the yArr data
 * @param {float} ratio - a float number strictly between 0 and 1, it's used to
 *                        compute what amount of the two colors to be combined
 *                        to get te next stop color
 * @param {int[]} col1 - the first color the gradient is computed from
 * @param {int[]} col2 - the second color the gradient is computed from
 */
function computeGradient(ratio, col1, col2){
  var rgb = [];
  // for each dimention of the color (R, G, B)
  for (var c=0; c<3; c++){
    rgb.push(parseInt( ( 1 - ratio ) * col1[c] + ratio * col2[c]));
  }
  return rgb;
}

/** Computes the color for the next stop color based on the thresholds
 * @param {int[]} yVal -the average value in the specific slice of the yArr data
 * @param {int} hot - Upper Threshold Limit for the sensor
 * @param {int} cold - Lower Threshold Limit for the sensor
 * @param {int[]} red - the first color of the color map
 * @param {int[]} green - the second color of the colormap
 * @param {int[]} blue - the third color of the colormap
 */
function tresholdGradient(yVal, hot, cold, red, green, blue){
  var delta = hot-cold;
  var rgb = [];
  if (yVal < cold - delta){
    rgb = blue;
  } else if (yVal < cold + delta / 2.0){
    rgb = computeGradient(2 * ( yVal + delta - cold ) / 3.0 / delta, blue, green);
  } else if (yVal < hot + delta){
    rgb = computeGradient(( 2 * yVal + delta - 2 * hot ) / 3.0 / delta, green, red);
  } else if (yVal >= hot + delta){
    rgb = red;
  }

  return rgb;
}


/**
 * Creates linear gradient colors for the specific graph (graphId) given the
 * colormap, upper and lower tresholds and the data
 * @param {int} lowerLimit - the sensor lower limit value
 * @param {int} upperLimit - the sensor upper limit value
 * @param {int[]} xArr - the timestamps data
 * @param {int[]} yArr - the sensors values
 * @param {string} graphId -the div id containing the graph
 * @param {string} colorMapId - the color map id
 */
function addGrad(lowerLimit, upperLimit, xArr, yArr, graphId, colorMapId){
    if (!(colorMapId in colormaps)) colorMapId = "autumn";
    var hot = upperLimit;
    var cold = lowerLimit;
    var len = yArr.length;
    var gradLen = ~~(len/3);
    var x = xArr;
    var y = yArr;

    var blue = colormaps[colorMapId]['color1'];
    var green = colormaps[colorMapId]['color2'];
    var red = colormaps[colorMapId]['color3'];

    var ratio = ~~(len / gradLen);
    var yGrad = [];
    for (var i=0; i < gradLen; i++){
      var sum = 0;
      for (var j = i * ratio; j < (i + 1) * ratio; j++){
        sum += y[j];
      }
      yGrad.push(sum / ratio);
    }

    yGrad.reverse();

    var gradient = d3.select("#" + graphId + " svg.main-svg defs g.gradients").append("linearGradient")
      .attr("id", "lgrad" + graphId)
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    var col = [];
    for(var k=0; k < gradLen; k++){
      col = tresholdGradient(yGrad[k], hot, cold, red, green, blue);
      var xGrad = ratio * (k + 0.5);
      gradient.append("stop")
            .attr('class', 'start')
            .attr("offset", parseInt(xGrad)+"%")
            .attr("stop-color", "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")")
            .attr("stop-opacity", 1);
    };
}

/** Sets the size of the div containing the plotly graph
 * @param {dict} layout - the graph layout, look for more details on plot.ly
 * @param {int} divWidth - the width size of the graph in pixels
 * @param {int} divHeight - the height size of the graph in pixels
 */
function setDimensions(layout, divWidth, divHeight){
  layout.width = divWidth;
  layout.height = divHeight;
}

/** Helper Function. Creates a horizontal constant line
 * @param {int} limit - the threshold value
 * @param {int} x0 - the first point of the xArr data
 * @param {int} x1 - the last point of the xArr data
 */
function createLine(limit, x0, x1){
  return {
    xref: 'x',
    yref: 'y',
    type: 'line',
    x0: x0,
    y0: limit,
    x1: x1,
    y1: limit,
    line:{
        color: 'rgba(78, 79, 81, 0.5)',
        width: 2,
        dash:'dashdot'
      }
    }
}

/** Adds the threshold lines on the graph
 * @param {float} layout - the ratio based on , it's a float number strictly between 0 and 1
 * @param {int[]} upper - the threshold upper limit value
 * @param {int[]} lower - the threshold lower limit value
 * @param {int} x0 - the first point of the xArr data
 * @param {int} x1 - the last point of the xArr data
 */
function addThresholds(layout, upper, lower, x0, x1){
  var line1 = createLine(lower, x0, x1);
  var line2 = createLine(upper, x0, x1);
  var lines = [];
  lines.push(line1);
  lines.push(line2);
  layout.shapes = lines;
}

/**
 * Initializes charts
 * @param {int[]} xAxis - the timestamps data
 * @param {int[]} yAxis - the sensor values data
 * @param {int} lowerLimit - the sensor lower limit data
 * @param {int} upperLimit - the sensor upper limit data
 * @param {string} type - the sensor type, e.g. Temperature, Humidity
 * @param {int} id - the sensor id
 * @param {string} color - the color map id, e.g. yellows, blues
 */
function createHistoryChart(xAxis, yAxis, lowerLimit, upperLimit, type, id, color) {
    // Plot the data
    var trace = {
        x: xAxis,
        y: yAxis,
        mode: 'line',
        fill: 'tozeroy',
    };

    var data = [trace];

    var layout = {
        title:'History',
        margin: {
            t: 40, //top margin
            l: 30, //left margin
            r: 10, //right margin
            b: 30 //bottom margin
        }
    }

    if (lowerLimit == null) lowerLimit = 13;
    if (upperLimit == null) upperLimit = 23;
    addThresholds(layout, lowerLimit, upperLimit, xAxis[0], xAxis[xAxis.length - 1]);

    const scalingThreshold = 768;
    var pixelRatio = 1 / $(window).devicePixelRatio;
    var displayWidth = $(window).width();
    var displayHeight = $(window).height() * pixelRatio;

    // Smaller devices (e.g. mobile) (portrait mode)
    if (displayWidth < scalingThreshold) {
      displayWidth = displayWidth - 80;
    }
    // High DPI devices
    else {
      displayWidth = displayWidth * 6 / 13 * pixelRatio;
    }

    // Mobile devices in landscape mode
    if (!(displayHeight < displayWidth) && (displayWidth < scalingThreshold)) {
      displayHeight *= 2 / 5;
    }

    setDimensions(layout, parseInt(displayWidth), parseInt(displayHeight));
    Plotly.newPlot("history-chart-" + id, data, layout, {displayModeBar:false});

    // Colour scale
    if (!(color in colormaps)) color = 'autumn';
    addGrad(lowerLimit, upperLimit, xAxis, yAxis, "history-chart-" + id, color);

    // Update the gradients
    updateGrad("history-chart-" + id);

    // On resize
    $("#history-chart-" + id).on('plotly_relayout', function(eventdata) {
        updateGrad("history-chart-" + id);
    });
};
