//-----------------------------------------------------------------------------------------------------------------
// CS 5551
// Lab 2
// Jonathan Wolfe
// Bill Yerkes
// Create a single page application using bootstrap framework
// 1. The page should have two text fields that takes state code for example: MO or city name: Kansas City.
// 2. Pass those values and display weather details of the city like temperature, wind, pressure, humidity etc.
// 3. Also display the hourly forecast (any 2-3 details from the API) for 5 hours in the city entered
//
// For Reference: https://openweathermap.org/api/hourly-forecast
//-----------------------------------------------------------------------------------------------------------------


//Be sure the page is loaded before setting event handlers
$(function(){
    //-----------------------------------------------------------------------------------------------------------------
    //  Search Button:
    //
    //  Invoke the create weather display function
    //  Process the request to get the weather for the given city and state
    //  Convert the city and state to a zip code, use the zip code to determine the weather at that loction
    //-----------------------------------------------------------------------------------------------------------------
    $("#searchBtn").click(createWeatherDisplay);
});

//-----------------------------------------------------------------------------------------------------------------
//  createWeatherDisplay:
//
// Input:
//  City [text box]
//  State [text box]
//
// Output
//  Current weather for the given city
//  Weather for forcast for the next 24 hrs
//-----------------------------------------------------------------------------------------------------------------

function createWeatherDisplay() {
    // Init Variables
    let zipcode = 0;
    let canvas = document.getElementById("weatherCanvas");
    let graphStart = 0;

    //Resize canvas
    let canvasWidth = 800;
    let canvasHeight = 525;
    canvas.setAttribute("width", canvasWidth.toString());
    canvas.setAttribute("height", canvasHeight.toString());

    // Get the a zip code for the city/state entered, to use to determine the weather.
    // Calls are nested because each call is dependent on the previous results, if
    // one fails the next should not proceed
    $.get("http://www.zipcodeapi.com/rest/js-nug0wEQ89nSjXIoOJ1FG6VJFf2j7u30ZQUC5MlwdDj9DKHz8FBXiw9sPmk2uJW7r/city-zips.json/"
        + $("#city").val() + "/" + $("#state").val(),
        function( data ) {
            zipcode = data.zip_codes[0];
        }, "json" )
        .fail(errorAlert)
        .done(function(){
            //Load and draw current weather info for the computed zip code
            $.get("http://api.openweathermap.org/data/2.5/weather?zip=" + zipcode +
                ",US&units=imperial&APPID=fc52e8acb25601f279518cf1b7df54fc",
                function( data ) {
                    graphStart = drawCurrentWeather(canvas, data);
                }, "json" )
                .fail(errorAlert)
                .done(function(){
                    //Load and draw next 24 hour forecast
                    $.get("http://api.openweathermap.org/data/2.5/forecast?zip=" + zipcode +
                        ",US&units=imperial&APPID=fc52e8acb25601f279518cf1b7df54fc",
                        function( data ) {
                            drawForecast(canvas, data.list, graphStart);
                        }, "json" )
                        //Error check in the event the connection is lost between
                        // making the second api call or another unexpected error
                        .fail(errorAlert);
                });
        });
}

//-----------------------------------------------------------------------------------------------------------------
//  errorAlert:
//
//  If the api call is not able to find the city/state entered display a message to the user.
//-----------------------------------------------------------------------------------------------------------------

function errorAlert(xhr) {
    alert(xhr.readyState == 4 ? "Unable to find entered city" : "Unable to connect");
}

//-----------------------------------------------------------------------------------------------------------------
//  drawCurrentWeather:
//
// Input:
//  canvas         Area to display information
//  curWeather     Data about the weather
//
// Output
//  Display information about the current weather situation for the given city/state
//-----------------------------------------------------------------------------------------------------------------

function drawCurrentWeather(canvas, curWeather) {
    // initialize variables
    let locFontSize = 35;
    let tempFontSize = 50;
    let defaultFontSize = 25;
    let iconHalfSize = 50;
    let rightColX = 500;
    let spaceSize = 5;
    let topMargin = 10;
    let secondRowY = locFontSize + tempFontSize + topMargin;
    let secRowSecColY = locFontSize + defaultFontSize + topMargin;
    let thirdRowY = secondRowY + defaultFontSize + spaceSize;

    let context = canvas.getContext("2d");

    context.font = locFontSize +"px Arial";
    context.fillText(curWeather.name + ", " + $("#state").val(), 0, locFontSize);

    let curWeatherImg = new Image();
    curWeatherImg.src = "https://openweathermap.org/img/wn/" + curWeather.weather[0].icon + "@2x.png";
    curWeatherImg.onload = function() {
        // Tweaked image position for it to look centered
        context.drawImage(curWeatherImg, -15, secondRowY - iconHalfSize - 20);

        context.font = tempFontSize + "px Arial";
        context.fillText(parseFloat(curWeather.main.temp).toFixed(0) + "°F",
            curWeatherImg.width, secondRowY);
    }

    context.font = defaultFontSize + "px Arial";
    context.fillText(curWeather.weather[0].main, 5, thirdRowY);

    context.fillText("Feels like " + parseFloat(curWeather.main.feels_like).toFixed(0)
        + "°F", rightColX, secRowSecColY);

    context.fillText("Humidity " + curWeather.main.humidity + "%", rightColX,
        secRowSecColY + defaultFontSize + spaceSize);

    context.fillText("Wind " + parseFloat(curWeather.wind.speed).toFixed(0) +
        " mph", rightColX, secRowSecColY + (defaultFontSize +  spaceSize) * 2);

    // Find the point where the graph should start
    // and pass it to the next drawForecast
    let leftBottom = thirdRowY;
    let rightBottom = secRowSecColY + (defaultFontSize +  spaceSize) * 2;
    return leftBottom > rightBottom ? leftBottom : rightBottom;
};

//-----------------------------------------------------------------------------------------------------------------
//  drawForecast:
//
// Input:
//  canvas         Area to display information
//  hourly         Data about the hourly weather forcast
//  graphTopY      Location as to where to start displaying the forcast information
//
// Output
//  Weather for forcast for the next 24 hrs
//-----------------------------------------------------------------------------------------------------------------

function drawForecast(canvas, hourly, graphTopY) {
    let context = canvas.getContext("2d");
    let hourlyWidthSpace = 100;
    let graphBottomY = canvas.height - 100;
    let timeBottomY = canvas.height - 75;
    let hourlyTempY = canvas.height;
    // graphMargins is the minimum height of the lowest
    // temp and the buffer from the top of the graph
    let graphMargins = 25;
    let barLeft = 13;
    let barRight = barLeft + 25;

    //Create temperature array to calculate height limits of bar graph
    let tempArray = [];
    for (let i = 0; i < 8; ++i)
        tempArray.push(parseFloat(hourly[i].main.temp).toFixed(0));
    let lowestTemp = Math.min(...tempArray);
    //tempMulti is the percent of the graph's height that each temp is multiplied
    let tempMulti = (graphTopY + 10 + graphMargins) / (Math.max(...tempArray) - lowestTemp);

    for (let i = 0; i < 8; ++i) {
        let hourTemp = tempArray[i];
        let barHeight = (hourTemp - lowestTemp) * tempMulti;
        // From the bottom of the graph, remove the minimum margin
        // then remove the bar height to find the top of each bar
        let hourTempTop = (graphBottomY - graphMargins) - barHeight;
        context.beginPath();
        context.moveTo((i * hourlyWidthSpace) + barLeft, graphBottomY);
        context.lineTo((i * hourlyWidthSpace) + barLeft, hourTempTop);
        context.lineTo((i * hourlyWidthSpace) + barRight, hourTempTop);
        context.lineTo((i * hourlyWidthSpace) + barRight, graphBottomY);
        context.closePath();
        context.stroke();
        //Using 45 as a midpoint for temperature where less than 45 degrees is cold/blue
        //and above is warm/orange
        context.fillStyle = hourTemp > 45 ? "rgb(255, 150, 0)" : "rgb(0, 150, 255)";
        context.fill();

        //Return text to default black color
        context.fillStyle = "black";

        //Time in the json is in unix epoch in seconds and must be converted to milliseconds
        let hourTime = new Date(parseInt(hourly[i].dt) * 1000);
        context.font = "25px Arial";
        context.fillText(hourTime.toLocaleString("en-US",
            {hour:'numeric', hour12:true}), i * hourlyWidthSpace, timeBottomY);

        let hourWeatherImg = new Image();
        hourWeatherImg.src = "https://openweathermap.org/img/wn/" + hourly[i].weather[0].icon + ".png";
        hourWeatherImg.onload = function() { context.drawImage(hourWeatherImg,
            i * hourlyWidthSpace, timeBottomY); };

        context.fillText(hourTemp + "°F", i * hourlyWidthSpace, hourlyTempY);
    }
};
