const weatherData = document.getElementById("weatherdata");
const weatherToday = document.getElementById("weather-today");
const weatherForecast = document.getElementById("weather-forecast");
const forecastDay = document.getElementById("forecastDay")
const forecastTemp = document.getElementById("forecastTemp")
const forecastIcon = document.getElementById('forecastIcon')
const dropdownCities = document.getElementById("dropdown-cities");

let userPosition
let currentCity;

const API_URL = "https://api.openweathermap.org/data/2.5/weather?q=cityname&units=metric&APPID=5caaaf25021b2d7aa4d206126b6a3351";
const API_LAT_LON = "https://api.openweathermap.org/data/2.5/weather?lat=[lat]&lon=[long]&units=metric&APPID=5caaaf25021b2d7aa4d206126b6a3351";
const API_Forecast = "https://api.openweathermap.org/data/2.5/forecast?q=cityname&units=metric&APPID=5caaaf25021b2d7aa4d206126b6a3351";
const API_Forecast_LAT_LON = "https://api.openweathermap.org/data/2.5/forecast?lat=[lat]&lon=[long]&units=metric&APPID=5caaaf25021b2d7aa4d206126b6a3351";

const getWeather = (url, callbackFunction) => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      callbackFunction(data);
    })
    .catch((error) => console.error("Error: ", error))
    .finally(() => console.log("Request done"));
}

const getForecastForCity = (callbackFunction) => getWeather(API_Forecast.replace("cityname", currentCity), callbackFunction);
const getForecastForLocation = (long, lat, callbackFunction) => getWeather(API_Forecast_LAT_LON.replace("[long]", long).replace("[lat]", lat), callbackFunction);

const getWeatherForLocation = (long, lat, callbackFunction) => getWeather(API_LAT_LON.replace("[long]", long).replace("[lat]", lat), callbackFunction);
const getWeatherForCity = (callbackFunction) => getWeather(API_URL.replace("cityname", currentCity), callbackFunction);


const renderWeather = (data) => {
  let now = new Date();
  now.setFullYear(2000, 1, 1);
  let sunrise = data.sys.sunrise;
  sunrise = new Date(sunrise * 1000);
  sunrise.setFullYear(2000, 1, 1);
  //          sunrise = sunrise.toLocaleTimeString([], { timeStyle: "short" });
  let sunset = data.sys.sunset;
  sunset = new Date(sunset * 1000);
  sunset.setFullYear(2000, 1, 1); //set time for specific day to compare hours and minutes
  //sunset = sunset.toLocaleTimeString([], { timeStyle: "short" });
  let isSunRise = sunrise.getHours >= now.getUTCHours() && sunrise.getMinutes() >= now.getUTCMinutes();
  weatherToday.innerHTML = `
      <div class="weather-container-div">
        <p id="temp-now">${data.main.temp.toFixed(1)}°C</p>
        <p id="city-now">${data.name}</p>
        <p id="weather-now">${data.weather[0].description}</p>
        <div class="sunrise-sunset">
          <span>sunrise</span>
          <span>${new Date((data.sys.sunrise + data.timezone) * 1000).toLocaleTimeString([], { timeStyle: "short" })}</span>
          <span>sunset</span>
          <span>${new Date((data.sys.sunset + data.timezone) * 1000).toLocaleTimeString([], { timeStyle: "short" })}</span>
        </div>
      </div>
      `; // toFixed(1) rounds the temp to one decimal
  // time
  temp = data.main.temp;
  if (temp >= 25 && temp <= 65) {
    if (sunrise) {
      weatherToday.style.background = "var(--hot)";
    } else {
      weatherToday.style.background = "var(--hotnight)";
      weatherToday.style.color = "var(--textcolornight)";
    }
  }
  if (temp >= 0 && temp <= 24) {
    if (sunset < now) {
      weatherToday.style.background = "var(--moderatenight)";

    } else {
      weatherToday.style.background = "var(--moderate)";
    }
  } if (temp >= -40 && temp <= -1) {
    if (sunrise) {
      weatherToday.style.background = "var(--cold)";
    } else {
      weatherToday.style.background = "var(--coldnight)";
    }
  }

}
const renderForecast = (forecast) => {
  const filteredForecast = forecast.list.filter(day =>
    day.dt_txt.includes("12:00")
  );
  weatherForecast.innerHTML=''
  filteredForecast.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const weekTemp = day.main.temp.toFixed(0);

    weatherForecast.innerHTML += `<p>${dayName}</p>
         <p>🌡️${weekTemp}°C</p>
        <p>Feels like ${day.main.feels_like.toFixed(1)}°C</p>
       <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"/>`
  });
}

const getDefaultCity = () => {

  let cities = document.querySelectorAll("[data-cityname]");

  return cities[0].dataset.cityname; //dataset is an object with all data attributes inside https://www.w3schools.com/tags/att_global_data.asp
};

const onCityChanged = (event) => {
  document.querySelector(".menu-btn").checked = false;

  console.log(event.target.dataset.cityname);
  currentCity = event.target.dataset.cityname;
  renderPage();
};

const setDefaults = () => {
  currentCity = getDefaultCity();
  renderPage();
}

const renderForCity = () => {
  getWeatherForCity(renderWeather);
  getForecastForCity(renderForecast);
}

const renderforLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const long = position.coords.longitude;

      getWeatherForLocation(long, lat, renderWeather);
      getForecastForLocation(long, lat, renderForecast);
    });
  } else {
    //render for city
    let cities = document.querySelectorAll("[data-cityname]");
    currentCity = cities.filter(city => city != "location")[0];
    renderPage();
  }
}

const initializeCitySelector = () => {
  console.log("begin initializeCitySelector");
  let cities = document.querySelectorAll("[data-cityname]");
  cities.forEach((element) => {
    console.log("adding event listener");
    element.addEventListener("click", onCityChanged);
  });
  console.log("finished initializeCitySelector");
};

const renderPage = () => {
  if (currentCity == 'location') {
    renderforLocation();
  } else {
    renderForCity();
  }
}

initializeCitySelector();
setDefaults();

renderPage();

// const getData = () => {
//   //made global function so we can call from different areas in the code

//   fetch(API_URL.replace("cityname", currentCity))
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//       let now = new Date();
//       now.setFullYear(2000, 1, 1);
//       let sunrise = data.sys.sunrise;
//       sunrise = new Date(sunrise * 1000);
//       sunrise.setFullYear(2000, 1, 1);
//       //          sunrise = sunrise.toLocaleTimeString([], { timeStyle: "short" });
//       let sunset = data.sys.sunset;
//       sunset = new Date(sunset * 1000);
//       sunset.setFullYear(2000, 1, 1); //set time for specific day to compare hours and minutes
//       //sunset = sunset.toLocaleTimeString([], { timeStyle: "short" });
//       let isSunRise = sunrise.getHours >= now.getUTCHours() && sunrise.getMinutes() >= now.getUTCMinutes();
//       weatherToday.innerHTML = `
//       <div class="weather-container-div">
//         <p id="temp-now">${data.main.temp.toFixed(1)}°C</p>
//         <p id="city-now">${data.name}</p>
//         <p id="weather-now">${data.weather[0].description}</p>
//         <div class="sunrise-sunset">
//           <span>sunrise</span>
//           <span>${new Date((data.sys.sunrise + data.timezone) * 1000).toLocaleTimeString([], { timeStyle: "short" })}</span>
//           <span>sunset</span>
//           <span>${new Date((data.sys.sunset + data.timezone) * 1000).toLocaleTimeString([], { timeStyle: "short" })}</span>
//         </div>
//       </div>
//       `; // toFixed(1) rounds the temp to one decimal
//       // time
//       temp = data.main.temp;
//       if (temp >= 25 && temp <= 65) {
//         if (sunrise) {
//           weatherToday.style.background = "var(--hot)";
//         } else {
//           weatherToday.style.background = "var(--hotnight)";
//           weatherToday.style.color = "var(--textcolornight)";
//         }
//       }
//       if (temp >= 0 && temp <= 24) {
//         if (sunset < now) {
//           weatherToday.style.background = "var(--moderatenight)";

//         } else {
//           weatherToday.style.background = "var(--moderate)";
//         }
//       } if (temp >= -40 && temp <= -1) {
//         if (sunrise) {
//           weatherToday.style.background = "var(--cold)";
//         } else {
//           weatherToday.style.background = "var(--coldnight)";
//         }
//       }
//     })
//     .catch((error) => console.error("Error: ", error))
//     .finally(() => console.log("Request done"));



//   // fetch(API_FORCAST)
//   // 	.then((res) => res.json())
//   // 	.then((forecast) => {
//   // 		const forecastDay = forecast.list.filter((day) =>
//   // 			day.dt_txt.includes("12:00")
//   // 		);


//   // // <h3>${day.dt_txt}</h3> This should be changed to show just the weekday (like Monday, Tuesday...)   
//   // 		forecastDay.forEach((day) => {
//   // 			weatherForecast.innerHTML += `
//   //       <h3>${day.dt_txt}</h3>
//   //       <p>🌡️${day.main.temp.toFixed(1)}°C</p> 
//   // 	    <p>Feels like: ${day.main.feels_like.toFixed(1)}°C</p> 
//   //       <p>Weather: ${day.weather[0].description}</p>
//   //     `;
//   // 		});
//   // 	})
//   // 	.catch((error) => console.error("Error: ", error))
//   // 	.finally(() => console.log("Request done"));


//   fetch(API_Forecast.replace('cityname', currentCity))
//     .then((res) => res.json())
//     .then((forecast) => {
//       const filteredForecast = forecast.list.filter(day =>
//         day.dt_txt.includes("12:00")
//       );
//       filteredForecast.forEach(day => {
//         const date = new Date(day.dt * 1000);
//         const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
//         const weekTemp = day.main.temp.toFixed(0);

//         weatherForecast.innerHTML += `<p>${dayName}</p>
//              <p>🌡️${weekTemp}°C</p>
//             <p>Feels like ${day.main.feels_like.toFixed(1)}°C</p>
//            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"/>`
//       });
//     });

//   // fetch(API_FORCAST.replace('cityname', currentCity))
//   //   .then((res) => res.json())
//   //   .then((forecast) => {
//   //     const forecastDay = forecast.list.filter((day) =>
//   //       day.dt_txt.includes("12:00")
//   //     );


//   // https://stackoverflow.com/questions/24998624/day-name-from-date-in-js/24998705 autohor iamnox  
//   //     weatherForecast.innerHTML = ''
//   //     forecastDay.forEach((day) => {
//   //       weatherForecast.innerHTML += `
//   //     <h3>${new Date(day.dt*1000).toLocaleDateString('en-us',{weekday:'long'})}</h3> 
//   //     <p>🌡️${day.main.temp.toFixed(1)}°C</p> 
//   //     <p>Feels like: ${day.main.feels_like.toFixed(1)}°C</p> 
//   //     <p>Weather: ${day.weather[0].description}</p>
//   //   `;
//   //     });
//   //   })
//   //   .catch((error) => console.error("Error: ", error))
//   //   .finally(() => console.log("Request done"));


// }
// const handleWeatherApiResponse = (forecastForCity) => {
//   console.log(forecastForCity);
//   //copied other template so we see changes in live in chrome. we can remove this when we merge and add getForecastForCity and the API.
//   weatherToday.innerHTML = `
//   <p>City: ${forecastForCity.name}</p>
//   <p>Temp: ${forecastForCity.main.temp.toFixed(1)}°C</p>
//   <p>Weather: ${forecastForCity.weather[0].description}</p>
//   `;
// };


// const getForecastForCity = (cityName, callbackFunction) => {
//   fetch(
//     `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=5caaaf25021b2d7aa4d206126b6a3351`
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       callbackFunction(data);
//     })
//     .catch((error) => console.error("Error: ", error))
//     .finally(() => console.log("Request done"));
// };
// const getLocation = () => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(showPosition);
//   } else {
//     alert("Geolocation is not supported by this browser");
//   }
// };
// const showPosition = (position) => {
//   userPosition = {
//     latitude: position.coords.latitude,
//     longitude: position.coords.longitude,
//   };
//   console.log(
//     "lat",
//     position.coords.latitude,
//     "long",
//     position.coords.longitude
//   );
// };
// initializeCitySelector();
// let currentCity = getDefaultCity(); //a function to get default city
// getData();