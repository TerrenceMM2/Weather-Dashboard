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
    let futureCast = [];
    let iconArray = [];

    $("form").on("submit", (event) => {
        event.preventDefault();
        $(".container").empty();
        let city = $("input").val();
        getWeather(city);
        $("input").val("");
    });

    $("#menu").on("click", ".dropdown-item", (event) => {
        $(".container").empty();
        let savedCity = event.target.text;
        getWeather(savedCity);
    })

    // @GET - OpenWeatherMap - Current Weather API
    const getWeather = (city) => {
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKEY}`,
            method: "GET"
        }).then(response => {
            cityName = response.name;
            cityId = response.id;
            date = moment().utc(response.dt).format('h[:]mm A MMMM Do[,] YYYY');
            currentCondition = response.weather[0].main;
            icon = response.weather[0].icon;
            temp = calculateF(response.main.temp);
            humidity = response.main.humidity;
            windSpeed = response.wind.speed;
            lat = response.coord.lat;
            lon = response.coord.lon;

            addToList(city);

            // @GET - OpenWeatherMap - UV API
            $.ajax({
                url: `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKEY}&lat=${lat}&lon=${lon}`,
                method: "GET"
            }).then(response => {
                uvIndex = response.value
            }).catch(error => {
                console.log(error);
            });

            // @GET - OpenWeatherMap - 5 day / 3 hour API
            $.ajax({
                url: `http://api.openweathermap.org/data/2.5/forecast?appid=${apiKEY}&lat=${lat}&lon=${lon}`,
                method: "GET"
            }).then(response => {
                response.list.forEach(result => {
                    if (result.dt_txt.includes("12:00")) {
                        futureCast.push(result);
                    }
                });

            currentDisplay(icon);

            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            console.log(error);
        });
    };

    const addToList = (str) => {
        const menuItem = $("<a>").addClass("dropdown-item").attr("data-city", str).text(str);
        $("#menu").append(menuItem);
    }

    const calculateTime = (num) => {
        console.log(num)
        return moment().utc(num).format('h[:]mm A MMMM Do[,] YYYY')
    }

    const calculateF = (num) => {
        let fahrenheit = (num - 273.15) * 9 / 5 + 32;
        return fahrenheit.toFixed(0);
    }

    const currentDisplay = (str) => {
        const currentContainer = $("<div>").addClass("card mb-3");
        const currentHeader = $("<div>").addClass("card-header").text("Current Conditions");
        const currentBody = $("<div>").addClass("card-body")
        const displayCity = $("<h2>").addClass("card-title").text(cityName);
        const displayTemp = $("<p>").addClass("card-text").text(`Temperature: ${temp}${String.fromCharCode(176)} F`);
        const displayHumidity = $("<p>").addClass("card-text").text(`Humidity: ${humidity}%`);
        const displayWindSpeed = $("<p>").addClass("card-text").text(`Wind Speed: ${windSpeed} MPH`);
        const displayUV = $("<p>").addClass("card-text").text(`UV Index: ${uvIndex}`);
        const icon = $("<img>").attr("src", `http://openweathermap.org/img/wn/${str}@2x.png`).addClass("icon");
        currentBody.append(displayCity, icon, displayTemp, displayHumidity, displayWindSpeed, displayUV);
        currentContainer.append(currentHeader, currentBody)
        $(".container").append(currentContainer)
    };

    const futureDisplay = () => {

    };

});