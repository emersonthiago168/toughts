const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('express-flash');

const app = express();

const conn = require('./db/conn');

// MODELS
const Tought = require('./models/Tought');
const User = require('./models/User');

// IMPORT ROUTES
const toughtsRoutes = require('./routes/toughtsRoutes');
const authRouter = require('./routes/authRoutes');

// IMPORT CONTROLLERS
const ToughtController = require('./controllers/ToughtController');

// TEMPLATE ENGINE
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

// RECEBER RESPOSTA DO BODY
app.use(
    express.urlencoded({
        extended: true
    })
);
app.use(express.json());

// SESSION MIDDLEWARE
app.use(
    session({
        name: 'session',
        secret: 'nosso_secret',
        resave: false,
        saveUninitialized: false,
        store: new FileStore({
            logFn: function () { },
            path: require('path').join(require('os').tmpdir(), 'sessions')
        }),
        cookie: {
            secure: false,
            maxAge: 360000,
            expires: new Date(Date.now() + 360000),
            httpOnly: true
        }
    }),
);

// FLASH MESSAGES
app.use(flash());

// PUBLIC PATH
app.use(express.static('public'));

// SET SESSION TO RES
app.use((req, res, next) => {
    if (req.session.userid) res.locals.session = req.session;

    next();
})

// ROUTES
app.use('/toughts', toughtsRoutes);
app.use('/', authRouter);
app.get('/', ToughtController.showToughts);

conn
    // .sync({ force: true })
    .sync()
    .then(() => {
        app.listen(3000, () => console.log('Conectado na porta 3000'));
    })
    .catch(err => console.log(err));