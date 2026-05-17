/* ===== WeatherAI – app.js ===== */

// ---------- PASSWORD GATE ----------
(function () {
  const CORRECT_PASSWORD = "12345";

  const gate      = document.getElementById("password-gate");
  const input     = document.getElementById("gate-password");
  const btn       = document.getElementById("gate-btn");
  const errorEl   = document.getElementById("gate-error");
  const inputWrap = document.getElementById("gate-input-wrap");

  function tryUnlock() {
    if (input.value === CORRECT_PASSWORD) {
      // Correct — fade out gate and unlock body
      gate.classList.add("unlocked");
      document.body.classList.remove("locked");
      // Remove gate from DOM after transition
      gate.addEventListener("transitionend", () => gate.remove(), { once: true });
    } else {
      // Wrong — shake + show error
      errorEl.classList.remove("hidden");
      inputWrap.classList.remove("error-shake");
      // Force reflow to restart animation
      void inputWrap.offsetWidth;
      inputWrap.classList.add("error-shake");
      input.value = "";
      input.focus();
      // Remove shake class after animation ends
      inputWrap.addEventListener("animationend", () => {
        inputWrap.classList.remove("error-shake");
      }, { once: true });
    }
  }

  btn.addEventListener("click", tryUnlock);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });
})();

// ---------- DATA ----------
const WORLD_CITIES = [
  { name: "New York",     country: "🇺🇸 USA",          lat: 40.7128,  lon: -74.0060  },
  { name: "London",       country: "🇬🇧 UK",           lat: 51.5074,  lon: -0.1278   },
  { name: "Tokyo",        country: "🇯🇵 Japan",         lat: 35.6762,  lon: 139.6503  },
  { name: "Dubai",        country: "🇦🇪 UAE",           lat: 25.2048,  lon: 55.2708   },
  { name: "Paris",        country: "🇫🇷 France",        lat: 48.8566,  lon: 2.3522    },
  { name: "Sydney",       country: "🇦🇺 Australia",     lat: -33.8688, lon: 151.2093  },
  { name: "Mumbai",       country: "🇮🇳 India",         lat: 19.0760,  lon: 72.8777   },
  { name: "Beijing",      country: "🇨🇳 China",         lat: 39.9042,  lon: 116.4074  },
  { name: "São Paulo",    country: "🇧🇷 Brazil",        lat: -23.5505, lon: -46.6333  },
  { name: "Cairo",        country: "🇪🇬 Egypt",         lat: 30.0444,  lon: 31.2357   },
  { name: "Moscow",       country: "🇷🇺 Russia",        lat: 55.7558,  lon: 37.6173   },
  { name: "Toronto",      country: "🇨🇦 Canada",        lat: 43.6532,  lon: -79.3832  },
  { name: "Singapore",    country: "🇸🇬 Singapore",     lat: 1.3521,   lon: 103.8198  },
  { name: "Istanbul",     country: "🇹🇷 Turkey",        lat: 41.0082,  lon: 28.9784   },
  { name: "Lagos",        country: "🇳🇬 Nigeria",       lat: 6.5244,   lon: 3.3792    },
  { name: "Mexico City",  country: "🇲🇽 Mexico",        lat: 19.4326,  lon: -99.1332  },
  { name: "Berlin",       country: "🇩🇪 Germany",       lat: 52.5200,  lon: 13.4050   },
  { name: "Bangkok",      country: "🇹🇭 Thailand",      lat: 13.7563,  lon: 100.5018  },
  { name: "Jakarta",      country: "🇮🇩 Indonesia",     lat: -6.2088,  lon: 106.8456  },
  { name: "Seoul",        country: "🇰🇷 South Korea",   lat: 37.5665,  lon: 126.9780  },
  { name: "Nairobi",      country: "🇰🇪 Kenya",         lat: -1.2921,  lon: 36.8219   },
  { name: "Buenos Aires", country: "🇦🇷 Argentina",     lat: -34.6037, lon: -58.3816  },
  { name: "Riyadh",       country: "🇸🇦 Saudi Arabia",  lat: 24.7136,  lon: 46.6753   },
  { name: "Madrid",       country: "🇪🇸 Spain",         lat: 40.4168,  lon: -3.7038   },
];

const SEARCH_SUGGESTIONS = [
  "New York","London","Tokyo","Dubai","Paris","Sydney","Mumbai","Beijing",
  "Moscow","Toronto","Singapore","Istanbul","Lagos","Berlin","Bangkok","Seoul",
  "Cairo","São Paulo","Nairobi","Madrid","Riyadh","Buenos Aires","Jakarta","Mexico City"
];

// ---------- STATE ----------
let isCelsius = true;
let weatherData = {}; // city name -> data
let featuredCity = WORLD_CITIES[0];

// ---------- WEATHER CODE MAP ----------
function getWeatherInfo(code) {
  const map = {
    0:  { label: "Clear Sky",        icon: "☀️",  cond: "clear"  },
    1:  { label: "Mainly Clear",     icon: "🌤️", cond: "clear"  },
    2:  { label: "Partly Cloudy",    icon: "⛅",  cond: "cloudy" },
    3:  { label: "Overcast",         icon: "☁️",  cond: "cloudy" },
    45: { label: "Foggy",            icon: "🌫️", cond: "cloudy" },
    48: { label: "Icy Fog",          icon: "🌫️", cond: "snowy"  },
    51: { label: "Light Drizzle",    icon: "🌦️", cond: "rainy"  },
    53: { label: "Drizzle",          icon: "🌦️", cond: "rainy"  },
    55: { label: "Heavy Drizzle",    icon: "🌧️", cond: "rainy"  },
    61: { label: "Light Rain",       icon: "🌧️", cond: "rainy"  },
    63: { label: "Rain",             icon: "🌧️", cond: "rainy"  },
    65: { label: "Heavy Rain",       icon: "🌧️", cond: "rainy"  },
    71: { label: "Light Snow",       icon: "🌨️", cond: "snowy"  },
    73: { label: "Snow",             icon: "❄️",  cond: "snowy"  },
    75: { label: "Heavy Snow",       icon: "❄️",  cond: "snowy"  },
    77: { label: "Snow Grains",      icon: "🌨️", cond: "snowy"  },
    80: { label: "Rain Showers",     icon: "🌦️", cond: "rainy"  },
    81: { label: "Heavy Showers",    icon: "🌧️", cond: "rainy"  },
    82: { label: "Violent Showers",  icon: "⛈️", cond: "stormy" },
    85: { label: "Snow Showers",     icon: "🌨️", cond: "snowy"  },
    86: { label: "Heavy Snow Showers",icon: "❄️", cond: "snowy"  },
    95: { label: "Thunderstorm",     icon: "⛈️", cond: "stormy" },
    96: { label: "Thunderstorm + Hail",icon:"⛈️",cond: "stormy" },
    99: { label: "Heavy Thunderstorm",icon: "🌩️",cond: "stormy" },
  };
  return map[code] || { label: "Unknown", icon: "🌡️", cond: "cloudy" };
}

function windDirection(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// ---------- TEMPERATURE CONVERSION ----------
function displayTemp(c) {
  if (isCelsius) return `${Math.round(c)}°C`;
  return `${Math.round(c * 9/5 + 32)}°F`;
}
function displayTempNum(c) {
  return isCelsius ? Math.round(c) : Math.round(c * 9/5 + 32);
}

// ---------- FETCH WEATHER ----------
async function fetchWeather(city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m,` +
    `relativehumidity_2m,surface_pressure,uv_index&timezone=auto&forecast_days=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

// ---------- AI INSIGHT ----------
function generateAIInsight(city, data) {
  const c = data.current;
  const info = getWeatherInfo(c.weathercode);
  const t = Math.round(c.temperature_2m);
  const feels = Math.round(c.apparent_temperature);
  const humidity = c.relativehumidity_2m;
  const wind = Math.round(c.windspeed_10m);
  const uv = c.uv_index;

  let insights = [];

  // Temperature feel
  if (t > 38) insights.push(`🔥 Extreme heat in ${city.name} at ${displayTemp(t)} — stay hydrated and avoid direct sunlight.`);
  else if (t > 30) insights.push(`☀️ It's hot and sunny in ${city.name} at ${displayTemp(t)}. Perfect beach weather but use sunscreen!`);
  else if (t > 20) insights.push(`😊 Comfortable and warm in ${city.name} at ${displayTemp(t)} — great day to be outdoors.`);
  else if (t > 10) insights.push(`🧥 Mild weather in ${city.name} at ${displayTemp(t)} — a light jacket would be ideal.`);
  else if (t > 0) insights.push(`🧣 It's cold in ${city.name} at ${displayTemp(t)} — layer up before heading out!`);
  else insights.push(`🥶 Freezing conditions in ${city.name} at ${displayTemp(t)} — dress in heavy winter clothing.`);

  // Feels like delta
  const delta = Math.abs(feels - t);
  if (delta >= 4) insights.push(`The wind chill makes it feel like ${displayTemp(feels)}.`);

  // Rain/storm
  if ([65,81,82,95,96,99].includes(c.weathercode)) insights.push(`⛈️ Heavy precipitation expected — carry an umbrella and avoid flooding-prone areas.`);
  else if ([51,53,55,61,63,80].includes(c.weathercode)) insights.push(`🌂 Light rain showers — keep an umbrella handy.`);

  // Humidity
  if (humidity > 85) insights.push(`💧 Very high humidity (${humidity}%) — feels muggy and uncomfortable outdoors.`);
  else if (humidity < 25) insights.push(`🏜️ Very dry air (${humidity}% humidity) — stay hydrated and use moisturizer.`);

  // Wind
  if (wind > 50) insights.push(`💨 Strong winds at ${wind} km/h — secure loose objects and be cautious outdoors.`);
  else if (wind > 30) insights.push(`🌬️ Breezy conditions at ${wind} km/h.`);

  // UV
  if (uv >= 8) insights.push(`🌞 Extreme UV index (${uv}) — apply SPF 50+ sunscreen if going outside.`);
  else if (uv >= 6) insights.push(`☀️ High UV index (${uv}) — sunscreen recommended.`);

  return insights.join(" ");
}

// ---------- CLOCK ----------
function updateClock() {
  const el = document.getElementById("current-time");
  if (el) el.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
setInterval(updateClock, 1000);
updateClock();

// ---------- RENDER FEATURED CARD ----------
function renderFeaturedCard(city, data) {
  const c = data.current;
  const info = getWeatherInfo(c.weathercode);
  const updated = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("featured-card").innerHTML = `
    <div class="featured-inner">
      <div class="featured-left">
        <div class="featured-city">${city.name}</div>
        <div class="featured-country">${city.country}</div>
        <div class="featured-condition">${info.label}</div>
      </div>
      <div class="featured-center">
        <div class="featured-icon">${info.icon}</div>
      </div>
      <div class="featured-right">
        <div class="featured-temp">${displayTemp(c.temperature_2m)}</div>
        <div class="featured-feels">Feels like ${displayTemp(c.apparent_temperature)}</div>
        <div class="featured-stats">
          <div class="fstat"><div class="fstat-label">💧 Humidity</div><div class="fstat-value">${c.relativehumidity_2m}%</div></div>
          <div class="fstat"><div class="fstat-label">💨 Wind</div><div class="fstat-value">${Math.round(c.windspeed_10m)} km/h</div></div>
          <div class="fstat"><div class="fstat-label">🧭 Direction</div><div class="fstat-value">${windDirection(c.winddirection_10m)}</div></div>
          <div class="fstat"><div class="fstat-label">🌞 UV Index</div><div class="fstat-value">${c.uv_index ?? "–"}</div></div>
        </div>
        <div class="featured-updated">Last updated: ${updated}</div>
      </div>
    </div>`;

  // AI insight
  const insightEl = document.getElementById("ai-insight-text");
  insightEl.textContent = "";
  insightEl.classList.add("ai-typing");
  const text = generateAIInsight(city, data);
  let i = 0;
  const interval = setInterval(() => {
    insightEl.textContent += text[i++];
    if (i >= text.length) { clearInterval(interval); insightEl.classList.remove("ai-typing"); }
  }, 18);
}

// ---------- RENDER CITY CARD ----------
function renderCityCard(city, data, idx) {
  const c = data.current;
  const info = getWeatherInfo(c.weathercode);
  const el = document.createElement("div");
  el.className = "city-card";
  el.dataset.condition = info.cond;
  el.style.animationDelay = `${idx * 0.05}s`;
  el.id = `city-card-${city.name.replace(/\s+/g,"-")}`;
  el.innerHTML = `
    <div class="city-card-top">
      <div>
        <div class="city-name">${city.name}</div>
        <div class="city-country">${city.country}</div>
      </div>
      <div class="city-icon">${info.icon}</div>
    </div>
    <div class="city-temp">${displayTemp(c.temperature_2m)}</div>
    <div class="city-condition">${info.label}</div>
    <div class="city-meta">
      <span class="city-meta-item">💧 ${c.relativehumidity_2m}%</span>
      <span class="city-meta-item">💨 ${Math.round(c.windspeed_10m)} km/h</span>
      <span class="city-meta-item">🌡️ ${displayTemp(c.apparent_temperature)}</span>
    </div>`;
  el.addEventListener("click", () => openModal(city, data));
  return el;
}

// ---------- RENDER GRID ----------
function renderGrid() {
  const grid = document.getElementById("cities-grid");
  grid.innerHTML = "";
  WORLD_CITIES.forEach((city, idx) => {
    const data = weatherData[city.name];
    if (!data) {
      // skeleton
      const sk = document.createElement("div");
      sk.className = "city-card";
      sk.innerHTML = `<div class="skeleton" style="width:60%;height:18px;margin-bottom:10px"></div>
        <div class="skeleton" style="width:40%;height:14px;margin-bottom:16px"></div>
        <div class="skeleton" style="width:50%;height:36px;margin-bottom:8px"></div>
        <div class="skeleton" style="width:80%;height:12px"></div>`;
      grid.appendChild(sk);
    } else {
      grid.appendChild(renderCityCard(city, data, idx));
    }
  });
}

// ---------- UPDATE STATS BAR ----------
function updateStats() {
  const loaded = WORLD_CITIES.filter(c => weatherData[c.name]);
  if (!loaded.length) return;
  const byTemp = [...loaded].sort((a,b) => weatherData[b.name].current.temperature_2m - weatherData[a.name].current.temperature_2m);
  const byHumid = [...loaded].sort((a,b) => weatherData[b.name].current.relativehumidity_2m - weatherData[a.name].current.relativehumidity_2m);
  const byWind = [...loaded].sort((a,b) => weatherData[b.name].current.windspeed_10m - weatherData[a.name].current.windspeed_10m);
  document.getElementById("stat-hottest").textContent = `${byTemp[0].name} ${displayTemp(weatherData[byTemp[0].name].current.temperature_2m)}`;
  document.getElementById("stat-coldest").textContent = `${byTemp.at(-1).name} ${displayTemp(weatherData[byTemp.at(-1).name].current.temperature_2m)}`;
  document.getElementById("stat-rainiest").textContent = `${byHumid[0].name} ${byHumid[0] ? weatherData[byHumid[0].name].current.relativehumidity_2m + "%" : "–"}`;
  document.getElementById("stat-windiest").textContent = `${byWind[0].name} ${Math.round(weatherData[byWind[0].name].current.windspeed_10m)} km/h`;
}

// ---------- OPEN MODAL ----------
function openModal(city, data) {
  const c = data.current;
  const info = getWeatherInfo(c.weathercode);
  const modal = document.getElementById("detail-modal");
  const body = document.getElementById("modal-body");
  const insight = generateAIInsight(city, data);
  body.innerHTML = `
    <div class="modal-city-header">
      <div class="modal-icon">${info.icon}</div>
      <div>
        <div class="modal-city-name">${city.name}</div>
        <div class="modal-city-sub">${city.country} · ${info.label}</div>
      </div>
    </div>
    <div class="modal-temp-row">
      <div class="modal-temp-main">${displayTemp(c.temperature_2m)}</div>
      <div class="modal-temp-sub">Feels like ${displayTemp(c.apparent_temperature)}</div>
    </div>
    <div class="modal-grid">
      <div class="modal-stat"><div class="modal-stat-label">💧 Humidity</div><div class="modal-stat-value">${c.relativehumidity_2m}%</div></div>
      <div class="modal-stat"><div class="modal-stat-label">💨 Wind Speed</div><div class="modal-stat-value">${Math.round(c.windspeed_10m)} km/h</div></div>
      <div class="modal-stat"><div class="modal-stat-label">🧭 Wind Direction</div><div class="modal-stat-value">${windDirection(c.winddirection_10m)} (${c.winddirection_10m}°)</div></div>
      <div class="modal-stat"><div class="modal-stat-label">📊 Pressure</div><div class="modal-stat-value">${Math.round(c.surface_pressure)} hPa</div></div>
      <div class="modal-stat"><div class="modal-stat-label">🌞 UV Index</div><div class="modal-stat-value">${c.uv_index ?? "–"}</div></div>
      <div class="modal-stat"><div class="modal-stat-label">📍 Coordinates</div><div class="modal-stat-value">${city.lat.toFixed(2)}, ${city.lon.toFixed(2)}</div></div>
    </div>
    <div class="modal-ai-box">
      <div class="modal-ai-title">🤖 AI Weather Insight</div>
      <div class="modal-ai-text">${insight}</div>
    </div>`;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("detail-modal").classList.add("hidden");
  document.body.style.overflow = "";
}

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-backdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ---------- UNIT TOGGLE ----------
document.getElementById("unit-c").addEventListener("click", () => {
  isCelsius = true;
  document.getElementById("unit-c").classList.add("active");
  document.getElementById("unit-f").classList.remove("active");
  renderGrid();
  updateStats();
  if (featuredCity && weatherData[featuredCity.name]) renderFeaturedCard(featuredCity, weatherData[featuredCity.name]);
});
document.getElementById("unit-f").addEventListener("click", () => {
  isCelsius = false;
  document.getElementById("unit-f").classList.add("active");
  document.getElementById("unit-c").classList.remove("active");
  renderGrid();
  updateStats();
  if (featuredCity && weatherData[featuredCity.name]) renderFeaturedCard(featuredCity, weatherData[featuredCity.name]);
});

// ---------- SEARCH ----------
const searchInput = document.getElementById("city-search");
const suggestionsEl = document.getElementById("suggestions");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { suggestionsEl.classList.add("hidden"); return; }
  const matches = SEARCH_SUGGESTIONS.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
  if (!matches.length) { suggestionsEl.classList.add("hidden"); return; }
  suggestionsEl.innerHTML = matches.map(m =>
    `<div class="suggestion-item" data-city="${m}">🏙️ ${m}</div>`
  ).join("");
  suggestionsEl.classList.remove("hidden");
  suggestionsEl.querySelectorAll(".suggestion-item").forEach(el => {
    el.addEventListener("click", () => {
      searchInput.value = el.dataset.city;
      suggestionsEl.classList.add("hidden");
      searchCity(el.dataset.city);
    });
  });
});

document.addEventListener("click", e => {
  if (!e.target.closest(".search-container")) suggestionsEl.classList.add("hidden");
});

document.getElementById("search-btn").addEventListener("click", () => searchCity(searchInput.value.trim()));
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") searchCity(searchInput.value.trim()); });

async function searchCity(name) {
  if (!name) return;
  suggestionsEl.classList.add("hidden");
  // Check existing
  const existing = WORLD_CITIES.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    featuredCity = existing;
    const data = weatherData[existing.name];
    if (data) { renderFeaturedCard(existing, data); return; }
  }
  // Geocode via open-meteo geocoding
  try {
    document.getElementById("featured-card").innerHTML = `<div class="featured-loading"><div class="spinner"></div><p>Searching for ${name}…</p></div>`;
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results || !geoData.results.length) throw new Error("City not found");
    const r = geoData.results[0];
    const city = { name: r.name, country: `${r.country || ""}`, lat: r.latitude, lon: r.longitude };
    const data = await fetchWeather(city);
    data.current = data.current_weather ? data.current_weather : data.current;
    // normalize field names
    normalizeCurrentData(data);
    weatherData[city.name] = data;
    featuredCity = city;
    renderFeaturedCard(city, data);
  } catch(err) {
    document.getElementById("featured-card").innerHTML = `<div class="error-state"><div class="error-icon">😕</div><p>Could not find weather for "${name}"</p><button class="refresh-btn" onclick="loadAllWeather()">Try Again</button></div>`;
  }
}

function normalizeCurrentData(data) {
  // Open-Meteo returns `current` object with the requested fields
  if (!data.current) data.current = {};
  const c = data.current;
  if (!c.temperature_2m && data.current_weather) {
    c.temperature_2m = data.current_weather.temperature;
    c.weathercode = data.current_weather.weathercode;
    c.windspeed_10m = data.current_weather.windspeed;
    c.winddirection_10m = data.current_weather.winddirection;
    c.apparent_temperature = data.current_weather.temperature - 2;
    c.relativehumidity_2m = 60;
    c.surface_pressure = 1013;
    c.uv_index = 3;
  }
}

// ---------- LOAD ALL WEATHER ----------
async function loadAllWeather() {
  renderGrid(); // show skeletons
  // Load featured first
  try {
    const featData = await fetchWeather(featuredCity);
    weatherData[featuredCity.name] = featData;
    renderFeaturedCard(featuredCity, featData);
  } catch(e) {
    document.getElementById("featured-card").innerHTML = `<div class="error-state"><div class="error-icon">🌐</div><p>Failed to load weather. Check your connection.</p><button class="refresh-btn" onclick="loadAllWeather()">Retry</button></div>`;
  }
  // Load all others in batches of 4
  const others = WORLD_CITIES.filter(c => c.name !== featuredCity.name);
  for (let i = 0; i < others.length; i += 4) {
    const batch = others.slice(i, i + 4);
    await Promise.allSettled(batch.map(async city => {
      try {
        const data = await fetchWeather(city);
        weatherData[city.name] = data;
      } catch(e) { /* skip */ }
    }));
    renderGrid();
    updateStats();
  }
}

// ---------- AUTO REFRESH every 5 minutes ----------
setInterval(() => {
  weatherData = {};
  loadAllWeather();
}, 5 * 60 * 1000);

// ---------- INIT ----------
loadAllWeather();
