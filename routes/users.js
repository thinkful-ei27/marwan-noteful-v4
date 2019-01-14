const express = require('express');
const router = express.Router();
const User = require('../models/user');


router.post('/',(req,res,next)=>{
 const {fullname,username,password} = req.body;

 const requiredFields = ['username', 'password'];
 const missingField = requiredFields.find(field => !(field in req.body));

 if (missingField) {
   const err = new Error(`Missing '${missingField}' in request body`);
   err.status = 422;
   return next(err);
 }

 const stringFields = ['username', 'password', 'fullname'];
 const nonStringField = stringFields.find(
   field => field in req.body && typeof req.body[field] !== 'string'
 );

 if (nonStringField) {
   return res.status(422).json({
     code: 422,
     reason: 'ValidationError',
     message: 'Incorrect field type: expected string',
     location: nonStringField
   });
 };

  const nonTrimmedField = requiredFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  };

  const sizedFields = {
    username: {min:1}
    ,
  password: {min: 8, max: 72}
};

const tooSmallField = Object.keys(sizedFields).find(
  field => 
  'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
);

const tooLargeField = Object.keys(sizedFields).find(
  field =>
  'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
);

if (tooSmallField || tooLargeField) {
  return res.status(422).json({
    code: 422,
    reason: 'ValidationError',
    message: tooSmallField
      ? `Must be at least ${sizedFields[tooSmallField]
        .min} characters long`
      : `Must be at most ${sizedFields[tooLargeField]
        .max} characters long`,
    location: tooSmallField || tooLargeField
  });
}

return User.hashPassword(password)
.then(digest => {
  const newUser = {
    username,
    password: digest,
    fullname
  };
  return User.create(newUser);
})
.then(result => {
  return res.status(201).location(`http://${req.headers.host}/api/users/${result.id}`).json(result);
})
.catch(err => {
  if (err.code === 11000) {
    err = new Error('The username already exists');
    err.status = 400;
  }
  next(err);
});

    });

    module.exports = router;
