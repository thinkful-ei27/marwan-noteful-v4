const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
fullname: { type: String},
username: {type: String, required: true, unique:true},
password: {type: String, required: true}
});

userSchema.set('toJSON',{
    virtuals: true,
    transform: (doc, result) => {
        delete result._id;
        delete result.__v;
        delete result.password;
    }
});

module.exports = mongoose.model('User',userSchema);

