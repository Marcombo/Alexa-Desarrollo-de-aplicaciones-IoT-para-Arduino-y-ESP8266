const Alexa = require('ask-sdk-core');

let ojos = ["verdes", "azules", "oscuros"];
let pelo = ["rubio", "moreno", "pelirrojo"];
let barba = ["barba", "bigote", "perilla"];

const launchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        let respuesta = inicioJuego(handlerInput);
        
        return handlerInput.responseBuilder
            .speak(respuesta)
            .reprompt(respuesta)
            .getResponse();
    }
};

const controladorObtenerNombre = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'obtenerNombre';
    },
    handle(handlerInput) {
        let respuesta;
        let personajePropuesto;
        let caracteristica;
        //Se obtienen el valor del slot nombre
        let nombrePropuesto = handlerInput.requestEnvelope.request.intent.slots.nombre.value;
        //Se obtienen los atributos de la sesión
        const gestorAtributos =  handlerInput.attributesManager;
        let atributos = gestorAtributos.getSessionAttributes();
        let valorescaracteristicas = atributos.listaCaracteristicas;
        let valorCaracteristica = valorescaracteristicas[0];
        //se obtiene el objeto con las caracteríticas de la persona propuesta por el usuario
        switch(nombrePropuesto){
            case "luis" : personajePropuesto = atributos.luis; break;
            case "pedro" : personajePropuesto = atributos.pedro; break;
            case "juan" : personajePropuesto = atributos.juan;
        }
        //Se obtiene el nombre de la caracterítica por la que se preguntaba
        if(ojos.indexOf(valorCaracteristica) !== -1) caracteristica = "ojos";
        else if(pelo.indexOf(valorCaracteristica) !== -1) caracteristica = "pelo";
             else caracteristica = "barba";
        //Se comprueba si la persona propuesta tiene el valor de la característica por la que se preguntaba
        if(personajePropuesto[caracteristica] === valorCaracteristica){
            atributos.aciertos++;
            if (atributos.aciertos === 9){
                atributos.estado ="FINALIZADO";
                respuesta = "Enhorabuena, ha acertado todas las preguntas. ¿Quiere volver a jugar?";
            }
            else{
                atributos.listaCaracteristicas.shift();
                valorCaracteristica = valorescaracteristicas[0];
                respuesta= "Correcto. ";
                if(ojos.indexOf(valorCaracteristica) !== -1)
                    respuesta += `¿Quién tiene los ojos ${valorCaracteristica}?`;
                else if(pelo.indexOf(valorCaracteristica)!== -1)
                    respuesta += `Quién es ${valorCaracteristica}`;
                    else respuesta += `Quién tiene ${valorCaracteristica}`;
            }
        }
        else{
            atributos.estado ="FINALIZADO";
            let aciertos = atributos.aciertos;
            
            if(ojos.indexOf(valorCaracteristica) !== -1)
                    respuesta = `${nombrePropuesto} tiene los ojos ${personajePropuesto[caracteristica] }, no ${valorCaracteristica}. `;
                else if(pelo.indexOf(valorCaracteristica)!== -1)
                    respuesta = `${nombrePropuesto} es ${personajePropuesto[caracteristica] }, no ${valorCaracteristica}. `;
                    else respuesta = `${nombrePropuesto} tiene ${personajePropuesto[caracteristica] }, no ${valorCaracteristica}. `;
            
            switch(aciertos){
                case 0 : respuesta += `No ha tenido ningún acierto. ¿Quiere jugar de nuevo?`;
                    break;
                case 1 : respuesta += `Ha tenido ${aciertos} acierto. ¿Quiere jugar de nuevo?`;
                    break;
                default : respuesta += `Ha tenido ${aciertos} aciertos. ¿Quiere jugar de nuevo?`;
            }
        }
        gestorAtributos.setSessionAttributes(atributos);
        return handlerInput.responseBuilder
            .speak(respuesta)
            .reprompt(respuesta)
            .getResponse();
    }
}

const controladorSi = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
               && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        let respuesta;
        
        let atributos = handlerInput.attributesManager.getSessionAttributes();
        if(atributos.estado === "FINALIZADO") respuesta = inicioJuego(handlerInput);
        else respuesta = "Debe indicar el nombre de Luis, Pedro o Juan";

        return handlerInput.responseBuilder
            .speak(respuesta)
            .reprompt(respuesta)
            .getResponse();
    },
};

const controladorNo = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
               && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        let respuesta;
        
        let atributos = handlerInput.attributesManager.getSessionAttributes();
        if(atributos.estado === "FINALIZADO"){
            respuesta = "Gracias. Cuando quiera podemos volver a jugar.";
        }
        else respuesta = "Debe indicar el nombre de Luis, Pedro o Juan";

        return handlerInput.responseBuilder
            .speak(respuesta)
            .getResponse();
    },
};

const controladorHelpIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        let respuestaUsuario = "Deberá responder correctamente las preguntas \
                                sobre qué personaje tiene cada característica \
                                por la que se le pregunta. \
                                Si acierta las nueve preguntas, habrá ganado.";
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt("Si necesita ayuda, solicítela.")
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Adiós. Espero poder volver a jugar contigo muy pronto")
            .getResponse();
    }
};

const controladorFallback = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Perdone, pero no he entendido lo que ha dicho")
            .reprompt("¿Puede volver a repetir lo que ha dicho?")
            .getResponse();
    }
};

const controladorFinSesion = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
    .addRequestHandlers(launchRequestHandler)
    .addRequestHandlers(controladorObtenerNombre)
    .addRequestHandlers(controladorSi)
    .addRequestHandlers(controladorNo)
    .addRequestHandlers(controladorHelpIntent)
    .addRequestHandlers(CancelAndStopIntentHandler)
    .addRequestHandlers(controladorFallback)
    .addRequestHandlers(controladorFinSesion)
    .lambda();
    
function inicioJuego(handlerInput){
    let respuesta;
        
    //Se desordenan las características
    ojos = ojos.sort(function(){return Math.random() - 0.5});
    pelo = pelo.sort(function(){return Math.random() - 0.5});
    barba = barba.sort(function(){return Math.random() - 0.5});
    let caracteristicas =ojos.concat(pelo.concat(barba));
    caracteristicas = caracteristicas.sort(function(){return Math.random() - 0.5});
    //Se crean los objetos con las características de cada persona
    let luis = {"ojos" : ojos[0], "pelo" : pelo[0], "barba" : barba[0]};
    let pedro = {"ojos" : ojos[1], "pelo" : pelo[1], "barba" : barba[1]};
    let juan = {"ojos" : ojos[2], "pelo" : pelo[2], "barba" : barba[2]};
    //Se crea el texto de inicio del juego
    respuesta = "Escuche atentamente. "
    respuesta += `Luis tiene los ojos ${luis.ojos}, el pelo ${luis.pelo} y ${luis.barba}. `;
    respuesta += `Pedro tiene los ojos ${pedro.ojos}, el pelo ${pedro.pelo} y ${pedro.barba}. `;
    respuesta += `Juan tiene los ojos ${juan.ojos}, el pelo ${juan.pelo} y ${juan.barba}. `;
    //Se crea la pregunta
    let caracteristica = caracteristicas[0];
    if(ojos.indexOf(caracteristica) !== -1)
        respuesta += `¿Quién tiene los ojos ${caracteristica}?`;
    else if(pelo.indexOf(caracteristica)!== -1)
        respuesta += `Quién es ${caracteristica}`;
        else respuesta += `Quién tiene ${caracteristica}`;
    //Se inician los atributos de sesión
    const gestorAtributos = handlerInput.attributesManager;
    let atributosSesion = {
        "aciertos" : 0,
        "listaCaracteristicas" : caracteristicas,
        "luis" : luis,
        "pedro" : pedro,
        "juan" : juan,
        "estado" : "EN CURSO"
        };
    //Se salvan los atributos de sesión
    gestorAtributos.setSessionAttributes(atributosSesion);
        
    return respuesta;
}