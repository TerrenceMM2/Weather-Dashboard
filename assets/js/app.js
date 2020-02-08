$(document).ready(function() {

    const apiKEY = "9f948945c2a7499da3eb43a912f67a23";

    let cityName;
    let date;
    let currentCondition;
    let temp;
    let humidity;
    let windSpeed;
    let uvIndex;

    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=Knoxville&appid=${apiKEY}`,
        method: "GET"
    }).then(response => {
        cityName = response.name;
        date = response.dt;
        currentCondition = response.weather[0].main;
        temp = calculateF(response.main.temp);
        humidity = response.main.humidity;
        windSpeed = response.wind.speed;

        console.log(response);
        console.log(cityName);
        console.log(date);
        console.log(moment().utc(date).format('h[:]mm A MMMM Do[,] YYYY'));
        console.log(currentCondition);
        console.log(temp);
        console.log(humidity);
        console.log(windSpeed);
    }).catch(error => {
        console.log(error);
    })

    const calculateF = (num) => {
        return (num - 273.15) * 9/5 + 32;
    }

});