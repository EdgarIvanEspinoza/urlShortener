require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var mongoose = require('mongoose')
var bodyParser = require('body-parser');
let urlShortened;

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {

// Dominio que tengan acceso (ej. 'http://example.com')
   res.setHeader('Access-Control-Allow-Origin', '*');

// Metodos de solicitud que deseas permitir
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

// Encabecedados que permites (ej. 'X-Requested-With,content-type')
   res.setHeader('Access-Control-Allow-Headers', '*');

next();
})

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
////////////////IVAN//////////////////

const { Schema } = mongoose;
//Defining the schema for moongose
const shortURLSchema = new Schema({
    original_url : String,
    short_url :  Number
  });

const shortURL = mongoose.model('shortURL', shortURLSchema)

const createAndSaveURL = (urlId, urlBody, callbackFunction) => {
  console.log('we are writing');

  urlShortened = new shortURL({
    original_url : urlBody,
    short_url : urlId
  })

  urlShortened.save((err, data) => {
    console.log('we are saving')
    if (err) {
        console.log(err);
        return callbackFunction(err)
    }
    callbackFunction(null, data);
  })
}

app.post('/api/shorturl', (req, res)=> {
    const httpRegex = /^(http|https)(:\/\/)/;
    console.log(req.body.url)
  //Prueba si es una URL Valida primero
    if(httpRegex.test(req.body.url)) {
    console.log('We are in')
    console.log(req.body.url)
    const urlId = Math.floor(Math.random()*1000);
    console.log(urlId);
        createAndSaveURL(urlId, req.body.url, (err, data) => {
            if (err) {
              console.log('error en createAndSaveURL')
               return console.log('Error 500')
            }
            
            console.log('And we are out')
            res.status(201).json({ 
                'original_url' : data.original_url,
                'short_url' : data.short_url
            });
            })
            } else {
            // Error en caso de no ser una URL valida
                console.log('We are in error mate!')
                res.json({ error: 'invalid url' });
            }
})

app.get('/api/shorturl/:short_url', (req, res) => {
    const id = req.params.short_url;
    console.log(id)
    shortURL.findOne({short_url : id}, (err, data)=>{
        if(!data){
            // Error en caso de no ser una URL valida
            console.log('error en findOne')
            console.log('Error 500')
            res.json({error: 'Invalid URL'})
        } else {
            res.redirect(data.original_url)
        }
    })
})