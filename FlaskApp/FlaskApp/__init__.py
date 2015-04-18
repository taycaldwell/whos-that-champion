from flask import Flask, render_template, session, request, url_for, jsonify, Response
from configure import getApiKey
from pymongo import MongoClient
from random import randint
from bson import json_util
import requests

app = Flask(__name__)

client = MongoClient()
db = client.database
matchIds = db.match_ids
matches = db.matches

key = getApiKey()

@app.route('/')
def homepage():
	session['streak'] = 0
	session['participantId'] = 0
	session['champion'] = ""
	return render_template("index.html", matchIdCount = str(matchIds.count()), matchCount = str(matches.count()))

@app.route('/urf/')
def urf():
	# Get random match, and assign participantId to session
	data = get_match()
	return render_template("urf.html", data = data)

@app.route('/verify_answer/', methods=['POST'])
def verify_answer():
    a = int(request.form['a'])
    b = session['participantId']
    if a == b:
    	session['streak'] += 1
    if b <=5:
    	color = "blue"
    else: color = "red"
    return jsonify(result = a == b, champion_name = str(session['champion']), champion_full = str(session['full']), color = color)

@app.route('/reset_streak/', methods=['POST'])
def reset_streak():
	session['streak'] = 0
	return jsonify(result = True)

@app.route('/next_level/', methods=['POST'])
def next_level():
	data = get_match()
	return Response(json_util.dumps({'result' : data}), mimetype='application/json')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

def get_match():
	data = matches.find_one({'id': randint(1,matches.count())})
	session['participantId'] = data['participantId']
	session['champion'] = data['champion']['name']
	session['full'] = data['champion']['full']
	return data

if __name__ == "__main__":
    app.run()