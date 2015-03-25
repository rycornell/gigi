
function loadAllEffort(){

  sendMessage(function(response){
    console.log(response);

    var data = response;

    var done = sumEffort(data, 'Done');
    var committed = sumEffort(data, 'Committed');
    var approved = sumEffort(data, 'Approved');
    var total = done + committed + approved;

    renderTotal(total);
    renderDone(done);
    renderCommitted(committed);
    renderApproved(approved);
  });
}

function sendMessage(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    lastTabId = tabs[0].id;
    chrome.tabs.sendMessage(lastTabId, "Background page started.", callback);
  });
}

function sumEffort(d, stateName){
  var sum = 0;

  d.data.forEach(function(e){
    var state = e.state;
    var val = parseInt(e.effort);

    if (state === stateName && !isNaN(val)){
      console.log('adding ' + val);
      sum += val;
    }    
  });

  return sum;
}

function renderTotal(effort) {
  var el = document.querySelector('#totalEffort');
  el.innerHTML = effort;
}

function renderDone(effort) {
  var el = document.querySelector('#doneEffort');
  el.innerHTML = effort;
}

function renderCommitted(effort) {
  var el = document.querySelector('#committedEffort');
  el.innerHTML = effort;
}

function renderApproved(effort) {
  var el = document.querySelector('#approvedEffort');
  el.innerHTML = effort;
}

document.addEventListener('DOMContentLoaded', function() {
  loadAllEffort();
});
