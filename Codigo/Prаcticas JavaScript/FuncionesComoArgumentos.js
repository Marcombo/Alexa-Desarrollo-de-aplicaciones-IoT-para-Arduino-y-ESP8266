"use strict"

var miNumero = 2;

function esPar(numero){
    if(numero % 2) return false;
    else return true;
}

function esPrimo(numero) {
    for (let i = 2; i < numero; i++) {
      if ( numero % i == 0) return false;
    }
    return true;
}

function esParPrimo(numero, funcion){
    return funcion(numero);
}

if(esParPrimo(miNumero, esPar)) console.log("el número " + miNumero + " es par");
else console.log("el número " + miNumero + " no es par");

if(esParPrimo(miNumero, esPrimo)) console.log("el número " + miNumero + " es primo");
else console.log("el número " + miNumero + " no es primo");