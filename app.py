from flask import Flask, render_template, request, jsonify, session
import requests

app = Flask(__name__)
app.secret_key = 'P@ssw0rd123#@!'

def update_context(conversation_history, user_input, bot_response=None):
    new_entry = f"User: {user_input}\n"
    if bot_response:
        new_entry += f"Sam: {bot_response}\n"
    return conversation_history + "\n" + new_entry

@app.route("/")
def home():
    if 'conversation_history' not in session:
        session['conversation_history'] = ""
    return render_template("base.html")

@app.route("/clear", methods=["GET"])
def clear():
    session.clear()
    return jsonify({"response": "Riwayat percakapan telah dihapus."})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("message")
    if not user_input:
        return jsonify({"response": "Input pengguna tidak ditemukan."}), 400

    conversation_history = session.get("conversation_history", "")

    conversation_history = conversation_history.split("\n")
    conversation_history = conversation_history[-6:]
    conversation_history = "\n".join(conversation_history)

    context = conversation_history + f"\nUser: {user_input}\nSam:"

    prompt = "Play the role of a bookstore keeper. Your task is to answer according to this context in the 'Sam' section with short-medium and concise answer. If the user's question is not related to your book store, just say 'I'm sorry, I don't know the answer to that question.'. Context: " + context
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBpq2RQbK_hjhldsM720uGkZUq2AdKh33M"
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    response = requests.post(url, json=payload)
    json_response = response.json()
    bot_response = json_response["candidates"][0]["content"]["parts"][0]["text"]
    bot_response = bot_response.replace("Sam: ", "")

    conversation_history = update_context(conversation_history, user_input, bot_response)
    session['conversation_history'] = conversation_history

    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(debug=True)