const express=require('express');
const app=express();
const morgan = require('morgan'); // For Creating Logs and Debigging
const bodyparser = require('body-parser'); // for parsing the body of incoming request
const mongoose = require('mongoose'); //helpful while debugging and also to create Log files.


mongoose.Promise = global.Promise;

mongoose.connect('mongodb://Aditya:Aditya@cluster0-shard-00-00.tuh13.mongodb.net:27017,cluster0-shard-00-01.tuh13.mongodb.net:27017,cluster0-shard-00-02.tuh13.mongodb.net:27017/?ssl=true&replicaSet=atlas-6m68fs-shard-0&authSource=admin&retryWrites=true&w=majority');

//Importing APIs
const pr = require('./api/routes/product');
const ur = require('./api/routes/user');
const or = require('./api/routes/order');

app.use(bodyparser.urlencoded({ extended: false })); //body parser Middleware Extended false means less rich data to parse
app.use(bodyparser.json()); //body parser Middleware

app.use(morgan('dev')); //Morgan Middleware

app.use(express.static('uploads'));

//Hnading CORS Error
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); //"*" Give access to any Origin
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,Authorization");
    if (req.method === 'OPTIONS') //To find out which request methods a server supports
    {
        res.header("Access-Control-Allow-Methods", "POST,GET,PATCH,DELETE,PUT"); 
        return res.status(200).json({});
    }
    next(); //unblocking incoming request
});

//Routes that Handle requests
app.use('/products', pr);
app.use('/orders', or);
app.use('/users', ur);


//custom error Handler

app.use((req, res, next) => {
    const error = new Error('Not Found'); // Deafult Error Object
    error.status = 404; //404=NOT FOUND
    next(error);
});

//Error from Database(failed Operation) etc

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});
module.exports=app;