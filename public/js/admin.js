const connection = io()
let settingsObject = {}
function saveNewSettingsObject( inputID, option, settingID, editorID ) {
    let obj = settingsObject[option][settingID].Values[editorID]
    const inputValue = document.getElementById(inputID).value
    connection.emit('saveSettingData', [option, settingID, editorID, inputValue])
}

function renderTable( option ) {
    let tableLayout = document.getElementById('settingListBody')
    if (!settingsObject[option]) return
    let newHTMLInner = ``

    var settingObjectNarrowed = settingsObject[option]

    for (htmlElement in settingsObject[option]) {
        var objectData = settingObjectNarrowed[htmlElement]
        newHTMLInner += '<tr>'
        newHTMLInner += '<td> ' + htmlElement + ' </td>'
        newHTMLInner += '<td> ' + objectData.Description + ' </td>'
        newHTMLInner += '<td>'

        let inputWidth = 100 / objectData.Editors.length

        for (inputVariable in objectData.Editors) {
            var inputType = objectData.Editors[inputVariable]
            var inputValue = objectData.Values[inputVariable]
            newHTMLInner += `<input id="settingsInputID-` + htmlElement + `-` + inputVariable + `" onchange="saveNewSettingsObject('settingsInputID-` + htmlElement + `-` + inputVariable + `', '` + option + `', '` + htmlElement + `', '` + inputVariable + `')" type="` + inputType + `" style="width: ` + inputWidth + `%" value="` + inputValue + `"/>`
        }
        newHTMLInner += '</td>'
        newHTMLInner += '<td>'
        for (defaults in objectData.Defaults) {
            let defaultValue = objectData.Defaults[defaults]
            newHTMLInner += defaultValue + " "
        }
        newHTMLInner += '</td>'
        newHTMLInner += '</tr>'
    }

    if (option === 'Bookings') {
        newHTMLInner += '<tr class="settingsRow"><td>Restrict Bookings</td><td>Restricts the ability to reserve a table on a date and between a time period.</td><td><button class="btn btn-alert">Restrict Bookings</button></td><td></td>'
    }
    
    tableLayout.innerHTML = newHTMLInner
}

function requestSettingsData()
{
    connection.emit('requestingSettingsData', [])
}
requestSettingsData()

connection.on('requestingSettingsData', function(data) {
    settingsObject = data
})