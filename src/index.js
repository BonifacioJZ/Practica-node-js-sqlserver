//importacion de los complementos a usar
const express = require('express')
const app = express()
const fs  = require('fs')
const https = require('https')
const path = require('path')
const mssql = require('mssql')
const exphbs = require('express-handlebars')


//establecemos el puerto a utilisar
const port = process.env.PORT || 3000
//optener los archivos para el sertificado ssl
var key = fs.readFileSync(path.resolve('server.key'))
var cert = fs.readFileSync(path.resolve('server.cert'))
//settings
app.set('view',path.join(__dirname,'views'))
app.engine('.hbs',exphbs({
    defaultLayout: 'main',
    layoutsDir:path.join(app.get('views'),'layouts'),
    partialsDir:path.join(app.get('views'),'partials'),
    extname:'.hbs'
}));

app.set('view engine','.hbs');
//middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())
//archivos estaticos
app.use(express.static(path.join(__dirname,'public')))

var config ={
    user:'tics',
    password:'tic2019',
    server:'192.168.0.38',
    port:1433,
    database:'itspa'
}
//json donde colocamos los archivos para el servidor
var options ={
    key,
    cert
}

//rutas del servidor
app.get('/', function (req, res) {
    res.render('crud/add')
  })
//rutas de prueba  
app.get('/prueba',(req,res)=>{

    var request = new mssql.Request()
    request.query(`execute InsertarUsuario '${'juan'}','${'perz'}','${23}','${'ghost6699'}'`,(err,result)=>{
        if(err){
            console.log(err)
        }else{
            const data = result
            console.log(data)
        }
    })
})  

app.get('/prueba2',(req,res)=>{
    var request = new mssql.Request()
    request.query(`execute verusuarios`,(err,resulst)=>{
        if(err)console.log(err)
        else{
            const data = resulst.recordset
            console.log(data.nombre)
            res.send(data.nombre)
        }
        
    })
})
  //execucion del servidor con ssl
var connection = mssql.connect(config,(err,res)=>{
    if(err){
        console.log(err)
    }else{
        console.log('conecion exitosa ala base de datos')
        https.createServer(options,app).listen(port,()=>{
            console.log(`https://localhost:${3000}`)
        })
    }
})