const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/',(req,res,next)=>{
    const {fullname,username,password} = req.body;
    const newUser = {fullname,username,password};

    if (!username) {
        const err = new Error('Missing `username` in request body');
        err.status = 400;
        return next(err);
      }

      User.create(newUser)
      .then(results=> res.location(`${req.originalUrl}/${results.id}`).status(201).json(results))
      .catch(err => next(err))
        
    });

    module.exports = router;
