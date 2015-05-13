$(document).ready(function(){

	/* Bootstrap tooltip */
	$('[data-toggle="tooltip"]').tooltip();

	/* Champion hover transition */
	$('.champ-select').hover(function() {
   		$(this).addClass('transition');
    
    }, function() {
        $(this).removeClass('transition');
    });

	/* Bind actions to buttons */
    $('#next-btn').bind('click', restart);
    $('#restart-btn').bind('click', restart);
    $('input#final-answer-btn').bind('click', verifyAnswer);
	$('#submit-score').bind('click', submitHighScore);
});

/* Restart level by retreiving new data from server, and renewing client side */
function restart() {
    $.ajax({
        url: '/next_level/',
        data: {},
        type: 'POST',
        success: function(response) {
            restartBtnTransition();
            resetChampIcon();
            renewTeams(response.result);
            renewWinCondition(response.result);
            renewSpells(response.result);
            renewItems(response.result);
            renewKD(response.result);
            renewGold(response.result);
            renewCS(response.result);
            renewMap(response.result);
            renewSkillTable(response.result);
        },
        error: function(error) {
            console.log(error);
        }
    });
    return false;
}

/* Reveal the correct champion */
function revealChampion(response) {
	$('#champ-icon').fadeOut('fast', function() {
    	$(this).attr("src", "/static/images/champion/" + response.champion_full);
		$(this).css("border-color", response.color);
		$(this).fadeIn("fast");
    });
}

/* 
 Verify that answer is correct
 If so, increment streak and provide next level button
 If not, end streak and provide play again button
*/
function verifyAnswer() {
    $.ajax({
        url: '/verify_answer/',
        data: {a: $('#guess').val()},
        type: 'POST',
        success: function(response) {
            $('.alert').fadeOut('slow');
            $('#final-answer-btn').fadeOut('slow', function(){
                if(response.result) {
                    correctAlert();
                    incrementStreak();
                } else {
                    $('#incorrect-msg').text("It's " + response.champion_name + "!");
                    revealChampion(response);
                    checkScore();
                } resetGuess();
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
    return false;
}

/* Submit name to server to record high score */
function submitHighScore() {
    $('#input-highscore').fadeOut('slow');
    $.ajax({
        url: '/submit_score/',
        data: {name: $('#username-input').val()},
        type: 'POST',
        success: function(response) {
            wrongAlert();
            resetStreakCS();
        },
        error: function(error) {
            console.log(error);
        }
    });
    return false;
}


/* Check to see if streak is a high score */
function checkScore() {
	$.ajax({
		url: '/check_score/',
		type: 'POST',
		success: function(response) {
			if(response.result) {
				resetStreakSS();
				$('#input-highscore').fadeIn('slow');
			} else {
				wrongAlert();
				resetStreak();
			}
		},
		error: function(error) {
			console.log(error);
		}
	});
}

/* 
 Fade out play again and next level buttons,
 and present final answer button 
*/
function restartBtnTransition() {
    $('.alert').fadeOut('slow');
    $('#restart-btn').fadeOut('fast');
    $('#next-btn').fadeOut('slow', function() {
        $('#final-answer-btn').fadeIn('slow');
    });
}

/* Reset champion icon to unknown champion */
function resetChampIcon() {
    $("#champ-icon").fadeOut("fast", function(){
        $(this).attr("src", "/static/images/champion/Random.png");
        $(this).css("border-color", "gray");
        $(this).fadeIn("fast");
    });
}

/* Update full image of all champions on specified team */
function renewTeam(team, data) {
    switch(team) {
        case "Team1":
            updateTeamImages("#blue-team", team, 1, data);
            break;
        case "Team2":
            updateTeamImages("#red-team", team, 6, data);
            break;
    }
}

function updateTeamImages(id, team, offset, data) {
	$(id).find("div:visible").fadeOut("fast", function(){
        var $participant = $(this).find("input");
        $participant.attr("src", "/static/images/champion/" + data.champion_full_data[team][$participant.attr("id") - offset][1]);
        $(this).fadeIn("fast");
    });
}

/* Update full image of spell of specified id */
function updateSpellImage(id, full) {
    $(id).fadeOut("fast", function(){
        $(this).attr("src", "/static/images/spell/" + full);
        $(this).fadeIn("fast");
    });
}

/* Update full image of item of specified id */
function updateItemImage(id, full) {
    $(id).fadeOut("fast", function(){
        $(this).attr("src", "/static/images/item/" + full);
        $(this).fadeIn("fast");
    });
}

/* Update teams with new data */
function renewTeams(data) {
    renewTeam("Team1", data);
    renewTeam("Team2", data);
}

/* Update items with new data */
function renewItems(data) {
    updateItemImage("#item0", data.item0.full);
    updateItemImage("#item1", data.item1.full);
    updateItemImage("#item2", data.item2.full);
    updateItemImage("#item3", data.item3.full);
    updateItemImage("#item4", data.item4.full);
    updateItemImage("#item5", data.item5.full);
    updateItemImage("#item6", data.item6.full);
}

/* Update summoner spells with new data */
function renewSpells(data) {
    updateSpellImage("#spell1", data.spell1.full);
    updateSpellImage("#spell2", data.spell2.full);
}

/* Update kills, deaths, and assists with new data */
function renewKD(data) {
    $("#kd").fadeOut("fast", function(){
        $(this).text(data.stats.kills + "/" + data.stats.deaths + "/" + data.stats.assists);
        $(this).fadeIn("fast");
    });
}

/* Update earned gold with new data */
function renewGold(data) {
    $("#gold-earned").fadeOut("fast", function(){
        $(this).text(data.formatted_gold);
        $(this).fadeIn("fast");
    });
}

/* Update creep score with new data */
function renewCS(data) {
    $("#creep-score").fadeOut("fast", function(){
        $(this).text(data.stats.minionsKilled + data.stats.neutralMinionsKilled);
        $(this).fadeIn("fast");
    });
}

/* Update champion kill map with new data */
function renewMap(data) {
    $("#map").remove();
    $("#map-modal-header").after('<div id ="map" class="modal-body" style="text-align: center"></div>');
    loadMap(data.event_data.champ_kills);
}

/* Update win condition with new data */
function renewWinCondition(data) {
    if(data.stats.winner) {
        $("#winner").css("background-color", "green");
        $("#win-cond").css("color", "green");
        $("#win-cond").text("Victory");
    } else {
        $("#winner").css("background-color", "red");
        $("#win-cond").css("color", "red");
        $("#win-cond").text("2nd Place");
    }
}

/* Update skill order table with new data */
function renewSkillTable(data) {
    $("#skill-table").fadeOut("fast", function(){
        $("#q-row").empty();
        $("#w-row").empty();
        $("#e-row").empty();
        $("#r-row").empty();

        var level = data.event_data.skill_level_up.length;
        for(var i = 1; i < 5; i++) {
            generateTableRow(i, level, data);
        }
        $(this).fadeIn("fast");
    });
}

/* Generates the table row for a skill slot given the skill data and the players level*/
function generateTableRow(skill_slot, level, data) {
	var diff = 18 - level;
	var id = "";
	switch(skill_slot) {
		case 1:
			$("#q-row").append('<td class="title-td">Q</td>');
			id = "#q-row";
			break;
		case 2:
			$("#w-row").append('<td class="title-td">W</td>');
			id = "#w-row";
			break;
		case 3:
			$("#e-row").append('<td class="title-td">E</td>');
			id = "#e-row";
			break;
		case 4:
			$("#r-row").append('<td class="title-td">R</td>');
			id = "#r-row";
			break;
	}
	for(var i = 0; i < level; i++) {
		if(data.event_data.skill_level_up[i] == skill_slot) {
			$(id).append('<td><img src="/static/images/misc/circle.png" class="img-rounded"/></td>');
		} else {
			$(id).append('<td></td>');
		}
	}
	for(var j = 0; j < diff; j++) {
		$(id).append('<td></td>');
	}
}

/* Change the match details champion icon to the champion clicked/selected */
function changeChampIcon(source, id, team){
	$("#champ-icon").attr("src", source);
	$('input[name="a"]').val(id);
	if(team == 1){
		$("#champ-icon").css("border-color", "blue");
	} else {
		$("#champ-icon").css("border-color", "red");
	}
}

/* Present alert for wrong answer and restart button */
function wrongAlert() {
	$('#wrong-alert').fadeIn('slow');
	$('#restart-btn').fadeIn('slow');
}

/* Present alert for correct answer and next level button */
function correctAlert() {
	$('#correct-alert').fadeIn('slow');
	$('#next-btn').fadeIn('slow');
}

/* Increment the streak (Client side) */
function incrementStreak(){
	var streak = parseInt($("#streak").text());
	$("#streak").text((++streak));
}

/* Reset streak to 0 (Server-side) */
function resetStreakSS(){
	$.ajax({
        url: '/reset_streak/',
        data: {},
        type: 'POST',
        success: function(response) {},
        error: function(error) {
            console.log(error);
        }
    });
}

/* Reset streak to 0 (Client-side) */
function resetStreakCS(){
	$("#streak").text(0);
}

/* Reset streak to 0 */
function resetStreak(){
	resetStreakSS();
	resetStreakCS();
}

/* Reset the players guess */
function resetGuess() {
    $('#guess').val(0);
}

/* 
Code sample taken and modified from examples found on the following pages -
https://developer.riotgames.com/docs/game-constants
http://jsfiddle.net/utwvqsrg/
*/
function loadMap(coords){
	var cords = coords,

    // Domain for the current Summoner's Rift on the in-game mini-map
    domain = {
            min: {x: -120, y: -120},
            max: {x: 14870, y: 14980}
    },
    width = 512,
    height = 512,
    bg = "https://s3-us-west-1.amazonaws.com/riot-api/img/minimap-ig.png",
    xScale, yScale, svg;

	color = d3.scale.linear()
	    .domain([0, 3])
	    .range(["white", "steelblue"])
	    .interpolate(d3.interpolateLab);

	xScale = d3.scale.linear()
	  .domain([domain.min.x, domain.max.x])
	  .range([0, width]);

	yScale = d3.scale.linear()
	  .domain([domain.min.y, domain.max.y])
	  .range([height, 0]);

	svg = d3.select("#map").append("svg:svg")
	    .attr("width", width)
	    .attr("height", height);

	svg.append('image')
	    .attr('xlink:href', bg)
	    .attr('x', '0')
	    .attr('y', '0')
	    .attr('width', width)
	    .attr('height', height);

	svg.append('svg:g').selectAll("circle")
	    .data(cords)
	    .enter().append("svg:circle")
	        .attr('cx', function(d) { return xScale(d[0]); })
	        .attr('cy', function(d) { return yScale(d[1]); })
	        .attr('r', 5)
	        .attr('class', 'kills');
}