enum Weather {
    Rainy,
    Sunny,
    Snowy
}
function checkDriverStatus(speed: number, weather: Weather) {
switch (true) {
    case (speed >= 100 && (weather === Weather.Rainy || weather === Weather.Snowy)):
        console.log("Too fast and slippery!");
        break; 
    case (speed >= 100 && weather === Weather.Sunny):
        console.log("Too fast!");
        break;
    case (speed <= 60 && (weather === Weather.Rainy || weather === Weather.Snowy)):
        console.log("Beware of the rain");
        break; 
    case (speed <= 60 && weather === Weather.Sunny):
        console.log("Too Slow");
        break;
    case (speed >= 60 && speed <= 100):
        console.log("Cruising at a normal speed.");
        break;
    default:
        console.log("Speed is in an undefined range.");
    }
}
checkDriverStatus(70, Weather.Rainy);
checkDriverStatus(120, Weather.Sunny);
checkDriverStatus(100, Weather.Snowy);