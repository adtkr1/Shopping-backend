//schema for order

const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const orderschema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',required:true },
    quantity:{type:Number,default:1}
})
module.exports = mongoose.model('Order', orderschema);