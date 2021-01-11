"use strict";

var texto = "ROMA";
var textoInvertido = "";

console.log("Texto inicial: " + texto);
for(var i = texto.length - 1; i >= 0; i--){
    textoInvertido  = textoInvertido + texto.charAt(i);
}
console.log("Texto invertido: " + textoInvertido);