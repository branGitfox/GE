const http = require('http');

const data = JSON.stringify({
    nom: "Riz",
    nom_unite_gros: "Sac",
    quantite: 4120,
    pieces_par_carton: 100,
    prix_carton: 10000,
    prix_piece: 1000,
    prix_achat: 8000,
    unité: "Kapoaka"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/produits/1',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (d) => responseData += d);
    res.on('end', () => console.log('Response:', responseData));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
