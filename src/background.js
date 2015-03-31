chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var effortData = getEffortData();

    sendResponse(effortData);
});

function getEffortData() {
    var effortData = {};

    var grid = $('.productbacklog-grid-results');
    var gridCanvas = grid.find('.grid-canvas')[0];
    var gridHeader = grid.find('.grid-header-canvas');

    var idColumn = gridHeader.find('.grid-header-column[title="ID"]');
    var idColumnIndex = idColumn.index();

    var effortColumn = gridHeader.find('.grid-header-column[title="Effort"]');
    var effortColumnIndex = effortColumn.index();

    var stateColumn = gridHeader.find('.grid-header-column[title="State"]');
    var stateColumnIndex = stateColumn.index();

    var idCellNthChildIndex = idColumnIndex + 1;
    var effortCellNthChildIndex = effortColumnIndex + 1;
    var stateCellNthChildIndex = stateColumnIndex + 1;

    var effortArray = [];
    var keys = [];

    // scroll into view and load
    var originalTop = gridCanvas.scrollTop;
    var top = 0;
    var scrollIncrement = 100;
    var scrollHeight = gridCanvas.scrollHeight;

    while (top < scrollHeight) {

        gridCanvas.scrollTop = top;

        var gridRows = $('.grid-row');

        for (var i = 0; i < gridRows.length; i++) {

            var $column = $(gridRows[i]);

            var idCell = $column.find(':nth-child(' + idCellNthChildIndex + ')');
            var idCellVal = idCell.text();

            if (keys.indexOf(idCellVal) > -1) continue;

            keys.push(idCellVal);

            var stateCell = $column.find(':nth-child(' + stateCellNthChildIndex + ')');
            var stateCellVal = stateCell.text();

            var effortCell = $column.find(':nth-child(' + effortCellNthChildIndex + ')');
            var effortCellVal = effortCell.text();

            effortArray.push({
                'id': idCellVal,
                'state': stateCellVal,
                'effort': effortCellVal
            });
        }

        top += scrollIncrement;
    }

    // reset
    gridCanvas.scrollTop = originalTop;

    effortData.data = effortArray;

    return effortData;
}
