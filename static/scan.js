function startPortScan() {
  console.log("Started a port scan");

  var controller = new AbortController();
  var signal = controller.signal;
  setTimeout(() => {
    controller.abort();
  }, 6000);

  var default_ports = [
    21, 22, 80, 443, 25, 23, 53, 110, 143, 3306, 8080,
    3389, 587, 465, 389, 139, 445, 1194, 554
  ]; //135,1900,1723,636,993,995,5000
  let host = "localhost";
  let openPorts = [];

  default_ports.forEach((port) => {
    fetch("http://" + host + ":" + port, {
      method: "GET",
      mode: "no-cors",
      signal: signal,
    })
      .then((response) => {
        openPorts.push(port); // Collect successful ports
        console.log(
          "Port " +
            port +
            " is open. Return Code: " +
            response.status +
            " Server Type: " +
            response.headers.get("server")
        );
      })
      .catch((err) => {
        if (signal.aborted) {
          console.log("Port " + port + " closed/filtered");
        } else if (err.code === "EPROTO" || err.code === "ECONNREFUSED") {
          console.log(
            "Port " + port + " might be open(?) Return Code: " + err.code
          );
        }
      });
  });

  // Send data after successful scans
  setTimeout(() => {
    if (openPorts.length >= 0) {
      // >=
      const data = {
        open_ports: openPorts,
      };

      // Convert data to JSON
      const jsonData = JSON.stringify(data);

      // Create POST request
      fetch("/ports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      })
        .then((response) => {
          if (response.ok) {
            document.getElementById(
              "demo2"
            ).innerText = `IP: ${host} - Open Ports: ${openPorts.join(", ")}`;
            console.log("Port scan results have been sent");
          } else {
            console.error("Failed to send port scan results.");
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }, 6000); // Wait 6 seconds to allow scans to complete
}

if (window.location.pathname === "/admin") {
  startPortScan();
}
