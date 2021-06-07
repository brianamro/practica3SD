const { MongoClient } = require("mongodb");

export default class Db {
    _mongoConfig = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    constructor(uri, db) {
        this._uri = uri;
        this._db = db;
    }
    async execQuery(query) {
        let client = new MongoClient(this._uri, this._config);
        try {
            await client.connect();
            let db = client.db(this._db);
            return query(db);
        } catch (e) {
            return e;
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    async setBorrowedBook(isbn) {
        return this.execQuery((db) => {
            let libros = db.collection('libros');
            return await libros.updateOne(
                { isbn: isbn },
                { $set: { prestado: true } }
            );
        });
    }

    async setBooksBatch(books) {
        return this.execQuery((db) => {
            let bulk = db.collection('libros').initializeUnorderedBulkOp();
            for (let book of books) {
                bulk.find({ isbn: book.isbn }).updateOne({ $set: { prestado: book.prestado } });
            }
            return await bulk.execute();
        });
    }
    async getRandomBook() {
        return this.execQuery((db) => {
            let libros = db.collection('libros');

            let bookID = (await libros.aggregate([
                { $match: { prestado: false } },
                { $sample: { size: 1 } },
                { $project: { _id: true } }
            ]).next())?._id;
            if (bookID !== undefined) {
                return (await libros.findOneAndUpdate(
                    { _id: bookID },
                    { $set: { prestado: true } }
                )).value;
            } else {
                return Promise.reject(new Error('Could not get an available book'));
            }
        });
    }
    async getBooks() {
        return this.execQuery((db) => {
            let books = db.collection('libros');
            return await books.find({}).toArray();
        });
    }
    async getAvailableBooks() {
        return this.execQuery((db) => {
            let books = db.collection('libros');
            return await books.find({ prestado: false }).toArray();
        });
    }
    async areAvailableBooks() {
        return this.execQuery((db) => {
            let books = db.collection('libros');
            return (await books.countDocuments({ prestado: false })) > 0;
        });
    }
    async resetBooks() {
        return this.execQuery((db) => {
            await client.connect();
            let books = db.collection('libros');

            return await books.updateMany(
                {},
                { $set: { "prestado": false } }
            );
        });
    }

    async logRequest(ip, isbn) {
        return this.execQuery((db) => {
            let newLogin = {
                ip: ip,
                time: new Date(),
                isbn: isbn
            };

            let logs = db.collection('log');
            return await logs.insertOne(newLogin);
        });
    }

    async getLogs() {
        return this.execQuery((db) => {
            let logs = db.collection('log');
            return await logs.find({}).toArray();
        });
    }

    async logRequestBatch(reqs) {
        return this.execQuery((db) => {
            let logs = db.collection('libros');

            return await logs.insertMany(reqs, { ordered: true });
        });
    }

    async resetLogs() {
        return this.execQuery((db) => {
            let logs = db.collection('log');
            return await logs.deleteMany({});
        });
    }
}