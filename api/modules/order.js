const mongoose = require('mongoose');

const property = mongoose.Schema({
    name : {type : String, required : true},
    details : {type : [String], required : true}
},{_id : false}
);

const product = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    quantity : Number,
    properties : [property]
});

const OrdersSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    products : [product],
    date : Date
});

module.exports = mongoose.model('Order', OrdersSchema);