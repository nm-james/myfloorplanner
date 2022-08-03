
// The reservation dictionary which has the layout of the tables (without referencing what table is reserved or available tc)
let toDateReservationTableLayout = {}
toDateReservationTableLayout.kroom = { '5-11': 1 }
toDateReservationTableLayout.main = {}


// This dictionary will be all the bookings with the tables taken, and additionally has the index to another dictionary
var toDateReservedTables = {}
toDateReservedTables.kroom = { '5-10': 1 }
toDateReservedTables.main = {}

// A template to create a new element for HTML. This needs the row and column to determine whether the table is taken/reserved, and the width according to the client's width (calculated before calling this function) and decides which poition the grid should be placed in (which room)
function createGirdDivElement( row, column, gridWidth, isKananookRoom ) {
    // Create a new button to click, the element displaying the status of the table
    var tableGrid = document.createElement('button')
    
    // Setting the width and height (despite what it says) of the element
    tableGrid.style.paddingRight = gridWidth
    tableGrid.style.paddingBottom = gridWidth

    // Declare the default color if no table is reserved and the table layout does not have a table in this current location
    var color = "darkgrey"

    // This variable is the unique identifier for the specified table.
    var uniqueIdentifierTable = row.toString() + '-' + column.toString()
    
    // if there is a reservation inside the relevant room, and it is sorting for relevant room only related bookings, then change the color
    if (toDateReservedTables.kroom[uniqueIdentifierTable] && isKananookRoom || toDateReservedTables.main[uniqueIdentifierTable] && !isKananookRoom) {
        color = "yellow"
    // if there is no reservation inside the relevant room, and there is a table available to reserve, then change the color
    } else if (isKananookRoom && toDateReservationTableLayout.kroom[uniqueIdentifierTable] || !isKananookRoom && toDateReservationTableLayout.main[uniqueIdentifierTable]) {
        color = "white"
    }

    // Set the background color of the grid, and the display type to enable the movement of the tableGrid HTML element
    tableGrid.style.backgroundColor = color
    tableGrid.style.display = "inline-block"

    // THIS IS FOR DEV PURPOSES ONLY
    // tableGrid.style.borderRadius = "50%"

    // Return the newly created element
    return tableGrid
}

var buttonInnerHTML = [
    [`<h1>`, `</h1>`]
]
function renderTableLayout() {
    var tableHolder = document.getElementById('tableLayout')
    tableHolder.innerHTML = ""

    var tableEditorHolder = document.createElement('div')
    tableEditorHolder.style.width = "85%"
    tableEditorHolder.style.height = "100%"
    tableEditorHolder.style.backgroundColor = "black"
    tableEditorHolder.style.display = "inline-block"

    tableHolder.appendChild( tableEditorHolder )

    var tableEditorWidth = tableEditorHolder.clientWidth

    // the K ROOMs position isnt the full width of the bistro/editor. Thus, we need to reduce the size available to the kroom.
    // K ROOM GRIDS
    var gridWidth = (tableEditorWidth / 220) + '%'
    for (let i = 1; i < 8; i++) {
        var gridRow = document.createElement('div')
        gridRow.style.width = "85%"
        gridRow.style.display = "inline-block"
        tableEditorHolder.appendChild( gridRow )

        for (let x = 1; x < 19; x++) {
            let tableGrid = createGirdDivElement( i, x, gridWidth, true )
            gridRow.appendChild( tableGrid )
        }
    }


    // MAIN ROOM GRIDS
    for (let i = 1; i < 10; i++) {
        var gridRow = document.createElement('div')
        gridRow.style.width = "85%"
        gridRow.style.display = "inline-block"
        gridRow.style.marginLeft = "15%"

        tableEditorHolder.appendChild( gridRow )

        for (let x = 1; x < 22; x++) {
            let tableGrid = createGirdDivElement( i, x, gridWidth, false )
            gridRow.appendChild( tableGrid )
        }
    }
    var editingOptions = document.createElement('div')
    editingOptions.style.width = "15%"
    editingOptions.style.height = "94.1%"
    editingOptions.style.display = "inline-block"
    // editingOptions.style.backgroundColor = "green"
    tableHolder.appendChild( editingOptions )

    for (innerHTML in buttonInnerHTML) {
        var innerHTMLButton = document.createElement('div')
        innerHTMLButton.style.width = "100%"
        innerHTMLButton.style.height = "20%"

        innerHTMLButton.style.backgroundColor = "green"

        innerHTMLButton.
        editingOptions.appendChild( innerHTMLButton )
    }


}