"use strict";

let matriz = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
let fila, elemento;
for (let i = 0; i < matriz.length; i++) {
    fila = matriz[i]
    for (let j = 0; j <fila.length; j++) {
        elemento = matriz[i][j];
        console.log("Elemento["+i+ ","+j+"]: "+elemento);
    }
}
