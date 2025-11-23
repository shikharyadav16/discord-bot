const mongoose = require('mongoose');

async function connectToDb(folderPath) {
    try {
        await mongoose.connect(folderPath);
        console.log("Database connected!")
    } catch (err) {
        console.log("Database connection error!", err)
    }
}

module.exports = connectToDb;