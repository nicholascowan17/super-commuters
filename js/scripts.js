// set my mapboxgl access token
mapboxgl.accessToken = 'pk.eyJ1IjoibmljaG9sYXNjb3dhbjE3IiwiYSI6ImNrM28yNm1uaDAwcHkzbnFkam02dHJ0NjQifQ.E1RO9e96qZUpgn-1muXorg';

// initialize modal on page load
$(document).ready(function(){
    $("#myModal").modal('show');
});

// function to convert number to string with commas
function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// load the google visualization API and the corechart package
google.charts.load('current', {'packages':['corechart']});

// set some static variables that will be used in multiple places
var INITIAL_CENTER = [-97.0, 37.5]
var INITIAL_ZOOM = 4.05

var map = new mapboxgl.Map({
  container: 'mapContainer', // container ID
  style: 'mapbox://styles/mapbox/basic-v8', // style URL
  center: INITIAL_CENTER, // starting position [lng, lat]
  zoom: INITIAL_ZOOM // starting zoom
});

// disable map zoom when using scroll
map.scrollZoom.disable();

// add navigation control in top left
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

map.on('load', function() {
  // override the fill color of the basemap water layer
  map.setPaintProperty('background', 'background-color', '#f5f5f5');
  map.setPaintProperty('water', 'fill-color', '#D6DEDD');
  map.setPaintProperty('place_label_city', 'text-color', '#242424');

  // add geojson source for puma travel times
  map.addSource('traveltime', {
    type: 'geojson',
    data: 'data/travel-time-pumas.geojson'
  });

  // add travel time layer
  map.addLayer({
    'id': 'PERCENT OVER 0 MIN',
    'type': 'fill',
    'source': 'traveltime',
    'layout': {},
    'paint': {
      'fill-color': '#263A83'
    }
  }, 'place_label_city');

  // add travel time layer
  map.addLayer({
    'id': 'PERCENT OVER 30 MIN',
    'type': 'fill',
    'source': 'traveltime',
    'layout': {'visibility':'none'},
    'paint': {
      'fill-color': [
        'step',
        ['get', 'travel_time_p30'],
        '#FCFADA',
        5, '#A4DAD3',
        10, '#73A8C2',
        15, '#507CB2',
        20, '#30529F',
        25, '#263A83',
      ]
    }
  }, 'place_label_city');

  // add travel time layer
  map.addLayer({
    'id': 'PERCENT OVER 60 MIN',
    'type': 'fill',
    'source': 'traveltime',
    'layout': {'visibility':'none'},
    'paint': {
      'fill-color': [
        'step',
        ['get', 'travel_time_p60'],
        '#FCFADA',
        5, '#A4DAD3',
        10, '#73A8C2',
        15, '#507CB2',
        20, '#30529F',
        25, '#263A83',
      ]
    }
  }, 'place_label_city');

  // add travel time layer
  map.addLayer({
    'id': 'PERCENT OVER 90 MIN',
    'type': 'fill',
    'source': 'traveltime',
    'layout': {'visibility':'none'},
    'paint': {
      'fill-color': [
        'step',
        ['get', 'travel_time_p90'],
        '#FCFADA',
        5, '#A4DAD3',
        10, '#73A8C2',
        15, '#507CB2',
        20, '#30529F',
        25, '#263A83'
      ]
    }
  }, 'place_label_city');

  // add travel time layer
  map.addLayer({
    'id': 'PERCENT OVER 120 MIN',
    'type': 'fill',
    'source': 'traveltime',
    'layout': {'visibility':'none'},
    'paint': {
      'fill-color': [
        'step',
        ['get', 'travel_time_p120'],
        '#FCFADA',
        5, '#A4DAD3',
        10, '#73A8C2',
        15, '#507CB2',
        20, '#30529F',
        25, '#263A83'
      ]
    }
  }, 'place_label_city');

  // add outlines
  map.addLayer({
  'id': 'puma-outlines',
  'type': 'line',
  'source': 'traveltime',
  'layout': {},
  'paint': {
    'line-color': 'rgba(235, 235, 235, 0.3)',
    'line-width': 0.2
  }
}, 'place_label_city')

  // add geojson source for state boundaries
  map.addSource('states', {
    type: 'geojson',
    data: 'data/state-boundaries.geojson'
  });

  // add outlines
  map.addLayer({
  'id': 'state-outlines',
  'type': 'line',
  'source': 'states',
  'layout': {},
  'paint': {
    'line-color': 'rgba(235, 235, 235, 0.5)',
    'line-width': 1.2
  }
}, 'place_label_city')

  // add an empty data source, which we will use to highlight the puma the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted puma
  map.addLayer({
    id: 'highlight-line',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 1,
      'line-color': '#F4AB31',
    }
  })
});

map.on('mousemove', function (e) {
  // query for the features under the mouse
  var features = map.queryRenderedFeatures(e.point, {
      layers: ['PERCENT OVER 0 MIN', 'PERCENT OVER 30 MIN', 'PERCENT OVER 60 MIN', 'PERCENT OVER 90 MIN', 'PERCENT OVER 120 MIN'],
  });

  if (features.length > 0) {
    var hoveredFeature = features[0]

    // set this lot's polygon feature as the data for the highlight source
    map.getSource('highlight-feature').setData(hoveredFeature.geometry);

    // show the cursor as a pointer
    map.getCanvas().style.cursor = 'pointer';

  } else {
    // remove highlight
    map.getCanvas().style.cursor = '';
    map.getSource('highlight-feature').setData({
          "type": "FeatureCollection",
          "features": []
      });
    }
})

// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('click', function (e) {
  // query for the features under the mouse
  var features = map.queryRenderedFeatures(e.point, {
      layers: ['PERCENT OVER 0 MIN', 'PERCENT OVER 30 MIN', 'PERCENT OVER 60 MIN', 'PERCENT OVER 90 MIN', 'PERCENT OVER 120 MIN'],
  });

  if (features.length > 0) {
    // show the popup
    // Populate the popup and set its coordinates based on the feature found.
    var hoveredFeature = features[0]
    var name = hoveredFeature.properties.Name
    var commuters0 = hoveredFeature.properties.travel_time_t0
    var commuters30 = hoveredFeature.properties.travel_time_t30
    var commuters60 = hoveredFeature.properties.travel_time_t60
    var commuters90 = hoveredFeature.properties.travel_time_t90
    var commuters120 = hoveredFeature.properties.travel_time_t120

    // function to create pie chart
    google.setOnLoadCallback(drawChart);
    function drawChart() {
      // create the data table
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Travel Time');
      data.addColumn('number', 'Commuters');
      data.addRows([
        ['Less than 30 min', commuters0],
        ['30 min - 59 min', commuters30],
        ['60 min - 89 min', commuters60],
        ['90 min - 119 min', commuters90],
        ['120 min or more', commuters120]
      ]);

      // set chart options
      var options = {legend: 'right',
                    width: 350,
                    height: 200,
                    chartArea: {'width': '100%', 'height': '80%'},
                    colors: ['#1B4F6B',
                      '#5D63A2',
                      '#C069A9',
                      '#EC7176',
                      '#F4AB31'
                      ]
                    }

      // instantiate and draw our chart, passing in some options
      var chart = new google.visualization.PieChart(document.getElementById('pie-chart'));
      chart.draw(data, options);
    }

    var popupContent = `
      <div class="travel-popup" id="travel30-popup">
        <b>Total Commuters by Travel Time</b></br>
        ${name}
      </div>
      <div id="pie-chart"></div>
      <div class="popup-footer">
        <i>Hover over the pie chart to see exact totals</i>
      </div>
    `

    popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);

  } else {
    // remove the Popup
    popup.remove();
  }
})

var slider = document.getElementById("myRange")
slider.onclick = maptoggle

// implement function to toggle between maps
function maptoggle(e) {
  // read the value from the slider
  var value = document.getElementById("myRange").value;

  var mapId = "PERCENT OVER " + value + " MIN";

  map.setLayoutProperty('PERCENT OVER 0 MIN', 'visibility', 'none');
  map.setLayoutProperty('PERCENT OVER 30 MIN', 'visibility', 'none');
  map.setLayoutProperty('PERCENT OVER 60 MIN', 'visibility', 'none');
  map.setLayoutProperty('PERCENT OVER 90 MIN', 'visibility', 'none');
  map.setLayoutProperty('PERCENT OVER 120 MIN', 'visibility', 'none');

  map.setLayoutProperty(mapId, 'visibility', 'visible');
}

// implement function for fly-to's to each city and return to nationwide view
$('.flyto').on('click', function() {
  var city = $(this).data('city')

  switch(city) {
    case 'New York City':
      map.flyTo({
        center: [-73.94, 40.76],
        zoom: 8
      })
      break;
    case 'Washington D.C.':
      map.flyTo({
        center: [-77.04, 38.89],
        zoom: 8
      })
      break;
    case 'San Francisco':
      map.flyTo({
        center: [-122.43, 37.77],
        zoom: 8
      })
      break;
    case 'Los Angeles':
      map.flyTo({
        center: [-118.25, 34.05],
        zoom: 8
      })
      break;
    case 'reset':
      map.flyTo({
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM
      })
  }
})
