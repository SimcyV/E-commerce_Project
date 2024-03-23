// modules
const express=require("express");
const app=express();
require("dotenv").config()
const path=require("path");
const session=require("express-session");
const userRoute=require("./routers/userRoute");
const adminRoute=require("./routers/adminRoute");
const db=require("./config/db")
const flash=require("express-flash")
const nocache=require("nocache")
const authRoutes = require('./routers/authRoutes');
const breadcrumbs = require('express-breadcrumbs');
const swt=require("sweetalert2")
const sharp=require("sharp")

// static files serving
app.use(express.static("public"));

// parsers
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use (nocache())

// session
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
}))

//flash
app.use(flash())

// breadcrumbs
app.use(breadcrumbs.init());
 

// Set the home breadcrumb
app.use(breadcrumbs.setHome({
  name: 'Home',
  url: '/'
}));
 

// Mount the breadcrumbs middleware for the '/admin' route
app.use('/admin', breadcrumbs.setHome({
    name: 'Dashboard',
    url: '/admin'
  }));
// view engine
// app.set(express.static(path.join(__dirname,"views")))
app.set("views", path.join(__dirname, "views"));

app.set("view engine","ejs")

// route set
app.use("/",userRoute);
app.use("/",adminRoute);
app.use('/', authRoutes);




// port
const PORT=process.env.PORT;
app.listen(PORT,()=>{
    console.log(`server connected on http://localhost:${PORT}, http://localhost:${PORT}/admin `);
})