var miNombre = "Tomás";

function saludar1(nombre){
    console.log("Hola " + nombre + " desde la función saludar1");
}

var saludar2 = function(nombre){
    console.log("Hola " + nombre + " desde la función saludar2");
};

saludar1(miNombre);
saludar2(miNombre);