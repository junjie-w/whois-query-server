// use express sessions 
// use session store

import express from "express";
import mongoose from "mongoose";
import Cors from "cors";
import dotenv from 'dotenv';
import net from 'net';
import helmet from 'helmet';
import DomainInfo from "./model/domainInfo.js";
import session from 'express-session'; // keep the session per user
import MongoStore from 'connect-mongo';

dotenv.config();

const app = express();
app.use(express.json());
// app.use(express.urlencoded({
//     extended: true
// }))
const port = process.env.PORT || 8000;

// !important - Please enter your own username and password for MongoDB database in the .env file
const connection_url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gblkt.mongodb.net/queriesdb?retryWrites=true&w=majority`
const whois_url = `whois.verisign-grs.com`

// Configure CORS
let whitelist = ['http://localhost:4200', 'http://localhost:8000']
let corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(Cors(corsOptions));

app.use(helmet());

// const sessionStore = new MongoStore({
//     mongooseConnection: connection,
//     collection: 'sessions'
// })

//* added using session middleware
app.use(session({
    secret: process.env.SECRET, // protect the data from being used maliciously 
    resave: false,
    saveUninitialized: true,
    //* session store, connect database to this express-session middleware
    store: MongoStore.create({
        mongoUrl: connection_url
    }),
    cookie: {
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 //Equals one day
    }
}));

//* change this to async await 
// async () => {
//     try {
//         await mongoose.connect(connection_url, {
//             useNewUrlParser: true,
//             useCreateIndex: true,
//             useUnifiedTopology: true,
//             useFindAndModify: false
//         })
//         console.log('Database sucessfully connected')
//     } catch (err) {
//         console.log('Database error: ' + error)
//     }
// }

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
        console.log('Database sucessfully connected')
    },
    error => {
        console.log('Database error: ' + error)
    }
)

app.get('/whois', async (req, res) => {
    let domain = req.query.domain;
    // console.log(domain)
    console.log(req.session)
    // if (req.session.viewCount) {
    //     req.session.viewCount++
    // } else {
    //     req.session.viewCount = 1
    // }

    //* Class: net.Socket
    //* this class is an abstraction of a TCP socket or a streaming IPC endpoint. It is also an EventEmitter.
    //* A net.Socket can be created by the user and used directly to interact with the server. 
    //* it can also be created by Node.js and passed to the user when a connection is received. 
    let client = new net.Socket();

    let whois = ""

    try {
        client.connect(43, whois_url, function () {
            client.write(domain + "\r\n");
        });

        client.on('data', function (data) {
            whois += data;
        });

        // store user queries into MongoDB
        DomainInfo.create({
            name: domain
        }, (err, data) => {
            if (err) {
                res.status(500).send(err)
            }
        })



        client.on('close', () => {
            // let whoiss = whois.split('URL of the ICANN')
            // let lines = whoiss[0].split('\n')

            // let result = {}

            // lines.forEach((line) => {
            //     line = line.trim();
            //     let kv = line.split(': ')
            //     whoiss[1] = 'URL of the ICANN' + whoiss[1]
            //     result[kv[0]] = kv[1]
            // })

            // result.longParagraph = whoiss[1].split('\n')


            // send back the domain data
            res.json(whois)
        });
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
});

app.listen(port, () => console.log(`listening on localhost: ${port}`))