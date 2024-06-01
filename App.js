const express = require("express");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");
const session = require('express-session')

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
Port = 4000;

const sessionMiddleware = session({
    secret: "changeit",
    resave: true,
    saveUninitialized: true,
  });

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}))

let userMap ={};

app.get("/login", (req, res)=>{
    if(req.session.isLogin){
        return res.redirect("/profile");
    }
    res.render("login");
})

app.post("/login", (req, res)=>{
    const {name} = req.body;
    req.session.name = name;
    req.session.isLogin = true;
    res.redirect("/profile");
})

app.get("/profile", (req, res)=>{
    if(!req.session.isLogin){
        return res.redirect("/login");
    }
    res.render("profile", {
        name:req.session.name
    });
})

app.get("/logout", (req, res)=>{
    req.session.destroy((err)=>{
        if(err) res.send(err);
        res.redirect("/login");
    })
})

io.on("connection", (socket)=>{

    require("./Socket/newUser")(socket, userMap, io);
 
    require("./Socket/newmessage")(socket, userMap, io);

    require("./Socket/disconnect")(socket, userMap, io);

    
})

httpServer.listen(Port, ()=>{
    console.log("Server Running at Port", Port);
})