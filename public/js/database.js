const connection = io()
function Clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
}

var currentMin = 1
var currentMax = 10
var currentOutput = []
var currentTotalReservations = 0

function renderTable( output, min, max, totalReservations, filteredValue ) {
    let innerHTML = ``

    for (reservationID in output) {
        const reservationData = output[reservationID]
        // check other values
        if (reservationData.customerName.search(filteredValue) != -1 || reservationData.phoneNumber.search(filteredValue) != -1 || reservationData.email.search(filteredValue) != -1 || reservationData.date.search(filteredValue) != -1) {
            innerHTML += '<tr>'
            innerHTML += '<td>' + reservationData.id + '</td>'
            innerHTML += '<td>' + reservationData.date + '</td>'
            innerHTML += '<td>' + reservationData.customerName + '</td>'
            innerHTML += '<td>' + reservationData.time + '</td>'
            innerHTML += '<td>' + reservationData.peopleSize + '</td>'
            innerHTML += '<td>' + reservationData.phoneNumber + '</td>'
            innerHTML += '<td>' + reservationData.email + '</td>'
            innerHTML += '<td>' + reservationData.additionalNotes + '</td>'
            innerHTML += '</tr>'
        } 
        
    }

    innerHTML += '<tr>'
    innerHTML += '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>'

    innerHTML += '<td><p style="display: inline-block; margin-right: 2%; margin-bottom: 0;">Displaying list from ' + min + ' -> ' + max + ' out of ' + totalReservations +'</p>'
    if (min-10 > 0) {
        innerHTML += '<button onclick="requestSpecifiedData( ' + (min-10) + ', ' + (max-10) + ' )" style="border: none; font-weight: 1000; padding: 0 1%; display: inline-block;"><</button>'
    }
    if (max < totalReservations) {
        innerHTML += '<button onclick="requestSpecifiedData( ' + (min+10) + ', ' + (max+10) + ' )" style="border: none; font-weight: 1000; padding: 0 1%; display: inline-block;">></button>'
    }
    
    innerHTML += '</td>'
    innerHTML += '</tr>'


    document.getElementById('databaseBody').innerHTML = innerHTML

    currentOutput = output
    currentMin = min
    currentMax = max
    currentTotalReservations = totalReservations
}

const source = document.getElementById('databaseSearcher');
const inputHandler = function(e) {
    source.value = e.target.value
    renderTable( currentOutput, currentMin, currentMax, currentTotalReservations, source.value )
}
source.addEventListener('input', inputHandler);

function requestSpecifiedData( min, max ) {
    connection.emit( 'requestReservationData', [Clamp(min, 0, 999999999), Clamp(max, 10, 999999999)] )
}
requestSpecifiedData( 1, 10 )

connection.on( 'requestReservationData', function(output) {
    let newOutput = output[0]
    renderTable( newOutput[0], newOutput[1], newOutput[2], newOutput[3] )
} )