const mongoose= require ('mongoose');
const  User  = require('./model/User');
const express=require('express');
const app= express();
const jwt = require("jsonwebtoken");
const bcrypt=require('bcrypt');
const bodyParser=require('body-parser');
require('dotenv').config()
app.use(bodyParser.urlencoded({extended:true}));
mongoose.Promise=global.Promise;

mongoose.connect('mongodb://localhost:27017/mongoose', { useNewUrlParser: true , useUnifiedTopology: true })
    mongoose.connection
    .once('open',()=>console.log('connected'))
    .on('error',(err)=>{
        console.log('could not connect',err)
    });


app.get('/',(req,res)=>{
   res.send('ROOT');
  }),
// saving user
 app.post('/register',(req,res)=>{
     const newUser= new User()
     newUser.email=req.body.email;
      newUser.password=req.body.password;
    
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(newUser.password, salt,(err, hash)=>{
if(err) return err;
newUser.password= hash;
newUser.save().then(savedUser=>{
    res.send('user saved');
}).catch(err=>{
    res.send('user not save Because ...'+err);
});
        });
    });
        
    
    });

    // login routes
app.post('/login',(req,res)=>{
    User.findOne({email:req.body.email}).then(user=>{
        if(user){
            bcrypt.compare(req.body.password,user.password,(err,matched)=>{
                if(err) return err;
                if(matched){
                    res.send('user can login');
                    const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET)
                     res.json({accessToken:accessToken})
                }else{
                    res.send('user not able to login');
                }
            });
        }
    });
});

 // middleware
function authenticateToken(req,res,next){
    const authHeader=req.headers['authorization']
    const token=authHeader&&authHeader.split(' ')[1]
    if(token==null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403)
        req.user=user
        next()
    })
}


// fetching data
    app.get('/users',authenticateToken,(req,res)=>{
        User.find({}).then(users=>{
            res.send(users);
        })
    });
// updating data with patch
app.patch('/users/:id',(req,res)=>{
const id= req.params.id;
const firstName= req.body.firstName;

User.findByIdAndUpdate({_id:id},{$set:{firstName: firstName}},{new:true}).then(savedUser=>{
    res.send('user send by patch')
})
    });

    // updating data with put
app.put('/users/:id',(req,res)=>{
User.findOne({_id:req.params.id}).then(user=>{
    user.firstName=req.body.firstName;
    user.lastName=req.body.lastName;

    user.save().then(userSaved=>{
        res.send(userSaved);
        });
})
    });

    // deleting data

app.delete('/users/:id', (req,res)=>{
User.findOne({_id:req.params.id}).then(user=>{
    user.remove().then(userRemoved=>{
        res.send('user remove'+userRemoved)
    });
})
});


    const port= 4444|| process.env.PORT;
    app.listen(port,()=>{
        console.log(`listening on ${port}`);
    });