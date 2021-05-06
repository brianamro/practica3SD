const { MongoClient } = require("mongodb");

const uri =
"mongodb+srv://brian:pass@clusterrico.vre9s.mongodb.net/bookservice?retryWrites=true&w=majority";

const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

async function getRandomBook() {
    let client = new MongoClient(uri, config);
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

async function getBooks() {
    let client = new MongoClient(uri, config);

    try {
        await client.connect();
        let books = client.db('bookservice').collection('libros');
        return await books.find().toArray();
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function resetBooks() {
    let client = new MongoClient(uri, config);
    try {
        await client.connect();
        let books = client.db('bookservice').collection('libros');
        let result = await books.updateMany(
            {},
            { $set: { "prestado": false } }
        );
        console.log(result);
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}


// TODO: realizar logging de peticiones
async function logRequest(ip, time, isbn) {
    let client = new MongoClient(uri, config);
    try {
        await client.connect();
        let logs = client.db('bookservice').collection('log');
        console.log();
        // await books.updateMany(
        //     {},
        //     { $set: { "prestado": false } }
        // );
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}