# Who's That Champion? - URF Version

'Who's That Champion? - URF Version' is an interactive game and web application designed for the first Riot Games API Challenge.
The app was chosen as a winning submission placing as a runner-up.

The rules are simple:
  - Analyze the match details that are given to you.
  - Guess which champion the data is from (based soley on analysis, problem solving, and guesstimations).
  - See how many you can get right in a row, and brag to your friends!

It may sound like a cake walk, but you'd be surprised how challenging it can be with a URF game mode's meta.
 
We have collected data from over 85,000 URF mode games, so you're sure to get a unique match every time you play.

### Demo
A demo for this project is no longer available.

Enjoy!

### Version
1.1.1

### Tech

"Who's That Champion?" was developed with the following tech stack:

* [Digital Ocean](https://www.digitalocean.com/?refcode=487c619b6f74) - SSD Cloud Server/Hosting
* [MongoDB/PyMongo](https://api.mongodb.org/python/current/) - Open-source document/NoSQL database 
* [Flask](http://flask.pocoo.org/) - Microframework for Python (Werkzeug, Jinja2)
* [Twitter Bootstrap](http://getbootstrap.com/) - Front-end framework for modern web apps
* [jQuery](https://jquery.com/) - Cross-platform Javascript library
* [D3.js](http://d3js.org/) - Data-driven document Javascript library
* [Riot Games API](https://developer.riotgames.com/) - League of Legends game data
* [Twitter API](https://dev.twitter.com/web/overview) - Tweet buttons, yo

### Backend

A [matchId daemon](https://github.com/rithms/whos-that-champion/blob/master/FlaskApp/FlaskApp/daemon/match_ids_d.py) was created to fetch matchIds every time a new batch was available. It ran as a long running process until URF mode was 
made unavailable. Each matchId from a batch was stored as a document in a matchIds collection in the database.

A [match details daemon](https://github.com/rithms/whos-that-champion/blob/master/FlaskApp/FlaskApp/daemon/match_details_d.py) was created to retrieve the match details of every matchId found in the database via the Riot Games API. The necessary match
data needed for the web app was parsed from the data returned from the Riot Games API and made into a document. This document was then stored in the
matches collection in the database.

A [static data script](https://github.com/rithms/whos-that-champion/blob/master/FlaskApp/FlaskApp/scripts/static_data.py) was created and run one time. The script retrieved static data for champions, spells, and items via the Riot API.
The necessary data for the web app was parsed and made into a document, which was then stored in the database to their respective collections. Namely, the champions, items, and spells collections of the database.

Now that URF is over, none of these scripts need to be run, as all data is up to date in relation to the stored matches.

### Contributions
This project is now open source now that the API Challenge is over.
If you would like to contribute to this project please open an issue, or send a pull request.

### Disclaimer
"Who's That Champion?" isn’t endorsed by Riot Games and doesn’t reflect the views or opinions 
of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends 
and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
