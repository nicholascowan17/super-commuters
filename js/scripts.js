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
map.addControl(nav, 'top-left');

map.on('load', function() {
  // override the fill color of the basemap layers
  map.setPaintProperty('background', 'background-color', '#f5f5f5');
  map.setPaintProperty('water', 'fill-color', '#D6DEDD');
  map.setPaintProperty('place_label_city', 'text-color', '#242424');
  map.setLayoutProperty('poi_label', 'visibility', 'none');
  map.setLayoutProperty('place_label_other', 'visibility', 'none');
  map.setLayoutProperty('country_label', 'visibility', 'none');

  // add geojson source for puma travel times
  map.addSource('traveltime', {
    type: 'geojson',
    data: 'data/travel-time-pumas.geojson'
  });

  // add geojson source for puma travel modes
  map.addSource('travelmode', {
    type: 'geojson',
    data: 'data/travel-mode-pumas.geojson'
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
        2.5, '#A4DAD3',
        5, '#73A8C2',
        10, '#507CB2',
        20, '#30529F',
        30, '#263A83',
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
        2.5, '#A4DAD3',
        5, '#73A8C2',
        10, '#507CB2',
        20, '#30529F',
        30, '#263A83',
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
        2.5, '#A4DAD3',
        5, '#73A8C2',
        10, '#507CB2',
        20, '#30529F',
        30, '#263A83'
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
        0.025, '#A4DAD3',
        0.05, '#73A8C2',
        0.1, '#507CB2',
        0.2, '#30529F',
        0.3, '#263A83'
      ]
    }
  }, 'place_label_city');

  // add travel mode base layer
  map.addLayer({
    'id': 'MODE BASE',
    'type': 'fill',
    'source': 'traveltime',
    'layout': {'visibility':'none'},
    'paint': {
      'fill-color': '#f5f5f5'
    }
  }, 'place_label_city');

  // add travel mode layer
  map.addLayer({
    'id': 'TRAVEL MODE',
    'type': 'fill',
    'source': 'travelmode',
    'layout': {'visibility':'none'},
    'paint': {
      'fill-color': [
        'step',
        ['get', 'travel_modes_transit_sp'],
        '#F2F0F7',
        0.2, '#DADAEB',
        0.36, '#BCBDDC',
        0.5, '#9E9AC8',
        0.62, '#756BB1',
        0.75, '#54278F'
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
    'line-color': 'rgba(235, 235, 235, 0.4)',
    'line-width': 0.3
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
      layers: ['PERCENT OVER 0 MIN', 'PERCENT OVER 30 MIN', 'PERCENT OVER 60 MIN', 'PERCENT OVER 90 MIN', 'PERCENT OVER 120 MIN', 'TRAVEL MODE'],
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
      layers: ['PERCENT OVER 0 MIN', 'PERCENT OVER 30 MIN', 'PERCENT OVER 60 MIN', 'PERCENT OVER 90 MIN', 'PERCENT OVER 120 MIN', 'TRAVEL MODE'],
  });

  if (features.length > 0) {
    // show the popup
    // Populate the popup and set its coordinates based on the feature found.
    var hoveredFeature = features[0]
    var name = hoveredFeature.properties.Name

    if (hoveredFeature.layer.id === 'TRAVEL MODE') {
      var all_car = hoveredFeature.properties.travel_modes_car_at
      var all_transit = hoveredFeature.properties.travel_modes_transit_at
      var all_other = hoveredFeature.properties.travel_modes_other_at
      var sc_car = hoveredFeature.properties.travel_modes_car_st
      var sc_transit = hoveredFeature.properties.travel_modes_transit_st
      var sc_other = hoveredFeature.properties.travel_modes_other_st

      // function to create pie chart
      google.setOnLoadCallback(drawChart);
      function drawChart() {
        // create the data table
        var data = google.visualization.arrayToDataTable([
          ['Group', 'Car', 'Transit', 'Other', {role: 'annotation'}],
          ['All commuters', all_car, all_transit, all_other, ''],
          ['Super-commuters', sc_car, sc_transit, sc_other, '']
        ]);

        // set chart options
        var options_fullStacked = {
                      isStacked: 'percent',
                      legend: {position: 'bottom', maxLines: 2},
                      hAxis: {
                        minValue: 0,
                        ticks: [0, .25, .5, .75, 1]
                      },
                      fontSize: 11,
                      width: 350,
                      height: 200,
                      chartArea: {left:60, top:0, 'width': '100%', 'height': '80%'},
                      colors: ['#1B4F6B',
                        '#C069A9',
                        '#F4AB31'
                        ]
                      };

        // instantiate and draw our chart, passing in some options
        var chart = new google.visualization.BarChart(document.getElementById('bar-chart'));
        chart.draw(data, options_fullStacked);
      }

      var popupContent = `
        <div class="travel-popup" id="travel-mode-popup">
          <b>Total Commuters by Travel Mode</b></br>
          ${name}
        </div>
        <div id="bar-chart"></div>
        <div class="popup-footer">
          <i>Hover over the bar chart to see exact totals</i>
        </div>
      `

      popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);

    } else {
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
                      fontSize: 11,
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
        <div class="travel-popup" id="travel-time-popup">
          <b>Total Commuters by Travel Time</b></br>
          ${name}
        </div>
        <div id="pie-chart"></div>
        <div class="popup-footer">
          <i>Hover over the pie chart to see exact totals</i>
        </div>
      `

      popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);

    }

  } else {
    // remove the Popup
    popup.remove();
  }
})

var slider = document.getElementById("myRange")
slider.onclick = maptoggle

// implement function to toggle between travel time maps
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

// implement function to toggle between layers

// enumerate ids of the layers
var toggleableLayerIds = ['COMMUTE TIMES', 'PERCENT TRANSIT'];

// set up the corresponding toggle button for each layer
for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  if (id === 'COMMUTE TIMES') {
    link.className = 'active';
  } else {
    link.className = '';
  }
  link.textContent = id;

  link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    $('.active')[0].className = '';

    if (clickedLayer === 'COMMUTE TIMES') {
      $('.slider').show();
      $('#travel-time-legend').show();
      $('#travel-mode-legend').hide();
      $('#tools').css("height","410px")
      map.setLayoutProperty('MODE BASE', 'visibility', 'none');
      map.setLayoutProperty('TRAVEL MODE', 'visibility', 'none');
      maptoggle();
    }

    if (clickedLayer === 'PERCENT TRANSIT') {
      $('.slider').hide();
      $('#travel-time-legend').hide();
      $('#travel-mode-legend').show();
      $('#tools').css("height","210px")
      map.setLayoutProperty('PERCENT OVER 0 MIN', 'visibility', 'none');
      map.setLayoutProperty('PERCENT OVER 30 MIN', 'visibility', 'none');
      map.setLayoutProperty('PERCENT OVER 60 MIN', 'visibility', 'none');
      map.setLayoutProperty('PERCENT OVER 90 MIN', 'visibility', 'none');
      map.setLayoutProperty('PERCENT OVER 120 MIN', 'visibility', 'none');
      map.setLayoutProperty('MODE BASE', 'visibility', 'visible');
      map.setLayoutProperty('TRAVEL MODE', 'visibility', 'visible');
    }

    this.className = 'active';
  };

  var layers = document.getElementById('menu');
  layers.appendChild(link);
}

// implement function for fly-to's to each city and return to nationwide view
$('.flyto').on('click', function() {
  var city = $(this).data('city')

  switch(city) {
    case 'New York City':
      map.flyTo({
        center: [-73.94, 40.76],
        zoom: 7.4
      })
      break;
    case 'Washington D.C.':
      map.flyTo({
        center: [-77.04, 38.75],
        zoom: 7.8
      })
      break;
    case 'San Francisco':
      map.flyTo({
        center: [-122.43, 37.77],
        zoom: 8.4
      })
      break;
    case 'Los Angeles':
      map.flyTo({
        center: [-118.25, 34.05],
        zoom: 8.2
      })
      break;
    case 'reset':
      map.flyTo({
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM
      })
  }
})

// reset page when 'home' button is clicked
$('.home').on('click', function() {
  map.flyTo({
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM
  });
  $('#myModal').modal('show');
})

// open modal when 'about' button is clicked
$('.about').on('click', function() {
  $('#aboutModal').modal('show');
})

// open modal when 'methodology' button is clicked
$('.methodology').on('click', function() {
  $('#methodsModal').modal('show');
})
