from flask import Blueprint, render_template, request, jsonify
from text_generation.text_generation import generateText

views = Blueprint(__name__, "views")

@views.route("/")
def home():
    return render_template("index.html")

@views.route("/settings")
def settings():
    return render_template("settings.html")

@views.route("/login")
def login():
    return render_template("login.html")

@views.route("/generate-text", methods=['POST'])
def get_generated_text():
    json = request.get_json(force=True)
    return jsonify({"text" : generateText(json, 500)});

