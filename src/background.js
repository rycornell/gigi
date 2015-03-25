chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var effortData = getEffortData();

  sendResponse(effortData);
});

function getEffortData(){
  var effortData = {};

  var grid = $('.productbacklog-grid-results');
  var gridHeader = grid.find('.grid-header-canvas');
  var effortColumn = gridHeader.find('.grid-header-column[title="Effort"]');
  var effortColumnIndex = effortColumn.index();
  var stateColumn = gridHeader.find('.grid-header-column[title="State"]');
  var stateColumnIndex = stateColumn.index();

  var gridRow = $('.grid-row');  
  var effortCellNthChildIndex = effortColumnIndex + 1;
  var stateCellNthChildIndex = stateColumnIndex + 1;

  var effortArray = [];
  gridRow.map(function(i,e){
  	var $e = $(e);

    var stateCell = $e.find(':nth-child(' + stateCellNthChildIndex + ')');
    var stateCellVal = stateCell.text();

    var effortCell = $e.find(':nth-child(' + effortCellNthChildIndex + ')');
    var effortCellVal = effortCell.text();

  	effortArray.push(
  		{
  			'state': stateCellVal,
  			'effort': effortCellVal
  		}
	);
  });

  effortData.data = effortArray;

  return effortData;
}