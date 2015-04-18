$(document).ready(function(){

	/* Bootstrap tooltip */
	$('[data-toggle="tooltip"]').tooltip();

	/* Champion hover transition */
	$('.champ-select').hover(function() {
   		$(this).addClass('transition');
    
    }, function() {
        $(this).removeClass('transition');
    });

	/* 
	Verify that answer is correct
	If so, increment streak and provide next level button
	If not, end streak and provide play again button
	*/
    $('input#final-answer-btn').bind('click', function() {
        $.ajax({
            url: '/verify_answer/',
            data: {a: $('input[name="a"]').val()},
            type: 'POST',
            success: function(response) {
                $('.alert').fadeOut('slow');
	        	$('#final-answer-btn').fadeOut('slow', function(){
	        		if(response.result) {
						$('#correct-alert').fadeIn('slow');
						$('#next-btn').fadeIn('slow');
						incrementStreak();
					} else {
						$('#incorrect-msg').text("It's " + response.champion_name + "!");
						$('#champ-icon').fadeOut('fast', function(){
							$(this).attr("src", "/static/images/champion/" + response.champion_full);
							$(this).css("border-color", response.color);
			    			$(this).fadeIn("fast");
						});
						$("#tweeter").attr("data-text", "I just went on a " + $("#streak").text() + " win streak playing &quot;WhosThatChampion?&quot;");
						$("#tweeter").fadeIn("slow");
						$('#wrong-alert').fadeIn('slow');
						$('#restart-btn').fadeIn('slow');
						resetStreak();
					}
	        	});
            },
            error: function(error) {
                console.log(error);
            }
        });

        return false;
    });
	
	/*
	Transition to next level
	*/
	$('#next-btn').bind('click', restart);
	$('#restart-btn').bind('click', restart);

});

function restart() {
    $.ajax({
        url: '/next_level/',
        data: {},
        type: 'POST',
        success: function(response) {
        	$('.alert').fadeOut('slow');
        	$('#restart-btn').fadeOut('fast');
    		$('#next-btn').fadeOut('slow', function(){
    			$('#final-answer-btn').fadeIn('slow');
    		});

    		//renew data 
			$("#blue-team").find("div:visible").fadeOut("fast", function(){
			    var $participant = $(this).find("input");
			    $participant.attr("src", "/static/images/champion/" + response.result['champion_full_data']['Team1'][($participant.attr("id")-1)][1]);
			    $(this).fadeIn("fast");
			});

			$("#red-team").find("div:visible").fadeOut("fast", function(){
			    var $participant = $(this).find("input");
			    $participant.attr("src", "/static/images/champion/" + response.result['champion_full_data']['Team2'][($participant.attr("id")-6)][1]);
			    $(this).fadeIn("fast");
			});

			$("#champ-icon").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/champion/Random.png");
			    $(this).css("border-color", "gray");
			    $(this).fadeIn("fast");
			});

			if(response.result['stats']['winner']) {
				$("#winner").css("background-color", "green");
				$("#win-cond").css("color", "green");
				$("#win-cond").text("Victory");
			} else {
				$("#winner").css("background-color", "red");
				$("#win-cond").css("color", "red");
				$("#win-cond").text("2nd Place");
			}

			/* Clean this shit up you savage */
			$("#spell1").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/spell/" + response.result["spell1"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#spell2").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/spell/" + response.result["spell2"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#item0").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/item/" + response.result["item0"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#item1").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/item/" + response.result["item1"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#item2").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/item/" + response.result["item2"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#item3").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/item/" + response.result["item3"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#item4").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/item/" + response.result["item4"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#item5").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/item/" + response.result["item5"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#item6").fadeOut("fast", function(){
			    $(this).attr("src", "/static/images/item/" + response.result["item6"]["full"]);
			    $(this).fadeIn("fast");
			});

			$("#kd").fadeOut("fast", function(){
			    $(this).text(response.result['stats']['kills'] + "/" + response.result['stats']['deaths'] + "/" + response.result['stats']['assists']);
			    $(this).fadeIn("fast");
			});

			$("#gold-earned").fadeOut("fast", function(){
			    $(this).text(response.result['formatted_gold']);
			    $(this).fadeIn("fast");
			});

			$("#creep-score").fadeOut("fast", function(){
			    $(this).text(response.result['stats']['minionsKilled'] + response.result['stats']['neutralMinionsKilled']);
			    $(this).fadeIn("fast");
			});

			$("#map").remove();
			$(".modal-header").after('<div id ="map" class="modal-body" style="text-align: center">');
			loadMap(response.result['event_data']['champ_kills']);


			$("#skill-table").fadeOut("fast", function(){
			   	$("#q-row").empty();
				$("#w-row").empty();
				$("#e-row").empty();
				$("#r-row").empty();

				var level = response.result['event_data']['skill_level_up'].length;
				generateTableRow(1, level, response);
				generateTableRow(2, level, response);
				generateTableRow(3, level, response);
				generateTableRow(4, level, response); 
			    $(this).fadeIn("fast");
			});

        },
        error: function(error) {
            console.log(error);
        }
    });
    return false;
}

/* Generates the table row for a skill slot given the skill data and the players level*/
function generateTableRow(skill_slot, level, response) {
	var diff = 18 - level;
	var id = ""
	switch(skill_slot) {
	case 1:
		$("#q-row").append('<td style="background-color: rgba(1,1,1,.87)">Q</td>');
		id = "#q-row"
		break;
	case 2:
		$("#w-row").append('<td style="background-color: rgba(1,1,1,.87)">W</td>');
		id = "#w-row"
		break;
	case 3:
		$("#e-row").append('<td style="background-color: rgba(1,1,1,.87)">E</td>');
		id = "#e-row"
		break;
	case 4:
		$("#r-row").append('<td style="background-color: rgba(1,1,1,.87)">R</td>');
		id = "#r-row"
		break;
	}
	for(i = 0; i < level; i++) {
		if(response.result['event_data']['skill_level_up'][i] == skill_slot) {
			$(id).append('<td><img src="/static/images/misc/circle.png" class="img-rounded"/></td>');
		} else {
			$(id).append('<td></td>');
		}
	}
	for(j = 0; j < diff; j++) {
		$(id).append('<td></td>');
	}
}


/* Change the match div icon to the champion clicked/selected */
function changeChampIcon(source, id, team){
	$("#champ-icon").attr("src", source);
	$('input[name="a"]').val(id)
	if(team == 1){
		$("#champ-icon").css("border-color", "blue");
	} else {
		$("#champ-icon").css("border-color", "red");
	}
}

/* Increment the streak (client side) */
function incrementStreak(){
	var streak = parseInt($("#streak").text());
	$("#streak").text((++streak));
}

/* Reset streak to 0 */
function resetStreak(){
	$.ajax({
            url: '/reset_streak/',
            data: {},
            type: 'POST',
            success: function(response) {},
            error: function(error) {
                console.log(error);
            }
        });
	$("#streak").text(0);
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
	        .attr('cx', function(d) { return xScale(d[0]) })
	        .attr('cy', function(d) { return yScale(d[1]) })
	        .attr('r', 5)
	        .attr('class', 'kills');
}