"use strict";

let personas = ["Pedro", "Juan"];
console.log("Cola inicial: " + personas);
personas.pop();
console.log("[pop()]-Juan es atendido. Queda: " + personas);
personas.push("Luis");
console.log("[push(\"Luis\")]-Luis se cuela. Ahora están: " + personas);
personas.unshift("Tomás");
console.log("[unshift(\"Tomás\")]-Tomás se pone a la cola. Ahora están: " + personas);
personas.shift();
console.log("[shift()]-Tomás es inesperadamente atendido. Quedan: " + personas);



