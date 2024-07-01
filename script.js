let h2 = document.querySelector('h2');
let map;
let brasilLayer;

// Função para inicializar o mapa e centralizá-lo no Brasil com controle de zoom
function initMap() {
  // Cria o mapa e define a visão inicial para cobrir o Brasil
  map = L.map('mapid').setView([-15.7942, -47.8821], 4);  // Zoom mais afastado para mostrar o Brasil inteiro

  // Adiciona a camada de tiles do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Adiciona controle de zoom personalizado na posição superior direita
  L.control.zoom({
    position: 'topright'
  }).addTo(map);

  // Carrega o arquivo brasil.geojson e adiciona ao mapa
  loadBrasilData();
}

// Função para carregar o arquivo brasil.geojson e adicionar ao mapa
function loadBrasilData() {
  fetch('./brasil.geojson')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na resposta da rede: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      brasilLayer = L.geoJson(data, {
        style: function(feature) {
          return {
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0  // Removido a cor verde e o preenchimento
          };
        },
        onEachFeature: function(feature, layer) {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: enviarLocalizacao
          });
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Erro ao carregar brasil.geojson:', error);
    });
}

// Define as funções de highlight e reset
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 3,
    color: '#3388ff',
    dashArray: '',
    fillOpacity: 0.5  // Adiciona um leve preenchimento para destacar a região
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  brasilLayer.resetStyle(e.target);
}

function enviarLocalizacao(e) {
  var region = e.latlng;
  var regionName = `Latitude: ${region.lat}, Longitude: ${region.lng}`;

  fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer pat-na1-f1d2ed0f-2135-4ab4-8efa-d0ec5c153365'
    },
    body: JSON.stringify({ location: regionName })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao enviar localização: ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
    alert('Sua localização foi registrada com sucesso!');
  })
  .catch((error) => {
    console.error('Erro ao enviar localização:', error);
    alert('Houve um erro ao enviar a localização.');
  });
}

// Função de sucesso da geolocalização
function success(pos) {
  console.log(pos.coords.latitude, pos.coords.longitude);
  h2.textContent = `Latitude: ${pos.coords.latitude}, Longitude: ${pos.coords.longitude}`;

  // Ajusta a visão do mapa para a localização do usuário com zoom mais afastado
  map.setView([pos.coords.latitude, pos.coords.longitude], 6);  // Zoom mais afastado para mostrar uma área maior do Brasil

  L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map)
    .bindPopup('Eu estou aqui.<br> Facilmente customizável.')
    .openPopup();
}

// Função de erro da geolocalização
function error(err) {
  console.error('Erro na geolocalização:', err);
}

// Inicializa o mapa
initMap();

// Solicita a geolocalização do usuário
navigator.geolocation.watchPosition(success, error, {
  enableHighAccuracy: true,
  timeout: 5000
});
