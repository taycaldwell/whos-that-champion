#!/usr/bin/python
import time
from daemon import runner
from configure import getApiKey
from pymongo import MongoClient
import requests

# Daemon ran to retrieve matchIds from the urf endpoint.
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
        collection = db.match_ids

        key = getApiKey() # Read API key from config file
        begin_date = 1427937000 # (Earliest timestamp) TODO: don't hardcode this

        # Daemon loop
        while True:
            while(begin_date < time.time()):
                url = 'https://na.api.pvp.net/api/lol/na/v4.1/game/ids?beginDate=' + str(begin_date) + '&api_key=' + key
                r = requests.get(url)
                if r.status_code == 429:
                    #Should never hit rate limit, as we 
                    # are waiting a second between requests.
                    time.sleep(10)
                elif r.status_code == 200:
                    for matchId in r.json():
                        collection.update({'matchId': matchId}, {'matchId': matchId}, upsert=True)
                    begin_date += 300
                    time.sleep(1)
                elif r.status_code == 404:
                    time.sleep(301)
                else:
                    #This block should never execute. Just in casies.
                    print("Something went wrong: " + str(r.status_code))

app = App()
daemon_runner = runner.DaemonRunner(app)
daemon_runner.do_action()