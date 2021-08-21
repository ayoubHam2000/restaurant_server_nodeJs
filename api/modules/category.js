const mongoose = require('mongoose');

const categotySchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : [String], required : true},
    products : {type : [mongoose.Schema.Types.ObjectId], require : true, ref : "Product"}
});

module.exports = mongoose.model('Category', categotySchema);