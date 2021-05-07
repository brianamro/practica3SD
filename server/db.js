const { MongoClient } = require("mongodb");
const net = require('net');

const BACKUP_PORT = 5600;
const BACKUP_IP = "localhost";

const uri =
    "mongodb+srv://brian:pass@clusterrico.vre9s.mongodb.net/bookservice?retryWrites=true&w=majority";

const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

var socket;

(function main() {
    initSocket();
    resetBooks();
})();

function initSocket() {
    socket = net.connect({ port: BACKUP_PORT, host: BACKUP_IP }, () => {
        // 'connect' listener.
        console.log('connected to backup database!');
    });

    socket.on('end', () => {
        console.log("disconnected from backup database");
    });
}

async function getRandomBook() {
    let client = new MongoClient(uri, config);
    try {
        await client.connect();
        let libros = client.db('bookservice').collection('libros');

        let bookID = (await libros.aggregate([
            { $match: { prestado: false } },
            { $sample: { size: 1 } },
            { $project: { _id: 1 } }
        ]).next())?._id;
        if (bookID !== undefined) {
            let resp = {
                type: "setBorrowedBook",
                data: {
                    bookID: bookID
                }
            }
            socket.write(JSON.stringify(resp));

            return (await libros.findOneAndUpdate(
                { _id: bookID },
                { $set: { prestado: true } }
            )).value;
        } else {
            return Promise.reject(new Error('Could not get an available book'));
        }
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function getBooks() {
    let client = new MongoClient(uri, config);

    try {
        await client.connect();
        let books = client.db('bookservice').collection('libros');
        return await books.find({}).toArray();
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function getAvailableBooks() {
    let client = new MongoClient(uri, config);

    try {
        await client.connect();
        let books = client.db('bookservice').collection('libros');
        return await books.find({ prestado: false }).toArray();
    } catch (e) {
        return e;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function areAvailableBooks() {
    let client = new MongoClient(uri, config);

    try {
        await client.connect();
        let books = client.db('bookservice').collection('libros');
        return (await books.countDocuments({ prestado: false })) > 0;
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
        let resp = {
            type: "resetBooks",
        }
        socket.write(JSON.stringify(resp));

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

async function logRequest(ip, isbn) {
    let client = new MongoClient(uri, config);
    try {
        await client.connect();
        let newLogin = {
            ip: ip,
            time: new Date(),
            isbn: isbn
        };
        console.log(newLogin);

        let resp = {
            type: "logRequest",
            data: newLogin
        }
        socket.write(JSON.stringify(resp));

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
    getBooks,
    getRandomBook,
    logRequest,
    resetBooks,
    areAvailableBooks,
    getAvailableBooks
}