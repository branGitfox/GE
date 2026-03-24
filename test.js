const pieces_par_carton = 10;
const stock_cartons = 5;
const stock_pieces = 3;

const qt = parseFloat(stock_cartons) * parseFloat(pieces_par_carton) + parseFloat(stock_pieces);
console.log("qt: ", qt);

const fetched_cartons = Math.floor(qt / pieces_par_carton);
const fetched_pieces = qt % pieces_par_carton;
console.log("cartons:", fetched_cartons, "pieces:", fetched_pieces);
