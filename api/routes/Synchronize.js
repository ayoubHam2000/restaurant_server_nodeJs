const express = require('express');
const router = express.Router();

const SynchronizeSchema = require('../modules/synchronize');
const synchronizeLifeTime = 30;

router.get(('/'), (req, res, next) => {

    const resultBody = [];
    const deletedSynchronizeIds = [];

    SynchronizeSchema.find()
    .exec()
    .then(result => {
        makeResultByItem(result);

        makeMessage("success to get all synchronize");
        makeMessage(resultBody);
        makeMessage(deletedSynchronizeIds);
        
        res.status(200).json({
            synchronizeLifeTime : synchronizeLifeTime,
            currentTime :parseInt((new Date().getTime()) / 1000),
            deletedSynchronize : deletedSynchronizeIds,
            result : resultBody
        });
    })
    .catch(error => {
        makeMessage("failed to get all synchronize");
        makeMessage(error);
        res.status(500).json({
            discription : "failed to get all synchronize",
            error : error
        })
    })

    function makeResultByItem(result){
        for(i in result){
            id = result[i]._id;
            oldTime = result[i].time
            if(differentTime(id, oldTime)){
                const newObject = {id : id, time : oldTime};
                resultBody.push(newObject);
            }else{
                deleteSynchronize(id);
                deletedSynchronizeIds.push(id);
            }
        }
    }

    function differentTime(id, oldTime){
        const currentTime = parseInt(new Date().getTime() / 1000);
        const different = currentTime - oldTime;
        makeMessage("current time : "  + currentTime);
        makeMessage("old time : "  + oldTime);
        makeMessage("diffrent time : "  + different);
        if(different > synchronizeLifeTime){
            return false
        }else{
            return true
        }
    }

    function deleteSynchronize(id){
        SynchronizeSchema.deleteOne({_id : id})
        .exec()
        .then(result => {
            makeMessage("success to delete synchronize");
            makeMessage("synchronize deleted : " + id);
        })
        .catch(error => {
            makeMessage("failed to delete synchronize" + id);
            res.status(500).json({
                discription : "failed to delete synchronize daring get all synchronize",
                error : error
            })
        })
    }

})


router.post(('/'), (req, res, next) => {

    synchronizeId  = req.body._id;
    const date = new Date();
    const time = parseInt(date.getTime() / 1000);

    const newSyncronize = new SynchronizeSchema({
        _id : synchronizeId,
        time : time
    })

    SynchronizeSchema.find({_id : req.body._id})
    .exec()
    .then(result => {
        if(result.length == 0){
            makeMessage("success to get synchronize by id it empty");
            makeMessage("begain to save new synchronize");
            saveSynchronize();
        }else{
            makeMessage("success to get synchronize by id but it not empty");
            res.status(200).json({
                _id : "not empty"
            })
        }
    })
    .catch(error => {
        makeMessage("failed to get synchronize by id");
        makeMessage(error);
        res.status(500).json({
            discription : "failed to get synchronize by id",
            error : error
        })
    })

    function saveSynchronize(){
        newSyncronize
        .save()
        .then(result => {
            makeMessage("success to post synchronize");
            makeMessage(result);
            res.status(200).json({
                _id : synchronizeId,
                time : time,
                synchronizeLifeTime : synchronizeLifeTime
            });
        })
        .catch(error => {
            makeMessage("failed to post synchronize");
            makeMessage(error);
            res.status(500).json({
                discription : "failed to post synchronize",
                error : error
            })
        })
    }
    
})

router.delete(('/:synchronizeId'), (req, res, next) => {
    SynchronizeSchema.deleteOne({_id : req.params.synchronizeId})
    .exec()
    .then(result => {
        makeMessage("success to delete synchronize");
        makeMessage("synchronize deleted : " + req.params.synchronizeId);
        res.status(200).json({
            synchronizeId : req.params.synchronizeId
        })
    })
    .catch(error => {
        makeMessage("failed to delete synchronize");
        res.status(500).json({
            discription : "failed to delte synchronize",
            error : error
        })
    })
})

function makeMessage(message){
    if(true){
        console.log(message)
    }
}

module.exports = router;