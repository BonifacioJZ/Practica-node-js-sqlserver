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
app.set('views',path.join(__dirname,'src/views'))
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
app.post('/add', (req,res)=>{
    const {nombre,apellido,edad,contrasena} = req.body
    const newLink={
        nombre,
        apellido,
        edad,
        contrasena
    } 
    var request = new mssql.Request()
    request.query(`execute InsertarUsuario '${newLink.nombre}','${newLink.apellido}','${newLink.edad}','${newLink.contrasena}'`,(err,resulst)=>{
        if(err) console.log(err)
        else res.redirect('/usuarios')  
        
    })
})
app.get('/usuarios',(req,res)=>{
    var request = new mssql.Request()
    request.query(`execute SelectUsuarios`,(err,result)=>{
        if(err) res.status(400).send('error al consoltar la base de datos')
        else res.render('crud/usuarios',{usuarios:result.recordset})
    })
}) 

app.get('/edit/:id',(req,res)=>{
    const {id} = req.params
    var request = new mssql.Request()
    request.query(`execute SelectUsuario ${id}`,(err,result)=>{
        if(err) res.send('error al buscar')
        else res.render('crud/usuario',{usuario:result.recordset[0]})
        
    })
})
app.post('/edit/:id',(req,res)=>{
    const {id}= req.params
    const {nombre,apellido,edad,contrasena} = req.body
    var request = new mssql.Request()
    request.query(`execute ActualizarUsuario ${id},'${nombre}','${apellido}',${edad},'${contrasena}'`,(err,result)=>{
        if(err)res.send('Error al actualizar')
        else res.redirect('/usuarios')
    })
})
app.get('/delete/:id',(req,res)=>{
    const {id} = req.params
    var request = new mssql.Request()
    request.query(`execute EliminarUsuario ${id}`, (err,resultado)=>{
        if(err) res.send('error al eliminar')
        else res.redirect('/usuarios')
    })
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
            console.log(data)
            res.send(data)
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
            console.log(`https://localhost:${port}`)
        })
    }
})