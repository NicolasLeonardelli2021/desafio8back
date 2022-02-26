let {db} = require("./index");
let knex = require("knex"); 

var base = knex({
    client: 'sqlite3',
    connection: {
        filename: "./DB/ecomerce.sqlite"
    },
    useNullAsDefault:true
  });
  
  class DatabaseC {
    static client;
    constructor(){
        if(DatabaseC.client){
            return DatabaseC.client;
        }
        DatabaseC.client = base;
        this.client = DatabaseC.client;
    }
}

module.exports = new DatabaseC().client;