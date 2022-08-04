const connection = io('http://amused-ray-gloves.cyclic.app', { transports: ["websocket"] })

// Declare websocket as global, doing this allows for other files to access 'globalConnection' with reference to the websocket
globalConnection = connection

let customerData = []
let unconfirmedData = []

function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}



function getCustomDate()
{
    let date = new Date()
    let stringDate = date.getFullYear() + '-'

    let month = Number(date.getMonth()) + 1
    if (month < 10) {
        stringDate += '0' + month + '-'
    }
    else
    {
        stringDate += month + '-'
    }

    let dateNumber = Number(date.getDate())
    if (dateNumber < 10) {
        stringDate += '0' + dateNumber
    }
    else
    {
        stringDate += dateNumber
    }
    return stringDate
}

let currentDate = getCustomDate()
connection.emit('requestReservationData', [currentDate, false, true])


function redefineDate() {
    const wanted = document.getElementById('date')
    wanted.value = getCustomDate()
}

function convertTime( timeString )
{
    let [hours, mins] = timeString.split(':')
    let numberConvertedHours = Number(hours)

    let timeStamp = 'AM'
    if (numberConvertedHours > 11) {
        if (numberConvertedHours > 12) {
            numberConvertedHours = numberConvertedHours - 12
        }
        timeStamp = 'PM'
    }

    return numberConvertedHours + ':' + mins + timeStamp
}

function checkIsRecentDate( stringDate ) {
    var [dateYear, dateMonth, dateDay] = stringDate.split('-')
    var currentDate = getCustomDate()
    var [currentDateYear, currentDateMonth, currentDateDay] = currentDate.split('-')

    if (dateYear < currentDateYear || dateMonth < currentDateMonth || dateDay < currentDateDay) {
        return false
    }
    return true
}

function toggleConfirmation( id, toggleValue )
{
    let row = document.getElementById('reservationRow' + id)
    row.remove()
    
    unconfirmedData[id].hasArrived = true

    numberOfUnconfirmed -= 1

    let reservationButton = document.getElementById('incomingReservationNavigationButton')
    let additionalNotification = ''
    if (numberOfUnconfirmed > 0) {
        additionalNotification = `<h1 style="display: inline; z-index: 2; position: relative; font-size: 80%; left: 26%; top: 3%; border-radius: 50%; background-color: rgba(200, 0, 0, 255); color: white; padding: 2% 15%;">` + numberOfUnconfirmed + `</h1>`
    }
    reservationButton.innerHTML = additionalNotification + reservationInnerHTML

    connection.emit('changeConfirmationStatus', [unconfirmedData[id].id, toggleValue, currentDate])
}

function toggleArrival( customerID )
{
    let button = document.getElementById('buttonTableElement' + customerID)
    let [prior, buttonType] = button.className.split(' ')
    var determineBool = 'btn-secondary'
    let name = 'Not Arrived'
    if (buttonType === 'btn-secondary') {
        determineBool = 'btn-primary'
        name = 'Arrived'
    }

    let data = customerData[customerID]
    connection.emit('changeArrivalStatus', [data.id])
    if (convertingDictionary[data.hasArrived] === false)
    {
        data.hasArrived = true 
    }
    else
    {
        data.hasArrived = false
    }
        
    
    button.className = prior + ' ' + determineBool
    button.innerHTML = name
}

let convertingDictionary = {
    'true': true,
    'false': false,
    '0': false,
    '1': true,
}
function convertTimeStringToHours( timeString ) {
    var [hour, mins] = timeString.split(":")
    hour = Number(hour)

    if (hour < 11)
            hour += 12

    return [hour, mins]
}

function checkHourIsDinnerOrLunch( hour ) {
    let timeObj = new Date()

    if (timeObj.getHours() < 17)
    {
        if (hour > 16)
        {
            return false
        }
    }
    else
    {
        if (hour < 17)
        {
            return false
        }
    }

    return true
        
}
function renderTable( data, filterConfirmed, wantingNameOriginal ){
    var wantingName = (wantingNameOriginal || '').toLowerCase()
    let doc = document.getElementById('tableLayout')
    let htmlTable = `
    <table class="table w-auto" style="display: inline;">
    <thead class="table-dark">
        <th style="width: 10%;">Date</th>
        <th style="width: 15%;">Name</th>
        <th style="width: 15%;">Time</th>
        <th style="width: 10%;">Size</th>
        <th style="width: 30%;">Additional Notes</th>
        <th style="width: 10%;"><input type="date" id="dateSearcher"/></th>
        <th style="width: 10%;"><input type="text" id="nameSearcher"/></th>
    </thead>
    <tbody>`
    let arrayOfTimes = []
    let i = 0
    let totalCustomers = 0
    for (let element of data) {
        if (filterConfirmed === convertingDictionary[element.hasConfirmed] )
        {
            i += 1
            continue
        }

        

        if (!checkIsRecentDate(element.date))
        {
            i += 1
            continue
        }

        var timeData = convertTimeStringToHours( element.time )
        var hour = timeData[0]

        if (convertingDictionary[element.hasConfirmed] === true) {
            var isInCorrectSetting = checkHourIsDinnerOrLunch( hour )
            if (!isInCorrectSetting) {
                i += 1
                continue
            }
        }
        

        if (element.customerName.toLowerCase().search(wantingName) === -1) {
            i += 1
            continue
        }
        
        htmlTable += '<tr id="reservationRow' + i + '">'
        htmlTable += '<td>' + element.date + '</td>'
        htmlTable += '<td>' + element.customerName + '</td>'
        htmlTable += '<td>' + element.time + '</td>'
        htmlTable += '<td>' + element.peopleSize + '</td>'
        htmlTable += '<td>' + element.additionalNotes + '</td>'
        htmlTable += '<td><button type="button" style="width: 100%" class="btn btn-secondary">View</button></td>'


        if (convertingDictionary[element.hasConfirmed] === true) {
            var bgValue = 'btn-secondary'
            var name = 'Not Arrived'
            if (convertingDictionary[element.hasArrived] === true){
                bgValue = 'btn-primary'
                name = 'Arrived'
            }
            htmlTable += '<td style="width: 18%"><button type="button" style="width: 100%" class="btn ' + bgValue + '" id="buttonTableElement' + (i) + '" onclick="toggleArrival(' + (i) + ')">' + name + '</button></td>'
        }
        else
        {
            htmlTable += '<td style="width: 10%"><button type="button" style="width: 48%; margin-right: 2%; text-align: center; font-size: 0.85rem" class="btn btn-success" id="buttonConfirmElement' + i + '"  onclick="toggleConfirmation(' + i + ', ' + true + ')">Confirm</button><button type="button" style="width: 48%; font-size: 0.85rem" class="btn btn-danger" id="buttonDenyElement' + i + '"  onclick="toggleConfirmation(' + i + ', ' + false + ')">Deny</button></td>'
        }
        htmlTable += '</tr>'
        arrayOfTimes.push(element.time)
        totalCustomers += element.peopleSize
        i += 1
    };
    htmlTable +=  `
    </tbody>
    </table>`
    doc.innerHTML = htmlTable

    var timeArray = arrayOfTimes

    if (timeArray.length != 0) {
        if (convertingDictionary[filterConfirmed] === true) {
            document.getElementById('numberOfCustomers').innerHTML += ' + ' + totalCustomers
            document.getElementById('numberOfBookings').innerHTML += ' + ' + timeArray.length
        }
        else
        {
            document.getElementById('numberOfCustomers').innerHTML = totalCustomers
            document.getElementById('numberOfBookings').innerHTML = timeArray.length
        }
        var mostFrequentTime = mode(timeArray)
        document.getElementById('modalBookingTimesLabel').innerHTML = mostFrequentTime 
    } else {
        document.getElementById('numberOfBookings').innerHTML = 'NONE'
        document.getElementById('modalBookingTimesLabel').innerHTML = 'NONE' 
        document.getElementById('numberOfCustomers').innerHTML = 'NONE'
    }

    const source = document.getElementById('nameSearcher');
    const inputHandler = function(e) {
        source.value = e.target.value
        renderTable( data, filterConfirmed, source.value )
    }
    source.value = wantingNameOriginal || ''
    if (wantingName != undefined) {
        source.focus()
    }
    source.addEventListener('input', inputHandler);


    const dateSearcher = document.getElementById('dateSearcher');
    dateSearcher.value = currentDate
    const dateHandler = function(e) {
        currentDate = e.target.value
        doc.innerHTML = ''
        connection.emit('requestReservationData', [currentDate, false, true])
    }

    dateSearcher.addEventListener('input', dateHandler);
}

function recreateTable( sortConfirmed )
{
    if (sortConfirmed) {
        renderTable( unconfirmedData, true )
        return
    }
    renderTable( customerData, false )
}


let reservationInnerHTML = ''
let numberOfUnconfirmed = 0

connection.on('requestReservationData', (data) => {
    var reservationData = data[0]
    unconfirmedData = data[1]
    console.log(data[2])
    currentDate = data[2] || getCustomDate()

    let shouldFocusOnConfirmed = false
    numberOfUnconfirmed = 0
    for (rowIndex in unconfirmedData) {
        var rowData = unconfirmedData[rowIndex]
        if (!checkIsRecentDate(rowData.date)) {
            continue
        }

        if (convertingDictionary[rowData.hasConfirmed] === false) {
            shouldFocusOnConfirmed = true
            numberOfUnconfirmed += 1
        }
    }

    let reservationButton = document.getElementById('incomingReservationNavigationButton')
    if (reservationInnerHTML === '') {
        reservationInnerHTML = reservationButton.innerHTML
    }
    let additionalNotification = ''
    if (numberOfUnconfirmed > 0) {
        additionalNotification = `<h1 style="display: inline; z-index: 2; position: relative; font-size: 80%; left: 26%; top: 3%; border-radius: 50%; background-color: rgba(200, 0, 0, 255); color: white; padding: 2% 15%;">` + numberOfUnconfirmed + `</h1>`
    }
    reservationButton.innerHTML = additionalNotification + reservationInnerHTML

    customerData = reservationData

    recreateTable( false )
    if (shouldFocusOnConfirmed) {
        recreateTable( true )
    }
})

