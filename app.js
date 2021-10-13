// require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
const mongoose = require('mongoose');


let port = process.env.PORT || 8081
const server = http.createServer(app)

const mongoUrl = process.env.DB_CONNECTION || "mongodb+srv://Tina:pfDHC6ZsPHOhbep3@cluster0.f26km.mongodb.net/train?retryWrites=true&w=majority"

// Import Routes
const clientAuthRoute = require('./routes/client/auth');
const ticketRoutes= require('./routes/ticket.routes')

// ROUTES
app.get('/', (req, res) => {

    res.send("Hello from home")
});



app.use(cors({origin: '*'}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '500mb',extended: true}));
app.use(bodyParser.json({limit: '500mb'}));



// Route Middleware
app.use('/api/mobile', clientAuthRoute),
app.use('/api/mobile',ticketRoutes)

mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify:false
    })
    .then(res => {
        console.log("connected to db")
    })
    .catch(err => {
        console.log(err)
    })

// CREATE SERVER
server.listen(port, () => {
    console.log(`server running on port ${port}`)
})