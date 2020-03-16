$(document).ready(function () {

    const apiKEY = "9f948945c2a7499da3eb43a912f67a23";

    let cityName;
    let cityId;
    let date;
    let currentCondition;
    let icon;
    let temp;
    let humidity;
    let windSpeed;
    let lat;
    let lon;
    let uvIndex;

    let cities = [];
    
    if (localStorage.getItem("savedCities") != null) {
        cities = JSON.parse(localStorage.getItem("savedCities"));
    }

    let lastCity = cities[cities.length - 1];

    $("form").on("submit", (event) => {
        event.preventDefault();
        $(".container").empty();
        let city = $("input").val();
        getWeather(city);
        addToList(city);
        setLocalStorage(cities);
        $("input").val("");
    });

    $("#menu").on("click", ".dropdown-item", (event) => {
        $(".container").empty();
        let savedCity = event.target.text;
        getWeather(savedCity);
    });

    // @GET - OpenWeatherMap - Current Weather API
    const getWeather = (city) => {
        if (city === undefined) {
            return;
        }
        
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKEY}`,
            method: "GET"
        }).then(response => {
            cityName = response.name;
            cityId = response.id;
            date = moment().utc(response.dt).format('M[.]D[.]YY');
            currentCondition = response.weather[0].main;
            icon = response.weather[0].icon;
            temp = calculateF(response.main.temp);
            humidity = response.main.humidity;
            windSpeed = response.wind.speed;
            lat = response.coord.lat;
            lon = response.coord.lon;

            // @GET - OpenWeatherMap - UV API
            $.ajax({
                url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKEY}&lat=${lat}&lon=${lon}`,
                method: "GET"
            }).then(response => {
                uvIndex = response.value;
                currentDisplay(icon);
            }).catch(error => {
                errorModal(error);
            });

            // @GET - OpenWeatherMap - 5 day / 3 hour API
            $.ajax({
                url: `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKEY}&lat=${lat}&lon=${lon}`,
                method: "GET"
            }).then(response => {
                response.list.forEach(result => {
                    if (result.dt_txt.includes("18:00")) {
                        futureDisplay(result);
                    }
                });
            }).catch(error => {
                errorModal(error);
            });
        }).catch(error => {
            errorModal(error);
        });
    };

    const historyMenu = () => {
        for (var i = 0; i < cities.length; i++) {
            const menuItem = $("<a>").addClass("dropdown-item").attr("data-city", cities[i]).text(cities[i]);
            $("#menu").append(menuItem);
        }
    };

    //
    const addToList = (str) => {
        cities.push(str);
        $("#menu").empty();
        historyMenu();
    };

    const setLocalStorage = (arr) => {
        localStorage.clear("savedCities");
        localStorage.setItem("savedCities", JSON.stringify(arr));
    }

    // Calculates and returns formatted time
    const calculateTime = (num) => {
        let local = moment.unix(num);
        return moment(local).format('dddd [-] M[.]D[.]YY [\n] h[:]mm A ')
    };

    // Calculates Fahrenheit
    const calculateF = (num) => {
        let fahrenheit = (num - 273.15) * 9 / 5 + 32;
        return fahrenheit.toFixed(0);
    };

    // Displays current weather conditions
    const currentDisplay = (str) => {
        const currentContainer = $("<div>").addClass("card mb-3");
        const currentHeader = $("<div>").addClass("card-header").text(`Current Conditions: ${date}`);
        const currentBody = $("<div>").addClass("card-body")
        const displayCity = $("<h2>").addClass("card-title").text(cityName);
        const displayTemp = $("<p>").addClass("card-text").text(`Temperature: ${temp}${String.fromCharCode(176)} F`);
        const displayHumidity = $("<p>").addClass("card-text").text(`Humidity: ${humidity}%`);
        const displayWindSpeed = $("<p>").addClass("card-text").text(`Wind Speed: ${windSpeed} MPH`);
        const uvSpan = uvDisplay(uvIndex);
        const displayUV = $("<p>").addClass("card-text").text("UV Index: ");
        const icon = $("<img>").attr("src", `https://openweathermap.org/img/wn/${str}@2x.png`).addClass("current-icon");
        displayUV.append(uvSpan);
        currentBody.append(displayCity, icon, displayTemp, displayHumidity, displayWindSpeed, displayUV);
        currentContainer.append(currentHeader, currentBody);
        $("#current-display").append(currentContainer);
    };

    const uvDisplay = (str) => {
        if (str <= 4) {
            return $("<span>").addClass("uv bg-success").text(str);
        } else if (str > 4 && str < 8) {
            return $("<span>").addClass("uv bg-warning").text(str);
        } else {
            return $("<span>").addClass("uv bg-danger").text(str);
        }
    };

    // Displays 5-day forcast
    const futureDisplay = (obj) => {
        const currentContainer = $("<div>").addClass("card mb-3 future");
        const currentHeader = $("<div>").addClass("card-header").text(`${calculateTime(obj.dt)}`);
        const currentBody = $("<div>").addClass("card-body")
        const displayTemp = $("<p>").addClass("card-text").text(`Temperature: ${calculateF(obj.main.temp)}${String.fromCharCode(176)} F`);
        const displayHumidity = $("<p>").addClass("card-text").text(`Humidity: ${obj.main.humidity}%`);
        const icon = $("<img>").attr("src", `https://openweathermap.org/img/wn/${obj.weather[0].icon}@2x.png`).addClass("icon");
        currentBody.append(icon, displayTemp, displayHumidity);
        currentContainer.append(currentHeader, currentBody);
        $("#future-display").append(currentContainer);
    };

    // Displays Error modal if enter city is not valid
    const errorModal = (error) => {
        $("#error-modal").modal("show");
        $(".modal-title").append(error.status);
        $(".modal-body > p").text(error.statusText)
    }

    historyMenu();
    getWeather(lastCity);
});