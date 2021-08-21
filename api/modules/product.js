const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : [String], required : true},
    price: {type : Number, required : true},
    discount : {type : Number, required : true},
    details : {type : [String], required : true},
    properties : {type : [mongoose.Schema.Types.ObjectId], required : true, ref : "Property"},
    imageCreatedTime : {type : Number, required : true},
    imageUrl : {type : String, default : ""},
    publicIdOfImage : {type : String, default : ""}
});

module.exports = mongoose.model('Product', productSchema);