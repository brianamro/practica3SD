const { MongoClient } = require("mongodb");
// Replace the uri string with your MongoDB deployment's connection string.
const uri =
"mongodb+srv://brian:pass@clusterrico.vre9s.mongodb.net/bookservice?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function query() {
  try {
    await client.connect();
    const database = client.db('bookservice');
    const libros = database.collection('libros');
    // Consulta del libro con ese ISBN
    const query = { ISBN: "9786070742255" };
    const libro = await libros.findOne(query);
    console.log(libro);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
query().catch(console.dir);