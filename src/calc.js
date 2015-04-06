function loadAllEffort() {

    // ajax load this url and parse DOM   

    chrome.tabs.getSelected(null, onTabLoaded);
}

function onTabLoaded(tab) {
    var tabUrl = tab.url;

    var urlSegments = parseUrl(tabUrl);

    if (urlSegments == null) {
        $('body').html('No backlog data found.');
        return;
    }

    loadHtmlData(urlSegments.fullUrl, function(data) {
        var effort = calculateEffort(data);
        appendEffort(data.sprintData.name, ' ( ' + data.sprintData.dates + ' ) ', effort);
    });

    loadJsonData(urlSegments.backlogDataUrl, function(data) {
        var effort = calculateEffort(data);
        appendEffort('Backlog', '', effort);
    });
}

function parseUrl(url) {
    // sample urls:
    // https://tfs.company.com/tfs/folder/subfolder/teamname/
    // https://tfs.company.com/tfs/folder/subfolder/teamname/_api/_backlog/backlogPayload';
    // https://tfs.company.com/tfs/folder/subfolder/teamname/_backlogs/Iteration/Even/Sprint%2030';
    // https://tfs.company.com/tfs/folder/subfolder/teamname/_backlogs#_a=backlog&hub=Backlog items

    var re = /(https\:\/\/tfs\.\w+\.com\/tfs\/)(.*)\/\_backlogs\/?(.*)?/i;
    var matches = url.match(re);
    if (matches == null || matches.length < 1) return null;

    return {
        fullUrl: url,
        baseUrl: matches[1],
        teamPath: matches[2],
        iterationPath: matches[3],
        backlogDataUrl: matches[1] + matches[2] + '/_api/_backlog/backlogPayload'
    };
}

function loadHtmlData(url, callback) {
    $.get(url, function(data) {

        var html = $(data);
        var grid = html.find('div.productbacklog-grid-results');
        var script = grid.find('script.options');
        var scriptText = script.text();
        var backlogData = JSON.parse(scriptText);

        var sprint = html.find('div.sprint-dates-working-days');
        script = sprint.find('script.options');
        scriptText = script.text();
        backlogData.sprintData = JSON.parse(scriptText);

        callback(backlogData);
    });
}

function loadJsonData(url, callback) {
    $.get(url, function(data) {
        callback(data.queryResults);
    });
}

function calculateEffort(data) {
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

    return {
        done: done,
        committed: committed,
        approved: approved,
        total: done + committed + approved
    };
}

function findColumn(labelRe, columns) {
    for (var i = 0; i < columns.length; i++) {
        if (labelRe.test(columns[i])) {
            return i;
        }
    }
}

function appendEffort(title, subtitle, data) {
    var html = [];
    html.push('<div class="title">');
    html.push('<h4>' + title + '</h4>');
    html.push('<small>' + subtitle + '</small>');
    html.push('</div>');
    html.push('<table>');
    html.push('<tbody>');
    html.push('<tr>');
    html.push('<td class="label">Done</td>');
    html.push('<td class="effort"><span>' + data.done + '</span></td>');
    html.push('</tr>');
    html.push('<tr>');
    html.push('<td class="label">Committed</td>');
    html.push('<td class="effort"><span>' + data.committed + '</span></td>');
    html.push('</tr>');
    html.push('<tr>');
    html.push('<td class="label">Approved</td>');
    html.push('<td class="effort"><span>' + data.approved + '</span></td>');
    html.push('</tr>');
    html.push('<tr class="last">');
    html.push('<td class="label">Total</td>');
    html.push('<td class="effort"><span>' + data.total + '</span></td>');
    html.push('</tr>');
    html.push('</tbody>');
    html.push('</table>');
    html.push('<hr>');

    $('body').append(html.join('')).slideDown();
}

document.addEventListener('DOMContentLoaded', function() {
    loadAllEffort();
});
