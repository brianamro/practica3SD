const { MongoClient } = require("mongodb");

// TODO: conseguir uri de la segunda base de datos
const uri =
    "mongodb+srv://brian:pass@clusterrico.vre9s.mongodb.net/bookserviceBackup?retryWrites=true&w=majority";

const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

async function setBorrowedBook(bookID) {
    let client = new MongoClient(uri, config);
    try {
        await client.connect();
        let libros = client.db('bookserviceBackup').collection('libros');
        return await libros.updateOne(
            { _id: bookID },
            { $set: { prestado: true } }
        );
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function resetBooks() {
    let client = new MongoClient(uri, config);
    try {
        await client.connect();
        let books = client.db('bookserviceBackup').collection('libros');
        return await books.updateMany(
            {},
            { $set: { "prestado": false } }
        );
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function logRequest(log) {
    let client = new MongoClient(uri, config);
    try {
        await client.connect();
        let logs = client.db('bookserviceBackup').collection('log');
        return await logs.insertOne(log);
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
        let logs = client.db('bookserviceBackup').collection('log');

        let resp = {
            type: "resetLogin",
        }
        socket.write(JSON.stringify(resp));

        return await logs.deleteMany({});
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

export {
    resetLogin,
    logRequest,
    resetBooks,
    setBorrowedBook
}