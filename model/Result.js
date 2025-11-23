const mongoose = require('mongoose');

const resultSchema = mongoose.Schema({
    map: {
        type: String,
        enum: ["erangel", "miramar", "rondo", "random"]
    },
    type: {
        type: String,
        enum: ["t1", "t2", "t3", "paid", "others"]
    },
    pos: {
        type: Number
    },
    kills: {
        type: Number
    },
    sangwan: {
        type: Number
    },
    mayank: {
        type: Number
    },
    contra: {
        type: Number
    },
    jahir: {
        type: Number
    },
    sungod: {
        type: Number
    },
    campz: {
        type: Number
    },
    others: {
        type: Number
    }
});

const Result = mongoose.model("results", resultSchema);

module.exports = Result;