const apiKey = "07227df6c4027047a660a37a085c1dbc";

// Retrieve the necessary HTML elements
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const cityNameDisplay = document.getElementById("city-name");
const tempDisplay = document.getElementById("temp");
const windDisplay = document.getElementById("wind");
const humidityDisplay = document.getElementById("humidity");
const searchHistoryList = document.getElementById("search-history");
const weatherIcon = document.getElementById("weatherIcon");
const mainDate = document.getElementById("mainDate");
const forecastContainer = document.getElementById("forecast-container");

// Add event listener to the search button
searchBtn.addEventListener("click", () => {
  const cityName = searchInput.value;

  // Call the geo API to get latitude and longitude of the city
  const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

  fetch(geoApiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const latitude = data[0].lat;
        const longitude = data[0].lon;
        console.log(data);

        // Call the one call API to get weather data
        const oneCallApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        // Call the one call API to get weather data
        fetch(oneCallApiUrl)
          .then((response) => response.json())
          .then((weatherData) => {
            const cityName = weatherData.city.name;
            const temperature = weatherData.list[0].main.temp;
            const humidity = weatherData.list[0].main.humidity;
            const windSpeed = weatherData.list[0].wind.speed;
            const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}@2x.png`;
            const date = dayjs(weatherData.list[0].dt_txt.split(" ")[0]).format(
              "DD MMM YYYY"
            );

            // Clear the search box
            searchInput.value = "";

            // Save the search to local storage only if it doesn't exist in the search history
            const searchHistory =
              JSON.parse(localStorage.getItem("searchHistory")) || [];
            if (!searchHistory.includes(cityName)) {
              searchHistory.push(cityName);
              localStorage.setItem(
                "searchHistory",
                JSON.stringify(searchHistory)
              );
            }

            // Update the weather information on the page
            cityNameDisplay.textContent = cityName;
            tempDisplay.textContent = temperature;
            windDisplay.textContent = windSpeed;
            humidityDisplay.textContent = humidity;
            mainDate.textContent = date;

            // Set the weather icon image source and alt attributes
            weatherIcon.src = weatherIconUrl;
            weatherIcon.alt = "Weather Icon";

            // Display search history as buttons
            renderSearchHistory(searchHistory);

            // Display the forecast for the next 5 days
            const forecastDays = [7, 15, 23, 31, 39];
            const forecastData = forecastDays.map((index) => ({
              date: weatherData.list[index].dt_txt.split(" ")[0], // Date in YYYY-MM-DD format
              temperature: weatherData.list[index].main.temp, // Temperature in Celsius
              humidity: weatherData.list[index].main.humidity, // Humidity in %
              windSpeed: weatherData.list[index].wind.speed, // Wind speed in KM/H
              weatherIcon: weatherData.list[index].weather[0].icon, // Weather icon code
            }));

            displayForecast(forecastData);
          })
          .catch((error) => {
            console.error("Error fetching weather data:", error);
          });
      }
    })
    .catch((error) => {
      console.error("Error fetching geo data:", error);
    });
});

// Function to render search history as buttons
function renderSearchHistory(searchHistory) {
  searchHistoryList.innerHTML = "";

  searchHistory.forEach((city) => {
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);

    const button = document.createElement("button");
    button.textContent = capitalizedCity;
    button.addEventListener("click", () => {
      searchInput.value = city;
      searchBtn.click();
    });

    const listItem = document.createElement("li");
    listItem.classList.add("bg-white"); // Add the bg-white class to the list item
    listItem.appendChild(button);

    searchHistoryList.appendChild(listItem);
  });
}

// Function to display the forecast for the next 5 day
function displayForecast(forecastData) {
  const forecastContainer = document.getElementById("forecast-container");
  forecastContainer.innerHTML = "";

  forecastData.forEach((forecast) => {
    const forecastItem = document.createElement("div");
    forecastItem.className =
      "forecast-item list-none bg-blue-300 border-2 border-blue-300 p-2 rounded-md";

    const forecastDate = document.createElement("li");
    forecastDate.className = "bg-blue-300";
    const date = dayjs(forecast.date).format("DD MMM YYYY");
    forecastDate.textContent = date;

    const forecastTemp = document.createElement("li");
    forecastTemp.className = "bg-blue-300";
    forecastTemp.textContent = `Temp: ${forecast.temperature}°C`;

    const forecastWind = document.createElement("li");
    forecastWind.className = "bg-blue-300";
    forecastWind.textContent = `Wind: ${forecast.windSpeed} KM/H`;

    const forecastHumidity = document.createElement("li");
    forecastHumidity.className = "bg-blue-300";
    forecastHumidity.textContent = `Humidity: ${forecast.humidity}%`;

    const forecastIcon = document.createElement("img");
    forecastIcon.className = "bg-blue-300";
    forecastIcon.src = `https://openweathermap.org/img/wn/${forecast.weatherIcon}.png`;
    forecastIcon.alt = "Forecast Icon";

    forecastItem.appendChild(forecastDate);
    forecastItem.appendChild(forecastIcon);
    forecastItem.appendChild(forecastTemp);
    forecastItem.appendChild(forecastWind);
    forecastItem.appendChild(forecastHumidity);

    forecastContainer.appendChild(forecastItem);
  });
}

// Load search history from local storage on page load
window.addEventListener("DOMContentLoaded", () => {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  renderSearchHistory(searchHistory);
});
