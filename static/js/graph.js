queue()
    .defer(d3.json, "/BGG/game_info")
    .await(makeGraphs);

function makeGraphs(error, game_infoJson) {

    var game_data = game_infoJson;

    var games = crossfilter(game_data);

    /**
     * Player count selector:
     */
    var playerCountDim = games.dimension(function(d) {
        // create an array of all allowed player counts
        // using "minplayers" and "maxplayers" properties
        // Will just use "7+" for all player counts above 6,
        // and therefore need to return a string in all cases
        var playerCounts = [];
        for (players=1; players<7; players++) {
            if (d["minplayers"]<=players && players<=d["maxplayers"]) {
                playerCounts.push(String(players));
            }
        }
        if (d["maxplayers"]>6) {
            playerCounts.push("7+");
        }
        return playerCounts;
    }, true)

    var gamesByPlayerCount = playerCountDim.group();

    var playerCountMenu = dc.selectMenu("#player-count-select");

    playerCountMenu
        .dimension(playerCountDim)
        .group(gamesByPlayerCount);


    /**
     * Year Published Chart:
     */
    var yearDim = games.dimension(function(d) {
        return d["yearpublished"];
    });

    var yearGroupedDim = games.dimension(function(d) {
        var year = d["yearpublished"];
        if (year<1970) {
            return "<1970";
        }
        else if (year<2000) {
            var startYear = 10*Math.floor(year/10);
            var startYearString = String(startYear);
            return (startYearString + "s");
        } 
        else {
            return String(year);
        }
    });

    var numGamesByYear = yearGroupedDim.group();

    var maxYear = yearDim.top(1)[0]["yearpublished"];
    
    var yearChart = dc.barChart("#year-bar-chart");

    var yearGroups = ["<1970", "1970s","1980s", "1990s"];
    for (year=2000; year<=maxYear; year++) {
        yearGroups.push(String(year));
    }

    yearChart
        .width(800)
        .height(150)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(yearGroupedDim)
        .group(numGamesByYear)
        .transitionDuration(500)
        .x(d3.scale.ordinal().domain(yearGroups))
        .xUnits(dc.units.ordinal)  // required for graph to display correctly with ordinal scale
        .elasticY(true)
        .xAxisLabel("Year Published")
        .yAxis().ticks(4);

    /**
     * mechanics chart:
     */
    var mechanicsDim = games.dimension(function(d) {
        return d.mechanics;
    }, true);  // tell crossfilter that this dimension is an array

    var numGamesByMechanic = mechanicsDim.group();

    var mechanicsChart = dc.rowChart("#mechanics-row-chart");

    mechanicsChart
        .width(400)
        .height(250)
        .dimension(mechanicsDim)
        .group(numGamesByMechanic)
        .rowsCap(10)
        .othersGrouper(false)
        .elasticX(true)
        .xAxis().ticks(4);

    dc.renderAll();
}