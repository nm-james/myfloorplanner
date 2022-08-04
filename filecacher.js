const fs = require('fs')

async function checkFiles() {
    fs.readFile('tmp/data/reservations.json', 'utf8', (err, file) => {
        if (err) {
            fs.writeFile('tmp/data/reservations.json', '[]', (error)=>{
                if (error) throw error;
            })
        }
    })

    fs.readFile('tmp/data/users.json', 'utf8', (err, file) => {
        if (err) {
            fs.writeFile('tmp/data/users.json','[]', (error)=>{
                if (error) throw error;
            })
        }
    })

    fs.readFile('tmp/data/limitations.json', 'utf8', (err, file) => {
        if (err) {
            fs.writeFile('tmp/data/limitations.json','[]', (error)=>{
                if (error) throw error;
            })
        }
    })

    console.log('JSON Files have been checked!')
}

async function getBookings( keys, wantedValues ) {
    let getBooking = await new Promise( (resolve, err) => {
        fs.readFile('data/reservations.json', 'utf8', (err, file) => {
            resolve(JSON.parse(file || []))
        })
    })
    let newBookings = getBooking
    if (keys) {
        newBookings = []
        for (x in getBooking) {
            let bookingsData = getBooking[x]
            let allCriterion = 0
            for(keyID in keys) {
                let key = keys[keyID]
                if (bookingsData[key] === wantedValues[keyID]) {
                    allCriterion += 1
                }
            }
            if (keys.length === allCriterion) {
                newBookings.push( bookingsData )
            }
        }
    }
    return newBookings
}

function saveBookings( newBookings ) {
    fs.writeFile('data/reservations.json', JSON.stringify(newBookings), (error)=>{
        if (error) throw error;
    })
}
async function findReservationsByDates( dateRequested )
{
    let bookings = await getBookings( ['date'], [dateRequested] )
    return bookings
}

async function findReservationByDatesAndName( dateRequested, customerName )
{
    let bookings = await getBookings( ['date', 'customerName'], [dateRequested, customerName] )
    return bookings
}

async function findReservationById( id )
{
    let bookings = await getBookings( ['id'], [id] )
    return bookings[0]
}

async function findReservationsById( min, max )
{
    let sortedBookings = []
    for (let i = min; i < max+1; i++) {
        let bookings = await getBookings( ['id'], [i] )
        sortedBookings.push(bookings)
    }
    return sortedBookings
}

async function getNotConfirmedReservation( id, confirmationStatus )
{
    let bookings = await getBookings( ['id', 'hasConfirmed'], [id, confirmationStatus] )
    return bookings[0] || []
}

async function getNotConfirmedReservations( confirmationStatus )
{
    let bookings = await getBookings( ['hasConfirmed'], [confirmationStatus] )
    return bookings
}


async function saveReservationByDateAndName( data )
{
    let bookings = await getBookings()
    let newBooking = data
    let newID = Object.keys(bookings).length
    newBooking.id = newID + 1
    newBooking.hasArrived = 0
    newBooking.hasConfirmed = 0

    bookings[newID] = newBooking
    saveBookings( bookings )
}

async function updateReservationArrival( id, hasArrived )
{
    let bookings = await getBookings()
    let newID = id - 1
    console.log(newID)
    if (hasArrived === 1) {
        bookings[newID].hasArrived = 0
    } else {
        bookings[newID].hasArrived = 1
    }
    saveBookings( bookings )
}

async function updateReservationConfirmation( id, hasConfirmed )
{
    let newID = id - 1
    let bookings = await getBookings()
    if (hasConfirmed) {
        bookings[newID].hasConfirmed = 1
    } else {
        bookings.splice(newID, 1)
    }
    saveBookings( bookings )
}

async function initializeSQL() {
    checkFiles();
    // let reservationBookings = await updateReservationArrival( 1, 1 )
    // console.log(reservationBookings)

}


module.exports = {
    init: initializeSQL,
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
