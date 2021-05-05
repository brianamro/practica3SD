const { MongoClient } = require("mongodb");
// Replace the uri string with your MongoDB deployment's connection string.
const uri =
"mongodb+srv://brian:pass@clusterrico.vre9s.mongodb.net/bookservice?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function getRandomBook() {
  try {
    await client.connect();
    const database = client.db('bookservice');
    const libros = database.collection('libros');
    //Obtenemos todos los ISBN de la base de datos y los guardamos en un arreglo
    const projection = {_id: 0, ISBN: 1}
    const cursor1 = libros.find().project(projection);
    const allISBN = await cursor1.toArray();
    //Seleccionamos uno al azar 
    const randomISBN = allISBN[ Math.floor( Math.random()*allISBN.length )];

    //Obtenemos la información completa del libro random
    const cursor2 = libros.find(randomISBN);
    const randomBook = await cursor2.toArray();

    return randomBook[0];

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

let book = (async function(){
  let randBook = await getRandomBook();
  //console.log(randBook);  
  bookx = randBook;
})();



