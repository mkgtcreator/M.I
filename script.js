let h2 = document.querySelector('h2');
var map;
console.log(map);

function success(pos){
    console.log(pos.coords.latitude, pos.coords.longitude);
    h2.textContent = `Latitude:${pos.coords.latitude}, Longitude:${pos.coords.longitude}`;
    
    if (map === undefined) {
        map = L.map('mapid').setView([pos.coords.latitude, pos.coords.longitude], 13);
    } else { 
        map.remove();
        map = L.map('mapid').setView([pos.coords.latitude, pos.coords.longitude], 13);
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map)
        .bindPopup('Eu estou aqui.<br> Facilmente customizável.')
        .openPopup();

    // Adicionar funcionalidade de realce ao passar o mouse sobre o Brasil
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

    // Função para realçar a região ao passar o mouse
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

    // Função para resetar o realce ao retirar o mouse
    function resetHighlight(e) {
        brasilLayer.resetStyle(e.target);
    }

    // Função para enviar a localização ao CRM da HubSpot
    function enviarLocalizacao(e) {
        var region = e.latlng; // Captura a latitude e longitude da região clicada

        // Transforma a coordenada em uma string
        var regionName = `Latitude: ${region.lat}, Longitude: ${region.lng}`;

        // Envie a localização para o CRM da HubSpot
        var hubspotEndpoint = 'https://api.hubapi.com/crm/v3/objects/deals/sensitive/read';
        var hubspotToken = 'pat-na1-f1d2ed0f-2135-4ab4-8efa-d0ec5c153365'; // Substitua pelo seu token

        var data = {
            properties: [
                {
                    property: 'location',
                    value: regionName
                }
            ]
        };

        fetch(hubspotEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + hubspotToken
            },
            body: JSON.stringify(data)
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

function error(err){
    console.log(err);
}

var watchID = navigator.geolocation.watchPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000
});
