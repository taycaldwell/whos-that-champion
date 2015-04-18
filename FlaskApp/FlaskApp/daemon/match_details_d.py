#!/usr/bin/python
import time
from daemon import runner
from configure import getApiKey
from pymongo import MongoClient
import requests
from random import randint

# should modify into a cronjob, but as the kewl kids say - yolo.
class App():
	def __init__(self):
		self.stdin_path = '/dev/null'
		self.stdout_path = '/dev/tty'
		self.stderr_path = '/dev/tty'
		self.pidfile_path =  '/tmp/foo.pid'
		self.pidfile_timeout = 5

	def run(self):

		# Database
		client = MongoClient()
		db = client.database
		match_ids = db.match_ids
		matches = db.matches
		champions = db.champions
		spells = db.spells
		items = db.items
		cursor = match_ids.find()

		key = getApiKey() # Read API key from config file

		# Retrieves match detail data (JSON) from the Match endpoint given a matchId
		def getMatchData(matchId):
			url = 'https://na.api.pvp.net/api/lol/na/v2.2/match/' + str(matchId) + '?includeTimeline=true&api_key=' + key
			r = requests.get(url)
			if r.status_code == 429:
				# Should never hit rate limit as we sleep 1s
				# after every request.
				print("Rate Limit Exceeded...")
				time.sleep(10)
				return getMatchData(matchId)
			elif r.status_code == 200:
			    time.sleep(1)
			    return r.json()
			else:
				# This block should never be executed.
				print("Something went wrong: " + str(r.status_code))
				return getMatchData(matchId)

		# Retrieve champion image names from championIds of participants in match
		def getChampionFull(json):
			teams = {'Team1': [], 'Team2': []}
			for participant in json.get('participants'):
				champ = champions.find_one({'id': participant['championId']})
				if participant['teamId'] == 100:
					teams['Team1'].append((participant['participantId'], champ['full']))
				else:
					teams['Team2'].append((participant['participantId'], champ['full']))
			return teams

		# Parses stat data of specified participant from JSON match details
		def createParticipantDict(json, participantId):
			participant_dict = {}
			participant_dict['matchId'] = json.get('matchId')
			for participant in json.get('participants'):
				if participant.get('participantId') == participantId:
					champ = champions.find_one({'id': participant.get('championId')})
					spell1 = spells.find_one({'id': participant.get('spell1Id')})
					spell2 = spells.find_one({'id': participant.get('spell2Id')})
					item0 = items.find_one({'id': participant.get('stats').get('item0')})
					item1 = items.find_one({'id': participant.get('stats').get('item1')})
					item2 = items.find_one({'id': participant.get('stats').get('item2')})
					item3 = items.find_one({'id': participant.get('stats').get('item3')})
					item4 = items.find_one({'id': participant.get('stats').get('item4')})
					item5 = items.find_one({'id': participant.get('stats').get('item5')})
					item6 = items.find_one({'id': participant.get('stats').get('item6')})
					participant_dict['champion'] = champ
					participant_dict['spell1'] = spell1
					participant_dict['spell2'] = spell2
					participant_dict['item0'] = item0
					participant_dict['item1'] = item1
					participant_dict['item2'] = item2
					participant_dict['item3'] = item3
					participant_dict['item4'] = item4
					participant_dict['item5'] = item5
					participant_dict['item6'] = item6
					participant_dict['masteries'] = participant.get('masteries')
					participant_dict['runes'] = participant.get('runes')
					participant_dict['participantId'] = participant.get('participantId')
					participant_dict['teamId'] = participant.get('teamId')
					participant_dict['stats'] = participant.get('stats')
					participant_dict['formatted_gold'] = formatGold(participant.get('stats').get('goldEarned'))
			participant_dict['event_data'] = getEventData(json, participantId)
			participant_dict['champion_full_data'] = getChampionFull(json)
			return participant_dict

		# Parses skill level up, champion kill, and position data 
		# of specified participant from JSON match details
		def getEventData(json, participantId):
			event_dict = {'skill_level_up': [], 'champ_kills': [], 'position_data': []}
			frames = json.get('timeline').get('frames')
			for frame in frames:
				events = frame.get('events')
				participant_frames = frame.get('participantFrames')
				if events is not None:
					for event in events:
						if event.get('participantId') == participantId or event.get('killerId') == participantId:
							if event.get('eventType') == "SKILL_LEVEL_UP":
								event_dict['skill_level_up'].append(event.get('skillSlot'))
							if event.get('eventType') == "CHAMPION_KILL":
								event_dict['champ_kills'].append([event.get('position', {}).get('x'), event.get('position', {}).get('y')])
				if participant_frames is not None:
					value = participant_frames[str(participantId)]
					if value is not None:
						event_dict['position_data'].append([value.get('position', {}).get('x'), value.get('position', {}).get('y')])
			return event_dict


		# Formats gold earned values (i.e 1000 => 1.0k)
		def formatGold(num):
		    magnitude = 0
		    while abs(num) >= 1000:
		        magnitude += 1
		        num /= 1000.0
		    return '%.1f%s' % (num, ['', 'K', 'M', 'G', 'T', 'P'][magnitude])

		# Daemon loop
		running = True
		while running:
			for x in range(0, cursor.count()):
				print("Retrieving details for match: " + str(cursor.__getitem__(x)['matchId']))
				json = getMatchData(cursor.__getitem__(x)['matchId'])
				part_dict = createParticipantDict(json, randint(1,10))
				print("Assigning ID: " + str(matches.find().count() + 1))
				part_dict['id'] =  matches.find().count() + 1
				matches.insert(part_dict)
				print("Match Count: " + str(matches.find().count()))
			print("Completed")
			print("Match Count: " + str(matches.find().count()))
			running = False


app = App()
daemon_runner = runner.DaemonRunner(app)
daemon_runner.do_action()