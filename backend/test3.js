const axios = require('axios');
async function test() {
   try {
       console.log("Testing updateProduit...");
       const resp = await axios.put('http://localhost:5000/api/produits/1', {
           nom: "Riz",
           nom_unite_gros: "Sac",
           quantite: 4120, // increased by 9 pieces -> 0 Cartons, 9 Pieces? Wait, ratio is 100
           pieces_par_carton: 100,
           prix_carton: 10000,
           prix_piece: 1000,
           prix_achat: 8000,
           unité: "Kapoaka"
       });
       console.log("Update success:", resp.data);
   } catch(e) {
       console.log("Error:", e.response ? e.response.data : e.message);
   }
}
test();
