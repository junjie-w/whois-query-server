# WhoisQueryServer

This is the server for the Whois query project.

## Run the application
 
*important* Please enter your own MongoDB database user name and password in the .env file:

DB_USER=Your own MongoDB database user name
DB_PASS=Your own MongoDB database password

Run `node server.js`. 
The server runs on `http://localhost:8000/`. 

## Updates

1. added express-session, with session store (MongoStore)
    -> keep sessions on the per user bases, so keep the sessions distinctive between different users 
    import session from 'express-session';
    import MongoStore from 'connect-mongo'; (can be used for further user authentication)
    //* added using session middleware
    app.use(session({
        secret: process.env.SECRET,
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

2. added using nodemon to start the server
   package.json
    "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "dev": "npx nodemon server.js"
    },

3. added .gitignore file 
