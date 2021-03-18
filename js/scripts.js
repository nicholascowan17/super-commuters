mapboxgl.accessToken = 'pk.eyJ1IjoibmljaG9sYXNjb3dhbjE3IiwiYSI6ImNrM28yNm1uaDAwcHkzbnFkam02dHJ0NjQifQ.E1RO9e96qZUpgn-1muXorg';

$(document).ready(function(){
    $("#myModal").modal('show');
});

var map = new mapboxgl.Map({
  container: 'mapContainer', // container ID
  style: 'mapbox://styles/mapbox/dark-v10', // style URL
  center: [-97.0, 37.5], // starting position [lng, lat]
  zoom: 4.1 // starting zoom
});

// disable map zoom when using scroll
map.scrollZoom.disable();

// add navigation control in top left
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

map.on('load', function() {
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
    },
    'fill-opacity': 0.85
  })

  // add travel time layer
  map.addLayer({
    'id': 'PERCENT OVER 30 MIN',
    'type': 'fill',
    'source': 'traveltime',
    'layout': {},
    'paint': {
      'fill-color': {
        property: 'travel-time_t30',
        stops: [
          [0, '#FCFADA'],
          [10, '#A4DAD3'],
          [15, '#73A8C2'],
          [20, '#507CB2'],
          [25, '#30529F'],
          [30, '#263A83']
        ]
      }
    },
    'fill-opacity': 0.85
  })

  // // add travel time layer
  // map.addLayer({
  //   'id': 'PERCENT OVER 60 MIN',
  //   'type': 'fill',
  //   'source': 'traveltime',
  //   'layout': {},
  //   'paint': {
  //     'fill-color': {
  //       property: 'travel-time_t60',
  //       stops: [
  //         [10, '#CCE6FF'],
  //         [15, '#8FAECC'],
  //         [20, '#6289B3'],
  //         [25, '#3C5D80'],
  //         [30, '#24374D']
  //       ]
  //     }
  //   },
  //   'fill-opacity': 0.85
  // })
  //
  // // add travel time layer
  // map.addLayer({
  //   'id': 'PERCENT OVER 90 MIN',
  //   'type': 'fill',
  //   'source': 'traveltime',
  //   'layout': {},
  //   'paint': {
  //     'fill-color': {
  //       property: 'travel-time_t90',
  //       stops: [
  //         [10, '#CCE6FF'],
  //         [15, '#8FAECC'],
  //         [20, '#6289B3'],
  //         [25, '#3C5D80'],
  //         [30, '#24374D']
  //       ]
  //     }
  //   },
  //   'fill-opacity': 0.85
  // })
  //
  // // add travel time layer
  // map.addLayer({
  //   'id': 'PERCENT OVER 120 MIN',
  //   'type': 'fill',
  //   'source': 'traveltime',
  //   'layout': {},
  //   'paint': {
  //     'fill-color': {
  //       property: 'travel-time_t120',
  //       stops: [
  //         [10, '#CCE6FF'],
  //         [15, '#8FAECC'],
  //         [20, '#6289B3'],
  //         [25, '#3C5D80'],
  //         [30, '#24374D']
  //       ]
  //     }
  //   },
  //   'fill-opacity': 0.85
  // })

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
})

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
  'line-color': 'rgba(235, 235, 235, 0.4)',
  'line-width': 1
}
})

});
