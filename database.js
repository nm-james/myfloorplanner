const sql = require('mysql');
let sqlConnection = sql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3307,
    password: 'NMJames2004'
});

const dataTables = [ "users", "reservations" ]
const dataTableValues = [
    `(
        id INT AUTO_INCREMENT,
        name VARCHAR(255),
        username VARCHAR(255),
        password VARCHAR(255),
        date VARCHAR(255),
        isAdmin BOOLEAN,
        PRIMARY KEY (id)
    )`,
    `(
        id INT AUTO_INCREMENT,
        date VARCHAR(255),
        customerName VARCHAR(255),
        email VARCHAR(255),
        peopleSize INT,
        time VARCHAR(255),
        phoneNumber VARCHAR(255),
        additionalNotes VARCHAR(255),
        hasArrived BOOLEAN,
        hasConfirmed BOOLEAN,
        PRIMARY KEY (id)
    )`
]


function checkDatabases() {
    const createScheme = 'CREATE DATABASE IF NOT EXISTS dbFloorPlanner'
    const checkSQLCreation = new Promise( (resolve, err) => {
        sqlConnection.query(createScheme, (err, result) => {
            if (err) throw err;
            // redefine new connection as a connection directly to the database file
            sqlConnection = sql.createConnection({
                host: 'localhost',
                user: 'root',
                port: 3307,
                password: 'NMJames2004',
                database: 'dbFloorPlanner'
            });
            resolve()
        });
    } )

    return checkSQLCreation
}

async function checkTables() {
    let dbIsReady = new Promise( (resolve, err) => {
        for (let i = 0; i < dataTables.length; i++) {
            const dbTableCheck = "CREATE TABLE IF NOT EXISTS " + dataTables[i] + dataTableValues[i]
            sqlConnection.query(dbTableCheck, (err, result) => {
                if (err) throw err;
                console.log("dbFloorPlanner's " + dataTables[i] + " HAVE BEEN INITIALIZED!")
                if (i+1 === dataTables.length) {
                    resolve()
                }
            });
        }
    })
    dbIsReady.then(() => {
        console.log("dbFloorPlanner's TABLES HAVE BEEN INITIALIZED!")
    })

    return dbIsReady
}

async function findUserByUsername( username ) {
    let getUsers = new Promise( (resolve, err) => {
        sqlConnection.query({sql: 'SELECT * FROM `users` WHERE `username` = ?'},
          [username],
          function (error, results, fields) {
            if (error) throw erre;
            resolve(results[0])
          }
        );
    })

    return getUsers
}

async function findReservationsByDates( dateRequested )
{
    let getReservation = new Promise( (resolve, err) => {
        sqlConnection.query({sql: 'SELECT * FROM `reservations` WHERE `date` = ?'},
          [dateRequested],
          function (error, results, fields) {
            if (error) throw erre;
            resolve(results)
          }
        );
    })

    return getReservation
}


async function findReservationByDatesAndName( dateRequested, customerName )
{
    let getReservation = new Promise( (resolve, err) => {
        sqlConnection.query({sql: 'SELECT * FROM `reservations` WHERE `date` = ? AND `name` = ?'},
          [dateRequested, customerName],
          function (error, results, fields) {
            if (error) throw erre;
            resolve(results[0])
          }
        );
    })

    return getReservation
}

async function findReservationById( id )
{
    let getReservation = new Promise( (resolve, err) => {
        sqlConnection.query({sql: 'SELECT * FROM `reservations` WHERE `id` = ?'},
          [id],
          function (error, results, fields) {
            if (error) throw erre;
            resolve(results[0])
          }
        );
    })

    return getReservation
}

async function findReservationsById( min, max )
{
    let getReservation = new Promise( (resolve, err) => {
        sqlConnection.query({sql: 'SELECT * FROM `reservations` WHERE `hasConfirmed` = true ORDER BY id DESC'},
          [],
          function (error, results, fields) {
            if (error) throw error;
            let data = results
            let sortedReservation = []
            for (let posI = min - 1; posI < max; posI++) {
                if (!data[posI]) continue
                sortedReservation.push(data[posI])
            }
            resolve([sortedReservation, min, max, data.length])
          }
        );
    })

    return getReservation
}

async function getNotConfirmedReservation( id, confirmationStatus )
{
    let getReservation = new Promise( (resolve, err) => {
        sqlConnection.query({sql: 'SELECT * FROM `reservations` WHERE `id` = ? AND `hasConfirmed` = ?'},
          [id, confirmationStatus],
          function (error, results, fields) {
            if (error) throw erre;
            resolve(results[0])
          }
        );
    })

    return getReservation
}

function getNotConfirmedReservations( confirmationStatus )
{
    let getReservation = new Promise( (resolve, err) => {
        sqlConnection.query({sql: 'SELECT * FROM `reservations` WHERE `hasConfirmed` = ?'},
          [confirmationStatus],
          function (error, results, fields) {
            if (error) throw erre;
            resolve(results)
          }
        );
    })

    return getReservation
}


function saveReservationByDateAndName( data )
{
    sqlConnection.query({sql: 'INSERT INTO `reservations`(date, customerName, email, peopleSize, time, phoneNumber, additionalNotes, hasArrived, hasConfirmed) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)'},
        [data.date, data.bookingName, data.email, data.reservationNumbers, data.time, data.phoneNumber, data.additionalNotes, false, false],
        function (error, results, fields) {
        if (error) throw error;
        }
    );
}

function updateReservationArrival( id, hasArrived )
{
    let hasarrivedvalue = false
    if (!hasArrived)
        hasarrivedvalue = true
    sqlConnection.query({sql: 'UPDATE `reservations` SET hasArrived = ? WHERE id = ?'},
        [hasarrivedvalue, id],
        function (error, results, fields) {
            if (error) throw error;
        }
    );
}

function updateReservationConfirmation( id, hasConfirmed )
{
    if (hasConfirmed) {
        sqlConnection.query({sql: "UPDATE `reservations` SET hasConfirmed = 1 WHERE id = ?"},
        [id],
        function (error, results, fields) {
            if (error) throw error;
        });
    }
    else {
        sqlConnection.query({sql: 'DELETE FROM `reservations` WHERE id = ?'},
        [id],
        function (error, results, fields) {
            if (error) throw error;
        });
    }
    
}

function initializeSQL() {
    let checkSQLCreation = checkDatabases();
    checkSQLCreation.then(()=>{
        checkTables();
    })
}


module.exports = {
    init: initializeSQL,
    checkUserByName: findUserByUsername,
    getReservations: findReservationsByDates,
    getReservationViaID: findReservationById,
    getReservationsLimited: findReservationsById,
    getReservationViaConfirmation: getNotConfirmedReservation,
    getReservationsViaConfirmation: getNotConfirmedReservations,
    findReservation: findReservationByDatesAndName,
    saveReservation: saveReservationByDateAndName,
    changeReservationStatus: updateReservationArrival,
    changeReservationConfirmation: updateReservationConfirmation
}