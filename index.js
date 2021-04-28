const express = require('express');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const port  = 5010;
const User = require('./modal/db')
app.set('view engine', 'ejs')
const randtoken = require('rand-token');
const cookieparser = require('cookie-parser');
const auth = require('./auth');
const Transcation = require('./modal/Transcations');

app.use(express.urlencoded({extended: false}));
app.use(cookieparser());

mongoose.connect("mongodb://localhost:27017/wallet", {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(() => {
    console.log("Connection successful");
}
).catch((e) => {
    console.log("Connection error");
})

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/data', auth, async (req, res) => {
    try
    {
    const token = req.cookies.token;
    const data = await User.findOne({token: token});
    if(token === data.token)
    {
        res.render('wallet', {data: data.balance});
    }
    else
    {
        res.render('login');
    }
}
   catch(e)
   {
       console.log(e)
       res.redirect('login')
   }
})

app.get('/addmoney', auth, (req, res) => {
    res.render('addmoney');
})

app.post('/addmoney', async (req, res) => {
    try
    {
    const data = await User.findOne({token: req.cookies.token})
    if(data)
    {
         const amount = parseInt(data.balance) + parseInt(req.body.amount)
        //res.send(`${amount}`);
        const ndata = await User.updateOne({token: req.cookies.token}, {$set: {balance : amount}}, function(er, res)
        {
            if(er)
            {
                console.log(er);
            }
            else
            {
                console.log(res);
            }
        });
        //User.save();
        res.redirect('/');
    }
    else
    {
        console.log("Not Save");
        res.redirect('data');
    }
    }
    catch
    {
        res.redirect('data');
        console.log(req.body.amount);
    }
})

app.get('/signup', (req, res) => {
    res.render('Signup');
})


app.post('/signup', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const token = randtoken.generate(16);

    const data = new User({
        email: email,
        password: password,
        token: token
    })

   data.save()
    res.render('login');
    console.log('saved')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    try
    {
    const email = req.body.email;
    const password = req.body.password;
     const data = await User.findOne({email});
     if(data)
     {
        if(data.password === password)
        {
            const token2 = data.token;
             res.cookie('token', token2, {
                expires: new Date(Date.now() + 500000),
                secure: false,
                httpflag: true
            });
            
            res.render('home');
        }
        else
        {
            console.log('Error');
            res.send('Wrong Password')
        }
     }
     else
     {
         console.log('Wrong');
         res.send('Wrong Email');
     }
}
catch(e)
{
    console.log(e);
    res.send(e);
}
})

app.get('/sendmoney',auth, (req, res) => {
    res.render('Sendmoney');
})

app.post('/sendmoney',auth, async (req, res) => {
    try
    {
        const amount = req.body.sendamount;
    const token = req.cookies.token;
    const data = await User.findOne({token: token});

    if(data)
    {
       const balance = data.balance;
       const senderemail = req.body.senderemail;
       if(amount <= balance && amount > 0)
       {
        const senderdetails = await User.findOne({email: senderemail});
           if(senderdetails)
           {
           const senderbalance = senderdetails.balance;
           const finalamount = parseInt(amount) + senderbalance;

           User.updateOne({email: senderemail}, {$set: {balance: finalamount}}, function(er, ress) {
               if(er)
               {
                   console.log(er);
                   res.redirect('data');
               }
               else
               {
                console.log(ress);
                // res.status(200).redirect('/');
                const history = new Transcation({
                    token: token,
                    email: senderemail,
                    tamount: `-${amount}`
                })
                history.save();

                async function go() {

                    const sendertoken = await User.findOne({token: req.cookies.token})
                    const senderemail = sendertoken.email;
                    const usertoken = await User.findOne({email: req.body.senderemail})
                    const receivertoken = usertoken.token;

                    const Transactiondata = new Transcation({
                        token: receivertoken,
                        email: senderemail,
                        tamount: `+${amount}`
                    })

                    Transactiondata.save();



                }
              go()
           const withdrawfinalamount = balance - parseInt(amount);

           User.updateOne({token: token}, {$set: {balance: withdrawfinalamount}}, function(er, ress) {
               if(er)
               {
                   console.log(er);
                   res.redirect('data');
               }
               else
               {
                console.log(ress);
                
                res.status(200).redirect('/');
               }
           })


               }
              
           })
        }
        else
        {
            res.send("Receiver not found")
        }
       }
       else
       {
           res.redirect('data');
       }
    }
    else
    {
        res.redirect('login');
    }

    }

    catch(e)
    {
        console.log(e);
        res.status('401').redirect('data');
    }
})

app.get('/transactions', async (req, res) => {
    try
    {
        const token2 = req.cookies.token;
    const dataa = await Transcation.find({token: token2});
    res.render('transactions', {dataa: dataa});
    dataa.forEach(element => {
        console.log(`${element.tamount}, ${element.email}, ${element.date}`);
    });
    //console.log(dataa);
    }

   catch(e)
   {
       console.log(e)
       res.redirect('login')
   }
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
})

app.listen(port, (e) => {
    console.log('Server is running on port 5010');
})