'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var pinSchema = new Schema({
    image_url: String,
    title: String
});

var userSchema = new Schema({
    github: {
        id: String,
        displayName: String,
        username: String,
        publicRepos: Number
    },
    pins: [pinSchema]
});

module.exports = mongoose.model('User', userSchema);
