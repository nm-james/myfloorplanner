
const fs = require('fs');
const passport = require('passport');
const flash = require('express-flash');
const session = require("express-session");
const methodOverride = require('method-override');
const path = require('path')
const express = require('express');
const app = express();
const defaultTableLayout = `{
    "kroom": {
      "7-16": true,
      "5-18": true,
      "3-18": true,
      "1-16": true,
      "4-15": true,
      "7-12": true,
      "4-12": true,
      "1-13": true,
      "2-13": true,
      "1-10": true,
      "2-10": true,
      "4-9": true,
      "7-8": true,
      "2-1": true,
      "5-1": true,
      "5-3": true,
      "5-4": true,
      "5-5": true,
      "5-6": true,
      "3-3": true,
      "3-4": true,
      "3-5": true,
      "3-6": true,
      "1-7": true,
      "1-4": true
    },
    "main": {
      "3-1": true,
      "6-1": true,
      "1-4": true,
      "2-4": true,
      "4-4": true,
      "7-4": true,
      "8-7": true,
      "5-7": true,
      "2-7": true,
      "1-12": true,
      "2-12": true,
      "5-10": true,
      "8-10": true,
      "8-13": true,
      "5-13": true,
      "2-14": true,
      "1-16": true,
      "2-16": true,
      "4-15": true,
      "4-16": true,
      "7-15": true,
      "7-16": true,
      "9-16": true,
      "9-18": true,
      "9-20": true,
      "7-20": true,
      "7-21": true,
      "4-20": true,
      "4-21": true,
      "2-19": true,
      "4-18": true,
      "7-18": true
    }
  }`
var settings = {}
settings['General'] = {}
settings['Bookings'] = {
    'Default Times': { "Description": "DESC", "Editors": ['time', 'time'], "Values": ['11:30', '20:15'], "Defaults": ['11:30AM', '8:15PM'] },
    'Maximum Reservation': { "Description": "The maxmimum amount of people who can create a reservation via online.", "Editors": ['number'], "Values": [18], "Defaults": [18] }
}
settings['Users'] = {}
settings['Reports'] = {}

const initializePassport = require("./passport-config");
initializePassport(
    passport,
    username => users.find(user => user.username == username),
    password => {
        return 2
    }
);

const database = require("./filecacher");
database.init()
let users = []

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '/public')));
app.use(methodOverride('_method'));

const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "https://amused-ray-gloves.cyclic.app",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});


app.get('/reservation', (req, res) => {
    res.render('./reservation.ejs')
});

app.get('/login', isSignedIn, (req, res) => {
    res.render('./login.ejs');
});

app.get('/', isNotSignedIn, (req, res) => {
    res.render('./main.ejs')
});

app.get('/future', isNotSignedIn, (req, res) => {
    res.render('./future.ejs', settings)
});

app.get('/database', isNotSignedIn, (req, res) => {
    res.render('./database.ejs')
});

app.get('/admin', isNotSignedIn, (req, res) => {
    res.render('./admin.ejs', settings)
});

function checkReservationData(req, res, next) {
    let data = req.body
    if (data.date === '' || data.time === '' || data.customerName === '' || data.phoneNumber === '' || data.peopleSize === '' || data.email === '') {
        data.result = 'Error'
        data.type = 'alert'

        if (req.isAuthenticated()) {
            return res.redirect('/')
        } else {
            return res.redirect('/reservation')
        }
    } else {
        data.todaysDate = null
        next()
    }
}
app.post('/reservation', checkReservationData, (req, res) => {
    let data = req.body
    database.saveReservation( data )
    updateReservationData( users, data.todaysDate )

    if (req.isAuthenticated()) {
        res.redirect('/')
    } else {
        res.redirect('/reservation')
    }
})

app.post('/login', isSignedIn, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.delete('/logout', isNotSignedIn, (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function updateReservationData( users, date, currentSOC ) {
    let allReservations = database.getReservations( date )
    allReservations.then((res) => {
        var databaseRes = database.getReservationsViaConfirmation( 0 )
        databaseRes.then((newResult) => {
            users.forEach(soc => {
                if (soc != currentSOC) {
                    soc.emit('requestReservationData', [res, newResult, date])
                }
            });
        })
    })
}
function getSettingsData() {
    var promise = new Promise((res, rej) => {
        fs.readFile('data/settings.json', 'utf8', (err, file) => {
            if (err) {
                fs.writeFile('data/settings.json', JSON.stringify(settings), (error)=>{
                    if (error) throw error;
                })
                res(settings)
            } else {
                res(JSON.parse(file))
            }
        })
    })
    return promise
}
io.on('connection', function(socket) {
    users.push(socket);
    
    socket.on('changeConfirmationStatus', function(data) {
        let id = data[0]
        let valueOfChange = data[1]
        database.changeReservationConfirmation( id, valueOfChange )
        updateReservationData( users, data[2], socket )
    })
    socket.on('requestReservationData', async function( data ) {
        let reservationData = {}
        if (data[0] && typeof data[1] == 'number') {
            reservationData = await database.getReservationsLimited( data[0], data[1] )
        } else {
            reservationData = await database.getReservations( data[0] )
        }
        if (data[2]) {
            var databaseRes = await database.getReservationsViaConfirmation( 0 )

            socket.emit('requestReservationData', [reservationData, databaseRes, data[0]])
        } else {
            socket.emit('requestReservationData', [reservationData])
        }
    })
    socket.on('changeArrivalStatus', async function(data){
        let reservationID = data[0]
        let reservationData = await database.getReservationViaID( reservationID )
        await database.changeReservationStatus( reservationData.id, reservationData.hasArrived )
        updateReservationData( users, reservationData.date, socket )
    })  
    socket.on('disconnect', function (data) {
       let indexOfUser = users.indexOf(socket)
       if (indexOfUser !== -1) {
        users.splice(indexOfUser, 1)
       }
    });

    socket.on('requestingSettingsData', function() {
        let data = getSettingsData() 
        data.then((res) => {
            socket.emit( 'requestingSettingsData', res )
        })
    })

    socket.on('saveSettingData', function(data) {
        let option = data[0]
        let optionID = data[1]
        let optionEditorID = data[2]
        let optionNewValue = data[3]

        var currentSettings = getSettingsData()
        currentSettings.then((res) => {
            var settingsObject = res[option][optionID]
            var fieldType = settingsObject.Editors[optionEditorID]
            if (fieldType === 'time') {
                let [hour, mins] = optionNewValue.split( ':' )
                mins = Math.floor(mins / 15)*15
                optionNewValue = hour + ':' + mins
            }

            settingsObject.Values[optionEditorID] = optionNewValue
            fs.writeFile('data/settings.json', JSON.stringify(res), (err)=>{
                if (err) throw err;
            })
        })
    })
 });

function isNotSignedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function isSignedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

server.listen(process.env.PORT || 3000)




