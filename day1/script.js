let speed = 70;
let isRaining = true;

// if (speed >= 100 && isRaining === true) {
//     console.log("Too fast and slippery!");
// } else if (speed >= 100 && isRaining === false) {
//     console.log("Too fast!");
// } else if (speed <= 60 && isRaining === true) {
//     console.log("Beware of the rain");
// } else if (speed <= 60 && isRaining === false) {
//     console.log("Too Slow");
// }
// else if (speed >= 60 && speed <= 100) {
//     console.log("Cruising at a normal speed.");
// }

switch (true) {
    case (speed >= 100 && isRaining === true):
        console.log("Too fast and slippery!");
        break; 
    case (speed >= 100 && isRaining === false):
        console.log("Too fast!");
        break;
    case (speed <= 60 && isRaining === true):
        console.log("Beware of the rain");
        break; 
    case (speed <= 60 && isRaining === false):
        console.log("Too Slow");
        break;
    case (speed >= 60 && speed <= 100):
        console.log("Cruising at a normal speed.");
        break;
    default:
        console.log("Speed is in an undefined range.");
    }