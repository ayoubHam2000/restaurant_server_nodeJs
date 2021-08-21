const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const testModule = require('../modules/testModule');

router.get(('/'), (req, res, next) => {
    testModule.find()
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(error => {
        res.status(500).json(error);
    })
})

router.post(('/'), (req, res, next) => {
    
    const newtest = new testModule({
        _id :new mongoose.Types.ObjectId(),
        name : req.body.name
    });

    newtest.child = [{
        _id : new mongoose.Types.ObjectId(),
        name : "new name"
    }]

    newtest
    .save()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(error => {
        res.status(500).json(error);
    })
})

module.exports = router;