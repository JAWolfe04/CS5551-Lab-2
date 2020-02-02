$(function(){
    //$("#city").val("Kansas City");
    //$("#country").val("US");

    $("#searchBtn").click(function(){
        $.get("http://api.openweathermap.org/data/2.5/forecast?q=" + $("#city").val() +
            "," + $("#country").val() +"&units=imperial&APPID=fc52e8acb25601f279518cf1b7df54fc",
            function( data ) { drawCanvas(data.city.name + ", " + data.city.country, data.list); }, "json" );
    });

    function drawCanvas(location, hourly) {
        let canvas = document.getElementById("weatherCanvas");
        let canvasContext = canvas.getContext("2d");
        let rightColX = 500;
        let secondRowY = 75;
        let thirdRowY = secondRowY + 60;
        let bottomRowY = 500;

        let canvasWidth = rightColX * 1.75;
        canvas.setAttribute("width", canvasWidth.toString());
        let canvasHeight = bottomRowY + 25;
        canvas.setAttribute("height", canvasHeight.toString());

        canvasContext.font = "35px Arial";
        canvasContext.fillText(location, 0, 35);

        let curWeatherImg = new Image();
        curWeatherImg.src = "https://openweathermap.org/img/wn/" + hourly[0].weather[0].icon + "@2x.png";

        curWeatherImg.onload = function() {
            canvasContext.drawImage(curWeatherImg, -15, secondRowY - 20);

            canvasContext.font = "50px Arial";
            canvasContext.fillText(parseFloat(hourly[0].main.temp).toFixed(0) + "°F",
                curWeatherImg.width, 50 + secondRowY);

            canvasContext.font = "25px Arial";
            canvasContext.fillText(hourly[0].weather[0].main, 5, thirdRowY + 25);

            canvasContext.font = "25px Arial";
            canvasContext.fillText("Feels like " + parseFloat(hourly[0].main.feels_like).toFixed(0)
                + "°F", rightColX, secondRowY + 25);

            canvasContext.font = "25px Arial";
            canvasContext.fillText("Humidity " + hourly[0].main.humidity + "%", rightColX, secondRowY + 50 + 10);

            canvasContext.font = "25px Arial";
            canvasContext.fillText("Wind " + parseFloat(hourly[0].wind.speed).toFixed(0) +
                " mph", rightColX, secondRowY + 75 + 20);

            let tempArray = [];
            for (let i = 1; i < 9; ++i)
                tempArray.push(parseFloat(hourly[i].main.temp).toFixed(0));
            let lowTemp = Math.min(...tempArray);
            let tempMulti = 150 / (Math.max(...tempArray) - lowTemp);
            let displayLow = bottomRowY - 125;

            for (let i = 1; i < 9; ++i) {
                let hourTemp = tempArray[i - 1];
                let hourTempTop = displayLow - ((hourTemp - lowTemp) * tempMulti);
                canvasContext.beginPath();
                canvasContext.moveTo((i - 1) * 100 + 13, bottomRowY - 100);
                canvasContext.lineTo((i - 1) * 100 + 13, hourTempTop);
                canvasContext.lineTo(((i - 1) * 100) + 38, hourTempTop);
                canvasContext.lineTo(((i - 1) * 100) + 38, bottomRowY - 100);
                canvasContext.closePath();
                canvasContext.stroke();
                canvasContext.fillStyle = hourTemp > 45 ? "rgb(255, 150, 0)" : "rgb(0, 150, 255)";
                canvasContext.fill();
                canvasContext.fillStyle = "black";

                let hourTime = new Date(parseInt(hourly[i].dt) * 1000);
                canvasContext.fillText(hourTime.toLocaleString("en-US",
                    {hour:'numeric', hour12:true}), (i - 1) * 100, bottomRowY - 75);

                let hourWeatherImg = new Image();
                hourWeatherImg.src = "https://openweathermap.org/img/wn/" + hourly[i].weather[0].icon + ".png";
                hourWeatherImg.onload = function() { canvasContext.drawImage(hourWeatherImg,
                    (i - 1) * 100, bottomRowY - 75); };

                canvasContext.fillText(hourTemp + "°F", (i - 1) * 100, bottomRowY);
            }
        };
    };
});