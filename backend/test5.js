const axios = require('axios');
async function test() {
    try {
        const resp = await axios.get('http://localhost:5000/api/produit-achat?produit_id=1');
        console.log("History Modal Data:", resp.data);
    } catch(e) { console.error(e.response ? e.response.data : e.message); }
}
test();
