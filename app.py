from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__, static_url_path='', static_folder='.')

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/save-data', methods=['POST'])
def save_data():
    try:
        data = request.get_json()
        with open('data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error saving data: {e}")
        return jsonify({'error': 'Failed to save data'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)
