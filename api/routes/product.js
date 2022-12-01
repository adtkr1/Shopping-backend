const express=require('express');
const { default: mongoose } = require('mongoose');
const { count } = require('../models/product_schema');

const router=express.Router();
const Product = require('../models/product_schema'); //import schema of Product

const checkAuth = require('../Middleware/Check_auth'); //import chek_auth middleware

const multer = require('multer');
const filefilter=(req,file,cb)=> {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb)
    {
        cb(null,new Date().toISOString().replace+file.originalname);
    }
})
const upload = multer({
    storage: storage,
    limits: 1024 * 1024*9,
    fileFilter:filefilter
});

// to get/display all Product
router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productimage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                Products: docs.map(doc1 => { //Displaying Product Specification
                    return {
                        name: doc1.name,
                        price: doc1.price,
                        productimage:doc1.productimage,
                        _id: doc1._id,
                        request: {
                            type: 'GET',
                            url: "http://localhost:80/products/" + doc1._id
                        }
                    }
                })
            }
            res.status(200).json({response});
        })
        .catch(err => {
            console.log(err); //catch and display Error
            res.status(500).json({ Error: err });
        });
});

// To add product in backend
router.post('/', checkAuth, upload.single('productimage'),(req, res, next) => { //checkAuth used to verify the users
    console.log(req.file);

    //Creating a New Product
    const product = new Product({
        _id: new mongoose.Types.ObjectId(), //For creating unique ID
        name: req.body.name,
        price: req.body.price,
        productimage: req.file.path
    });
    product
        .save() //use for storing in the database
        .then(result => {
            console.log("Creating in Databse",result);
            res.status(200).json({
            Message: "Product Created Successfully",
                description: {
                    name: result.name,
                    price: result.price,
                    _id:result._id,
                    request: {
                        type: 'GET',
                        url: "http://localhost:80/products/" + result._id
                    }
            }
    });
        })
        .catch((err) => {   //to catch Error
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
    
});

// to get/display specific Product by Product id
router.get('/:productid', (req, res, next) => {
    const id = req.params.productid;
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            console.log("From database",doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    message: "Not Valid Id"
                });
            }
            
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err});
        });
});


//Updating Products in Database
router.patch('/:productid', checkAuth,(req, res, next) => {
    const id = req.params.productid;
    const updatepara = {};
    for (const j of req.body)
    {
        updatepara[j.Propname] = j.value;
    }
    Product.update({ _id: id }, { $set: updatepara })
        .exec()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Updated Successfully",
                request: {
                    type: "GET",
                    url: "http://localhost:80/products/"
                }
            } );
        })
        .catch(err =>
        {
            console.log(err);
            res.status(404).json({ error: err });
            })
});

// to delete a Product
router.delete('/:productid',checkAuth, (req, res, next) => {
    const id = req.params.productid; //Delete by Id
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Product Deleted",
                request: {
                    type: 'POST',
                    url: "http://localhost:80/products/",
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            })
        })
});

module.exports=router;
