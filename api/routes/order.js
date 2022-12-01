const express=require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CheckAuth = require('../Middleware/Check_auth');

const Order = require('../models/order_schema');
const Product = require('../models/product_schema');

router.get('/',CheckAuth, (req, res, next) => {
    Order.find()
        .select('product id quantity') 
        .exec()
        .then(result =>
        {
            res.status(200).json({
                count: result.length,
                Orders: result.map(docs => {
                    return {
                        _id: docs._id,
                        product: docs.product,
                        quantity: docs.quantity,
                        request:
                        {
                            type: 'GET',
                            url:'http://localhost:80/orders/'+ docs._id
                        }
                    }
                })
            });
            })
        .catch(err => {
            res.status(500).json(err);
        })
});

router.post('/',CheckAuth, (req, res, next) => {
    Product.findById(req.body.product)
        .then(product => { //Product isn't Exist
            if (!product) {
                return res.status(404).json('Product Not Found')
            }
            //Cretaing a New Order
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                product: req.body.product,
                quantity: req.body.quantity
            });
            return order.save();
        })
        .then(result => { //Successfully Created
            res.status(201).json({
                message: "Order Stored",
                CreatedProduct: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:80/orders'
                    }
                }
            })
        })
        .catch(err =>
        {
            console.log(err);
            res.status(404).json({ err });
            })
});

//Looking for a specific Order
router.get('/:orderid',CheckAuth, (req, res, next) => {
    Order.findById(req.params.orderid)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Requested Order',
                des: result
            })
        })
        .catch(err => {
            res.status(404).json('Not Found')
        })
});

//Update exisiting orders
router.patch('/:orderid',CheckAuth, (req, res, next) => {
    res.status(200).json({
        Message: 'Order Updated',
        id: req.params.orderid
    });
});

//Delete exisiting orders
router.delete('/:orderid',CheckAuth, (req, res, next) => {
    const id = req.params.orderid;
    Order.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Order Deleted",
                request: {
                    type: 'POST',
                    url: "https://localhost:80/orders",
                    message:'Add new Item'
                }
            })
        })
        .catch(error => {
            res.status(404).json("Not Found")
        });
});

module.exports = router;
