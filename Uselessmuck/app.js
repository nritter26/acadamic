// let score = Number(prompt("What is your score (0-100)?"));
// // Keep asking while the number is too high OR too low
// while (score > 100 || score < 0 || isNaN(score)) {
//   score = Number(prompt("Invalid! Please enter a score between 0 and 100:"));
// }

// console.log("Accepted score:", score);
// console.log ("-----------------------")
// if (score >= 80) {
//     document.getElementById("result") .innerHTML = "A"
//     document.getElementById("message").innerHTML = "Godlike"
// }
// else if (score >= 70) {
//     document.getElementById("result") .innerHTML = "B"
//     document.getElementById("message").innerHTML = "Toptier doe"

// }
// else if (score >= 60) {
//     document.getElementById("result") .innerHTML = "C"
//     document.getElementById("message").innerHTML = "You can do better"

// }
// else if (score >= 50) {
//     document.getElementById("result") .innerHTML = "D"
//     document.getElementById("message").innerHTML = "Dog water"
// } 
// else {
//     document.getElementById("result") .innerHTML = "F"
//     document.getElementById("message").innerHTML = "Bro need help like asap"
// }

// const user = { name: 'Alice', age: 25 };
// for (let key in user) {
//   console.log(`${key}:${user[key]}`)
// }
// console.log ("-----------------------")
// const users = ['Alice',25 ];
// for (let [index, value] of users.entries()) {
//   console.log(`${index}: ${value}`);
// }

//triple nested loop aka cubic loop
// for (let x = 1; x <= 10; x++){
//     for (let y = 1; y <=10; y++) {
//         for (let z = 1; z <=10; z++) {
//             console.log(`Coordinate: ${x}, ${y}, ${z}`);
//         }
//     }
// }

// function sayHi(Text)
// {
//     document.getElementById("message").innerHTML = "Hi " + Text;
//     return "Hi" + Text;
// }
// let userName = prompt("What is your name")
// sayHi(userName)

// function CtoF ()
// {
//     let celsius = temp("How Cold is it")
//     let result = (Number(celsius) * 1.8 + 32)
//     let formattedResult = result.toFixed(2);
//     document.getElementById("message").innerHTML = "It's " + formattedResult + " Farenheit";
//     return formattedResult;
// }
// alert ("Farenheit is " + CtoF());

// function celsiusConvert() {
//     let celsius = document.getElementById("temperature").value;
//     let result = (Number(celsius) * 1.8 + 32);
//     let formattedResult = result.toFixed(2);
//     return formattedResult;
// }

// function displayResult() {
//     let finalTemp = celsiusConvert(); // finalTemp is created here
//     document.getElementById("result").innerText = finalTemp + " °F";
    
//     // CALL IT HERE so it knows what finalTemp is!
//     getAdvice(finalTemp); 
// }

// // Click listener
// document.getElementById("convertBtn").onclick = displayResult;

// // Enter key listener
// document.getElementById("temperature").onkeydown = function(event) {
//     if (event.key === "Enter") {
//         displayResult();
//     }
// }

// function getAdvice(temp) {
//     let advice;
//     let t = Number(temp); // Make sure it's a number for the switch
    
//     switch (true) {
//         case (t > 80):
//             advice = "It's very hot";
//             break;
//         case (t > 60):
//             advice = "It's a good day";
//             break;
//         case (t > 32):
//             advice = "It's freezing doe";
//             break;
//         default:
//             advice = "Brrr, stay inside!";
//     }
//     document.getElementById("advice").innerText = advice;
//     return advice;
// }

// let x = 0 

// if (x === 0) {
//     console.log("zero")
// }
// else if (x === 1) {
//     console.log("One")
// }
// else {
//     console.log("Huh")
// }

// for (z = 1; z <10; z++)
// {
//     console.log(z)
// }

// let fruits = ["Apple", "Bannana", "Coconut"];

// for (let fruit of fruits) {
//     console.log(fruit);
// }

// const car = {make: "Toyota", model: "Supra"}
// for (let key in car) {
//     console.log(`${key}: ${car[key]}`);
// }




























let x = 1
for (; x < 5; x++) {
    console.log(x)
}
do {
    console.log("Start")
    x++;
}while (x === 5);
     console.log("End")
let y = [0, 1, 2, 3, 4, 5]
for (let ra of y){
    console.log(ra)
}
let y = [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false },
    { id: 3, name: "Charlie", active: true }
];
for (let ra of y){
    console.log(ra.name + " Is " + (ra.active ? "Active" : "Inactive"))
}

function greet() {
    console.log("Hello");
}

greet(); 