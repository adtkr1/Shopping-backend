const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/user_schema'); //User Models

const bcrypt = require('bcrypt'); //For Hashing the Password

const router = express.Router();
const jwt = require('jsonwebtoken'); //jasonwebtoken

//Create New User
router.post("/signup", (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(doc => {
            if (doc.length >= 1) { // If user already exist 
                res.status(409).json({ // 409-conflict 
                    Message: 'Email Already Exists'
                })
            }
            else { //Create a new user
                bcrypt.hash(req.body.password, 10, (err, hash) => { //Encrypting password , 2nd parm is called Salting
                    if (err) {
                        res.status(501).json({
                            error: err
                        })
                    }
                    else { //encrypted successfully
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        })
                        user.save() // Save User in database
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    Message: 'User Created'
                                })
                            })
                            .catch(err => {
                                res.status(400).json({
                                    Message: err
                                })
                            })
                    }
                })
            }
        })
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length<1) {   //Empty array
                return res.status(400).json({
                    Message:'Auth Failed'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => { //comparing the database password with user entered passowrd
                if (err) {
                    return res.status(400).json({
                        Message: 'Auth Failed' //Incorrect credentials
                    })
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            Userid:user[0]._id
                        },
                        "hello",   //
                        {
                            expiresIn:"1h"
                        }
                    )
                    return res.status(200).json({
                        Message: 'Login Succuessfully',
                        token: token
                    });
                } 
                res.status(400).json({
                    Message: 'Auth Failed' //Incorrect credentials
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({
                Error:err
            })
        });
})

//Deleting Existing User
router.delete('/:userid', (req, res, next) => {
    User.remove({ _id: req.params.userid }) //to find User
        .exec()
        .then(result => {
            res.status(200).json({
                Message: 'User Deleted'
            })
        })
        .catch(err => {
            res.status(404).json({
                Error: err
            });
        });
})
module.exports = router;