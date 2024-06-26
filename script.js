let h2 = document.querySelector('h2');
var map;
let brasilData; // Declare a variável para armazenar os dados do GeoJSON do Brasil

// Carregar o arquivo brasil.geojson usando fetch
fetch('./brasil.geojson')
    .then(response => response.json())  // Transforma a resposta em JSON
    .then(data => {
        brasilData = data;  // Atribui os dados carregados à variável brasilData

        // Função para lidar com o sucesso na obtenção da geolocalização
        function success(pos) {
            console.log(pos.coords.latitude, pos.coords.longitude);
            h2.textContent = `Latitude: ${pos.coords.latitude}, Longitude: ${pos.coords.longitude}`;

            if (!map) {
                map = L.map('mapid').setView([pos.coords.latitude, pos.coords.longitude], 13);
            } else {
                map.setView([pos.coords.latitude, pos.coords.longitude], 13);
            }

            // Adicionar controle de zoom
            L.control.zoom().addTo(map);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Verificar se brasilData está definido
            if (typeof brasilData !== 'undefined') {
                var brasilLayer = L.geoJson(brasilData, {
                    style: function(feature) {
                        return {
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.7,
                            fillColor: '#4CAF50'
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
            }

            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#3388ff',
                    dashArray: '',
                    fillOpacity: 0.7
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

                // Exemplo de requisição para um backend seguro
                fetch('https://mkgtcreator.com/api/hubspot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
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
        }

        // Função para lidar com erros na obtenção da geolocalização
        function error(err) {
            console.error('Erro ao obter geolocalização:', err);
            h2.textContent = 'Erro ao obter geolocalização';
        }

        // Solicitar a geolocalização do usuário
        var watchID = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 5000
        });
    })
    .catch(error => {
        console.error('Erro ao carregar brasil.geojson:', error);
        // Trate o erro de carregamento do arquivo GeoJSON, se necessário
    });
