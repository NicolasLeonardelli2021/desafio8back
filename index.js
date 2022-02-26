const express = require("express")
const app = express()
let {config} = require("./config");
let db_knex = require("./config/database")
let sqlite_knex = require("./config/dbSqlite")
let moment = require("moment")
let cors = require("cors")
let path = require('path')
let {Server: HttpServer} = require('http')
let {Server:SocketIO} = require('socket.io');
const PORT = config.port;

app.use(cors("*"));
console.log(PORT);

app.use(express.json());                    
app.use(express.urlencoded({extended:true}));

app.set("views", path.join(__dirname,"./views/ejs"));
app.set("view engine", "ejs");





// Crear tabla productos
(async () => {
    try {
        let existeTabla = await db_knex.schema.hasTable("productos");
        if(!existeTabla){
            await db_knex.schema.createTable("productos", table =>{
                table.increments("id").primary(),
                table.string("titulo"),
                table.float("precio"),
                table.string("url")
            });
        }else{
            console.log("Esta tabla ya existe");
        }        
    } catch (error) {
        console.log(error);
    }
})();

 //Crear tabla chat
 
(async () => {
    try {
        let existeTabla = await sqlite_knex.schema.hasTable("chats");
        if(!existeTabla){
            await sqlite_knex.schema.createTable("chats", table =>{
                table.increments("id").primary(),
                table.string("mail"),
                table.string("mensaje"),
                table.dateTime("hora")
            });
        }else{
            console.log("tabla chat ya existe");
        }        
    } catch (error) {
        console.log(error);
    }
})();


let http = new HttpServer(app);
let io = new SocketIO(http);

 // Nueva coneccion
io.on("connection", socket =>{
    console.log("Nuevo cliente conectado:", socket.id)

// carga los datos de iniciales
    db_knex.from('productos').select("*")
        .then((rows)=>{
            socket.emit("produc",rows)
            
        })
    

    // inserta datos en BD
    socket.on("datos",data =>{
        db_knex('productos').insert(data)
        .then(()=>console.log("dato insertado"))
        .catch((err)=> {console.log(err); throw err})

            io.sockets.emit("tabla",data)
        })
    
   // carga chat iniciales

   sqlite_knex.from('chats').select("*")
        .then((rows)=>{
            socket.emit("chatInit",rows)
           
        })

    // inserta datos en chat
        socket.on("nuevoChat",data =>{
            datos={
                ...data,
                hora: moment().format("YYYY-MM-DD HH:mm:ss")
            }
            sqlite_knex('chats').insert(datos)
        .then(()=>console.log("dato insertado"))
        .catch((err)=> {console.log(err); throw err})

            io.sockets.emit("mensaje",datos)
           
        //})
    })

})
 //renderizar pagina
 app.get("/", (req,res,next) =>{
    res.render("index", {});   
})

http.listen(PORT, ()=>{
    console.log(`estamos escuchando en esta url: http://localhost:${PORT}`)
})
