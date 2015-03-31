function loadAllEffort() {

    // ajax load this url and parse DOM
    var baseUrl = '';
    var backlogJsonUrl = baseUrl + '';
    var sprintUrl = baseUrl + '';

    chrome.tabs.getSelected(null, function(tab) {
        var tabUrl = tab.url;

        loadHtmlData(tabUrl, function(data) {
            calculateEffort('Sprint ' + tabUrl.slice(-2), data);
        });
    });

    loadJsonData(backlogJsonUrl, function(data) {
        calculateEffort('Backlog', data);
    });
}

function loadHtmlData(url, callback) {
    $.get(url, function(data) {

        var html = $(data);
        var grid = html.find('div.productbacklog-grid-results');
        var script = grid.find('script.options');
        var scriptText = script.text();

        var backlogData = JSON.parse(scriptText);
        callback(backlogData);
    });
}

function loadJsonData(url, callback) {
    $.get(url, function(data) {
        callback(data.queryResults);
    });
}

function calculateEffort(title, data) {
    var stateColumnIndex = findColumn(/.*State$/i, data.pageColumns);
    var effortColumnIndex = findColumn(/.*Effort$/i, data.pageColumns);

    var done = 0;
    var committed = 0;
    var approved = 0;

    for (var i = 0; i < data.payload.rows.length; i++) {
        var row = data.payload.rows[i];
        var state = row[stateColumnIndex];
        var effort = parseInt(row[effortColumnIndex]);

        if (isNaN(effort)) continue;

        switch (state) {
            case 'Done':
                done += effort;
                break;

            case 'Committed':
                committed += effort;
                break;

            case 'Approved':
                approved += effort;
                break;
        }
    }

    var total = done + committed + approved;

    appendEffort(title, total, done, committed, approved);
}

function findColumn(labelRe, columns) {
    for (var i = 0; i < columns.length; i++) {
        if (labelRe.test(columns[i])) {
            return i;
        }
    }
}

function appendEffort(title, total, done, committed, approved) {
    var html = [];
    html.push('<h4>' + title + '</h4>');    
    html.push('<table>');
    html.push('<tbody>');
    html.push('<tr>');
    html.push('<td class="label">Done</td>');
    html.push('<td class="effort"><span>' + done + '</span></td>');
    html.push('</tr>');
    html.push('<tr>');
    html.push('<td class="label">Committed</td>');
    html.push('<td class="effort"><span>' + committed + '</span></td>');
    html.push('</tr>');
    html.push('<tr>');
    html.push('<td class="label">Approved</td>');
    html.push('<td class="effort"><span>' + approved + '</span></td>');
    html.push('</tr>');
    html.push('<tr class="last">');
    html.push('<td class="label">Total</td>');
    html.push('<td class="effort"><span>' + total + '</span></td>');
    html.push('</tr>');
    html.push('</tbody>');
    html.push('</table>');
    html.push('<hr>');

    $('body').append(html.join('')).slideDown();
}

document.addEventListener('DOMContentLoaded', function() {
    loadAllEffort();
});
