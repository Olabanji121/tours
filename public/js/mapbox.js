const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoib2JhbmoxMjEiLCJhIjoiY2s0dHNhMW9zMDA5MzNlbnR4ZHJzenl0NSJ9.uy1VAQ5ro4lJCqNZazXz_A';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/obanj121/ck4ttcadn1g6r1cr9tvzg0yif',
  scrollZoom: false
  //   center: [  -115.172652,
  //     36.110904],
  //   zoom: 5
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // create marker
  const el = document.createElement('div');
  el.className = 'marker';
  // add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);
  // Add popup
  new mapboxgl.Popup({
      offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
    .addTo(map);
  //  extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
