#include "AdafruitIO_WiFi.h"

// SSID de la red WIFI a la que desea conectarse
#define WIFI_SSID "**********"
//Contraseña de dicha red
#define WIFI_PASS "**********"

//Usuario Adafruit
#define IO_USERNAME "**********"
//Clave
#define IO_KEY "**********"

int pinRele = 13;
int pinPulsador = 12;
String estadoLuz;

//Conexión con Adafruit IO
AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);
//Feeds. Descomentar el de la habitación en el que se sitúe
AdafruitIO_Feed *feedLuz = io.feed("luz-dormitorio");
//AdafruitIO_Feed *feedLuz = io.feed("luz-salon");

void setup(){
  Serial.begin(115200);
  pinMode(pinRele, OUTPUT);
  pinMode(pinPulsador, INPUT);

  //Estableciendo conexión con Adafruit IO
  Serial.print("Conectándose con Adafruit IO");
  io.connect();
  while(io.status() < AIO_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  //Conexión establecida
  Serial.println();
  Serial.println(io.statusText());

  //Función de callback
  feedLuz->onMessage(controlLuz);

  //Obtengo el valor del estado actual de la luz
  feedLuz->get();
}

void loop(){
  io.run();

  //Se ha presionado el pulsador
  if (digitalRead(pinPulsador)){
    Serial.println("Se presionó el pulsador");
    if(estadoLuz == "ON")feedLuz->save("OFF");
    else feedLuz->save("ON");
    delay(200);
  }
}

//Función de callback que se llama cuando se modifica el valor del feed
void controlLuz(AdafruitIO_Data *datos) {
  estadoLuz = datos->value();
  Serial.println("Estado luz: " + estadoLuz);
  if(estadoLuz == "ON") digitalWrite(pinRele, HIGH);
  else digitalWrite(pinRele, LOW);
}
