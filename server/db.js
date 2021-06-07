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
        let client = new MongoClient(this._uri, this._mongoConfig);
        try {
            await client.connect();
            let db = client.db(this._db);
            return await query(db);
        } catch (e) {
            return e;
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    async setBorrowedBook(isbn) {
        return this.execQuery(async db => {
            let libros = db.collection('libros');
            return await libros.updateOne(
                { isbn: isbn },
                { $set: { prestado: true } }
            );
        });
    }

    async setBooksBatch(bookArr) {
        return this.execQuery(async db => {
            let books = db.collection('libros');
            await books.deleteMany({});

            return await books.insertMany(bookArr, { ordered: true });
        });
    }
    async getRandomBook() {
        return this.execQuery(async db => {
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
        return this.execQuery(async db => {
            let books = db.collection('libros');
            return await books.aggregate([
                { $project: { _id: false } }
            ]).toArray();
        });
    }
    async getAvailableBooks() {
        return this.execQuery(async db => {
            let books = db.collection('libros');
            return await books.find({ prestado: false }).toArray();
        });
    }
    async areAvailableBooks() {
        return this.execQuery(async db => {
            let books = db.collection('libros');
            return (await books.countDocuments({ prestado: false })) > 0;
        });
    }
    async resetBooks() {
        return this.execQuery(async db => {
            let books = db.collection('libros');

            return await books.updateMany(
                {},
                { $set: { "prestado": false } }
            );
        });
    }

    async logRequest(ip, isbn) {
        return this.execQuery(async db => {
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
        return this.execQuery(async db => {
            let logs = db.collection('log');
            return await logs.aggregate([
                { $project: { _id: false } }
            ]).toArray();
        });
    }

    async logRequestBatch(reqs) {
        return this.execQuery(async db => {
            let logs = db.collection('log');
            await logs.deleteMany({});

            return await logs.insertMany(reqs, { ordered: true });
        });
    }

    async resetLogs() {
        return this.execQuery(async db => {
            let logs = db.collection('log');
            return await logs.deleteMany({});
        });
    }
}