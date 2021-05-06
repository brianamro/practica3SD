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
    const libros = client.db('bookservice').collection('libros');

    //Obtenemos todos los ISBN de la base de datos y los guardamos en un arreglo
    const allISBN = await getBooks();
    //Seleccionamos uno al azar
    const randomISBN = allISBN[ Math.floor( Math.random()*allISBN.length )];
    //Obtenemos la información completa del libro random
    const randomBook = await libros.find(randomISBN).toArray();

    const result = await libros.updateOne(
      { ISBN: randomBook[0].ISBN },
      { $set: { "prestado": true } }
    );

        return randomBook[0];

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}


async function getBooks() {
    let client = new MongoClient(uri, config);

    try {
        await client.connect();
        //Regresa solo los ISBN de los libros que no han sido prestados.
        const projection = {_id: 0, ISBN: 1}
        let books = client.db('bookservice').collection('libros');
        return await books.find( {prestado: false} ).project(projection).toArray();
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

async function logRequest(ip, isbn) {
    let client = new MongoClient(uri, config);
    try {
        await client.connect();
        const newLogin = {
          ip: ip,
          time: new Date(),
          isbn: isbn
        };
        let logs = client.db('bookservice').collection('log');
        return await logs.insertOne(newLogin);
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function resetLogin() {
  let client = new MongoClient(uri, config);
    try {
        await client.connect();
        let logs = client.db('bookservice').collection('log');
        return await logs.deleteMany({});
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}