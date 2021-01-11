const Alexa = require('ask-sdk-core');
const adaptadorPersistencia = require ('ask-sdk-s3-persistence-adapter');

const launchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        let respuesta;
        
        const gestorAtributos = handlerInput.attributesManager;
        
        //Se inician los atributos de sesión
        let atributosSesion = {
            "numeroCafes" : 0,
            "estadoSolicitud" : "EN CURSO"
        };
        gestorAtributos.setSessionAttributes(atributosSesion);
        
        //Se recuperan los atributos persistentes
        const atributosPersistentes = await gestorAtributos.getPersistentAttributes() || {};
        if(atributosPersistentes.hasOwnProperty("nombre")){
            let nombre = atributosPersistentes.nombre;
            console.log("Su nombre es " + nombre);
            respuesta = `Hola, ${nombre}. ¿Qué desea?`;
        }
        else{
            console.log("Todavía no se conoce su nombre");
            respuesta = `Hola, ¿qué desea?`;
        }
        return handlerInput.responseBuilder
            .speak(respuesta)
            .reprompt("Si quisera un café, podría hacérselo normal o descafeinado")
            .getResponse();
    }
};

const controladorSolicitudCafe = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'SolicitudCafe';
    },
    handle(handlerInput) {
        let respuesta;
        let numeroCafes;
        
        if(handlerInput.requestEnvelope.request.intent.confirmationStatus === "DENIED")
            respuesta = "Entonces, ¿qué café quiere?";
        else{
            //Se obtienen los valores de los slots
            let cafe = handlerInput.requestEnvelope.request.intent.slots.cafe.value;
            let leche = handlerInput.requestEnvelope.request.intent.slots.leche.value;
            let edulcorante = handlerInput.requestEnvelope.request.intent.slots.edulcorante.value;
            
            //Se obtienen los atributos de la sesión
            const gestorAtributos = handlerInput.attributesManager;
            if (handlerInput.requestEnvelope.session.hasOwnProperty("attributes")){
                numeroCafes = gestorAtributos.getSessionAttributes().numeroCafes;
            }
            else numeroCafes = 0;
            
            //Se actualizan los atributos de la sesión
            numeroCafes++;
            let atributos = {
                "numeroCafes" : numeroCafes,
                "estadoSolicitud" : "FINALIZADA"
            };
            gestorAtributos.setSessionAttributes(atributos);
    
            //Se compone de la respuesta
            respuesta = `Su ${cafe} ${leche} y ${edulcorante} estará en breve.
                         ¿Quiere otra cosa?`;
        }

        return handlerInput.responseBuilder
            .speak(respuesta)
            .reprompt("¿Va a querer tomar otro café?")
            .getResponse();
    }
};

const controladorSi = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
               && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        let respuesta;
        let gestorAtributos = handlerInput.attributesManager;
        let atributos = gestorAtributos.getSessionAttributes();
        if(atributos.estadoSolicitud === "FINALIZADA"){
            atributos.estadoSolicitud = "EN CURSO";
            respuesta = "¿Qué otro café desea?";
        }
        else respuesta = "Ha debido haber un malentendido. Empecemos de nuevo. ¿Quiere un café normal o descafeinado?";
        
        gestorAtributos.setSessionAttributes(atributos);

        return handlerInput.responseBuilder
            .speak(respuesta)
            .reprompt("Tiene que pedir un café normal o descafeinado")
            .getResponse();
    },
};

const controladorNo = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
               && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    async handle(handlerInput) {
        const precioCafe = 1.50;
        let respuesta, reprompt;
        
        //Se obtiene el gestor de atributos
        const gestorAtributos = handlerInput.attributesManager;
        
        //Se recuperan los atributos persistentes y de sesión
        let atributos = gestorAtributos.getSessionAttributes();
        const atributosPersistentes = await gestorAtributos.getPersistentAttributes() || {};
        
        if(atributos.estadoSolicitud === "FINALIZADA"){
            let numeroCafes = atributos.numeroCafes;

            if(!atributosPersistentes.hasOwnProperty("nombre")){
                respuesta = `Son ${precioCafe*numeroCafes} euros. Gracias. ¿Cómo se llama?`;
                reprompt = "¿Cómo se llama?";
                handlerInput.responseBuilder.reprompt(reprompt);
            }
            else{
                let nombre = atributosPersistentes.nombre;
                respuesta = `${nombre}, son ${precioCafe*numeroCafes} euros. Gracias.`;
            }
        }
        else{
            respuesta = "Ha debido haber un malentendido. Empecemos de nuevo. ¿Quiere un café normal o descafeinado?";
            reprompt = "Tiene que pedir un café normal o descafeinado";
            handlerInput.responseBuilder.reprompt(reprompt)
        }
            
        return handlerInput.responseBuilder
            .speak(respuesta)
            .getResponse();
    }
};

const controladorSolicitudNombre = {
    canHandle(handlerInput) {
        let atributos = handlerInput.attributesManager.getSessionAttributes();
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
               && handlerInput.requestEnvelope.request.intent.name === 'SolicitudNombre';
    },
    async handle(handlerInput) {
        let respuesta;

        //Se obtienen el nombre del slot
        let nombre = handlerInput.requestEnvelope.request.intent.slots.nombre.value;
        
       //Se obtiene el gestor de atributos
        const gestorAtributos = handlerInput.attributesManager;

        //Se obtienen los atributos de sesión y los persistentes (si los hay)
        let atributosSesion = gestorAtributos.getSessionAttributes();
        let atributosPersistentes = await gestorAtributos.getPersistentAttributes() || {};
        
        if(!atributosPersistentes.hasOwnProperty("nombre")){
            //Se hace persistente el nombre del usuario
            gestorAtributos.setPersistentAttributes({"nombre":nombre});
            await gestorAtributos.savePersistentAttributes();
            
            respuesta = `Encantado de conocerle, ${nombre}. La próxima vez me acordaré de su nombre.`;
        }
        else{
            let nombrePeristente = atributosPersistentes.nombre;
            respuesta = `Recuerdo que su nombre es ${nombrePeristente}.`;
        }
        if(atributosSesion.estadoSolicitud !== "FINALIZADA"){
            respuesta += " Perdone, pero he olvidado lo que pedía. ¿Era un café normal o descafeinado?";
            handlerInput.responseBuilder.reprompt("Si quiere, puede pedirme un café normal o descafeinado");
        }
        
        return handlerInput.responseBuilder
            .speak(respuesta)
            .getResponse();
    }
};


const controladorHelpIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        let respuesta = "Puedo preparar un café normal o descafeinado, ponerlo sólo, cortado o con leche, y añadirle azúcar o sacarina";
        return handlerInput.responseBuilder
            .speak(respuesta)
            .reprompt("Te repito. " + respuesta)
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
            .speak("Adiós. Espero poder volver a atenderte muy pronto")
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
            .reprompt("Solo puede pedirme que le prepare un café normal o descafeinado")
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

const skillBuilder  = Alexa.SkillBuilders.custom();
const adaptadorPersistenciaS3 = new adaptadorPersistencia.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET});
exports.handler = skillBuilder 
    .withPersistenceAdapter(adaptadorPersistenciaS3)
    .addRequestHandlers(launchRequestHandler)
    .addRequestHandlers(controladorSolicitudCafe)
    .addRequestHandlers(controladorSi)
    .addRequestHandlers(controladorNo)
    .addRequestHandlers(controladorSolicitudNombre)
    .addRequestHandlers(controladorHelpIntent)
    .addRequestHandlers(CancelAndStopIntentHandler)
    .addRequestHandlers(controladorFallback)
    .addRequestHandlers(controladorFinSesion)
    .lambda();
