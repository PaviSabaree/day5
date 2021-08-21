const mongoose= require('mongoose');
const Schema = mongoose.Schema;

const UserSchema= new Schema({
    email:{
        type: String,
        required: true,
        minlength:4,
        trim: true
    },
    password:{
        type:String,
        required: true,
        minlength:4,
       
    },
   
});
module.exports=mongoose.model('users',UserSchema);