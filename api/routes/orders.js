const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../modules/order');

router.get(('/'), (req, res, next) => {
    Order.find()
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});

router.get(('/:orderId'), (req, res, next) => {
    orderId = req.params.orderId;
    Order.find({_id : orderId})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});

router.post(('/'), (req, res, next) => {
    const order = new Order({
        _id : mongoose.Types.ObjectId(),
        products : req.body.products,
        date : new Date()
    })
    order
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json(result);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json(error);
    });
});

router.delete(('/:orderId'), (req, res, next) => {
    orderId = req.params.orderId;
    Order.remove({_id : orderId})
    .exec()
    .then(result => {
        console.log("order removed");
        res.status(200).json({
            result : result,
            info : "order removed"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            err : error,
            info : "something went wrong"
        });
    });
});

module.exports = router;