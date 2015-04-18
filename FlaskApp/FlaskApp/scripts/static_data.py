#!/usr/bin/python
import time
from configure import getApiKey
from pymongo import MongoClient
import requests

# Static Data script - no need to run as cronjob
# as the static data for the urf matches won't need updated data.
client = MongoClient()
db = client.database
key = getApiKey()
champion_collection = db.champions
spell_collection = db.spells
item_collection = db.items

champ_url = 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?dataById=false&champData=all&api_key=' + key
spell_url = 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/summoner-spell?dataById=false&spellData=all&api_key=' + key
item_url = 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/item?itemListData=all&api_key=' + key

def getStaticData(url, type): 
	r = requests.get(url)
	if r.status_code == 429:
	    print("Rate limit exceeded...Sleeping...")
	    time.sleep(10)
	elif r.status_code == 200:
	    print("Success...")
	    json = r.json()
	    for name, data in json['data'].iteritems():
	    	if type == "CHAMPION_DATA":
	        	champion_collection.update({'id': data['id'], 'key': data['key'], 'name': data['name'], 'full': data['image']['full']}, {'id': data['id'], 'key': data['key'], 'name': data['name'], 'full': data['image']['full']}, upsert=True)
	        if type == "SPELL_DATA":
	        	spell_collection.update({'id': data['id'], 'key': data['key'], 'name': data['name'], 'full': data['image']['full']}, {'id': data['id'], 'key': data['key'], 'name': data['name'], 'full': data['image']['full']}, upsert=True)
	        if type == "ITEM_DATA":
	        	item_collection.update({'id': data['id'], 'name': data['name'], 'full': data['image']['full']}, {'id': data['id'], 'name': data['name'], 'full': data['image']['full']}, upsert=True)
	    time.sleep(1)
	else: 
	    print("Something went wrong: " + str(r.status_code))

item_collection.update({'id': 0, 'name': 'NoItem', 'full': 'NoItem.png'}, {'id': 0, 'name': 'NoItem', 'full': 'NoItem.png'}, upsert=True)
getStaticData(champ_url, "CHAMPION_DATA")
getStaticData(spell_url, "SPELL_DATA")
getStaticData(item_url, "ITEM_DATA")