const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override');
const {v4: uuidv4} = require("uuid");

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "/views"));
app.use(express.static(path.join(__dirname, "public")));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'sqldb',
  password: "samplepassword"
});


let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password()
  ];
}


// let q = "INSERT INTO `user` (id , username , email , password) VALUES ?";
// let data = [];
// for(let i = 1; i <= 100; i++){
//   data.push(getRandomUser());
// }


// try{
//     connection.query(q , [data] , function(err , result){
//         if(err) throw err;
//         // console.log(result);
//     });
// }
// catch(err){
//     console.log(err);
// }
// connection.end();



// home page (user count)
app.get("/" , (req , res) => {
  let q = `select count(*) from user`;
  try{
    connection.query(q , function(err , result){
        if(err) throw err;
        let count = result[0]["count(*)"];
        res.render("home.ejs" , {count});
    });
  }
  catch(err){
      console.log(err);
      res.send("some error");
  }
})


// all users
app.get("/user" , (req , res) => {
  let q = `select * from user`;
  try{
    connection.query(q , function(err , result){
        if(err) throw err;
        res.render("users.ejs" , {users: result});
    });
  }
  catch(err){
      console.log(err);
      res.send("some error");
  }
})



// edit
app.get("/user/:id/edit" , (req , res) => {
  let {id} = req.params;
  let q = `select * from user where id = '${id}'`;
  try{
    connection.query(q , function(err , result){
        if(err) throw err;
        res.render("edit.ejs" , {data: result[0]});
    });
  }
  catch(err){
      console.log(err);
      res.send("some error");
  }
})


// update
app.patch("/user/:id" , (req , res) => {
  let {id} = req.params;
  let newUsername = req.body.username;
  let inputPassword = req.body.password;

  let q = `select * from user where id = '${id}'`;
  // let q = `update user set username = '${newUsername}' where id = '${id}'`;
  try{
    connection.query(q , function(err , result){
        if(err) throw err;
        let user = result[0];
        if(inputPassword != user.password){
          res.send("wrong password!");
        }
        else{
          let q2 = `update user set username = '${newUsername}' where id = '${id}'`;
          connection.query(q2 , function(err , result){
            if(err) throw err;
            res.redirect("/user");
          })
        }
    });
  }
  catch(err){
      console.log(err);
      res.send("some DB error");
  }
})


// load form page to create new user
app.get("/user/new" , (req , res) => {
  res.render("new.ejs");
})


// create new user
app.post("/user" , (req , res) => {
  let {username , email , password} = req.body;
  let q = `insert into user (id , username , email, password) values(?, ?, ?, ?)`;
  let person = [uuidv4() , username , email , password];
  try{
    connection.query(q , person , (err , result) => {
      if(err) throw err;
      res.redirect("/user");
    })
  }
  catch(err){
    res.send("some DB error");
  }
})



// delete user
app.delete("/user/:id" , (req , res) => {
  let {id} = req.params;
  let q = `delete from user where id = '${id}'`;
  try{
    connection.query(q , (err , result) => {
      if(err) throw err;
      res.redirect("/user");
    })
  }
  catch(err){
    res.send("some DB error");
  }
})




app.listen("3000" , function(){
  console.log("listening to port 3000");
})