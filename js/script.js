const apiKey = "07227df6c4027047a660a37a085c1dbc";

// Function to convert city name to coordinates
function convertCityToCoordinates(cityName, stateCode = "", countryCode = "") {
  const limit = 1;

  const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=${limit}&appid=${apiKey}`;

  return fetch(geoApiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const latitude = data[0].lat;
        const longitude = data[0].lon;

        return { latitude, longitude };
      } else {
        throw new Error("No results found for the given city.");
      }
    });
}

// Function to fetch weather data
function fetchWeatherData(latitude, longitude) {
  const oneCallApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

  return fetch(oneCallApiUrl)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

// Function to store search history in local storage
function storeSearchHistory(city) {
  let searchHistory = localStorage.getItem("searchHistory") || "[]";
  searchHistory = JSON.parse(searchHistory);

  if (!searchHistory.includes(city)) {
    searchHistory.unshift(city); // Add city to the beginning of the array
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }
}

// Function to display search history on the HTML
function displaySearchHistory() {
  const searchHistory = localStorage.getItem("searchHistory");
  const searchHistoryList = document.getElementById("search-history");

  if (searchHistory) {
    const searchHistoryArray = JSON.parse(searchHistory);
    searchHistoryList.innerHTML = "";

    searchHistoryArray.forEach((city) => {
      const listItem = document.createElement("li");
      listItem.textContent = city;
      searchHistoryList.appendChild(listItem);

      // Add event listener to each search history item
      listItem.addEventListener("click", function () {
        searchWeather(city);
      });
    });
  }
}

// Function to search weather for a city
function searchWeather(city) {
  convertCityToCoordinates(city)
    .then((coordinates) => {
      const latitude = coordinates.latitude;
      const longitude = coordinates.longitude;

      return fetchWeatherData(latitude, longitude);
    })
    .then((weatherData) => {
      const temperature = Math.round(weatherData.current.temp - 273.15); // Convert temperature to Celsius
      const windSpeed = weatherData.current.wind_speed;
      const humidity = weatherData.current.humidity;

      document.getElementById("city").textContent = city;
      document.getElementById("temp").querySelector("span").textContent =
        temperature;
      document.getElementById("wind").querySelector("span").textContent =
        windSpeed;
      document.getElementById("humidity").querySelector("span").textContent =
        humidity;

      storeSearchHistory(city);
      displaySearchHistory();
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

document.querySelector(".cities").addEventListener("submit", function (e) {
  e.preventDefault();
  const searchInput = document.querySelector('input[name="search"]');
  const city = searchInput.value;

  searchWeather(city);

  searchInput.value = ""; // Clear the input field
});

// Display search history when the page loads
document.addEventListener("DOMContentLoaded", displaySearchHistory);
