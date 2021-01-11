#include "AdafruitIO_WiFi.h"
#include <SimpleDHT.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// SSID de la red WIFI a la que desea conectarse
#define WIFI_SSID "**********"
//Contraseña de dicha red
#define WIFI_PASS "**********"

//Usuario Adafruit
#define IO_USERNAME "**********"
//Clave
#define IO_KEY "**********"

//Conexión con Adafruit IO
AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);
//Feeds
AdafruitIO_Feed *feed_estado_calefaccion = io.feed("calefaccion");
AdafruitIO_Feed *feed_temp_actual = io.feed("temperatura-actual");
AdafruitIO_Feed *feed_temp_progamada = io.feed("temperatura-programada");
AdafruitIO_Feed *feed_hora_progamada = io.feed("hora-programada");

//Se crea el cliente NTP con el que e va a obtener la hora
WiFiUDP ntpUDP;
NTPClient clienteNTP(ntpUDP, "pool.ntp.org");

int pinRele = 13;
bool releActivado = false;
String estadoCalefaccion;
String temperaturaProgramada;

int pinDHT11 = 12;
SimpleDHT11 dht11;
byte temperaturaActual = 0;
byte humedad = 0;

unsigned int tiempoAnterior;
int intervaloEnviotemperatura = 5000;

int horaActual, minutoActual;
String horaMinutoProgramados;
int horaProgramada, minutoProgramado;
boolean programacionHoraria = false;

void setup(){
  Serial.begin(115200);
  pinMode(pinRele, OUTPUT);
  pinMode(pinDHT11, INPUT);

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
  feed_estado_calefaccion->onMessage(controlEstadoCalefaccion);
  feed_temp_progamada->onMessage(controlTemperaturaProgramada);
  feed_hora_progamada->onMessage(controlHoraProgramada);

  //Obtengo el valor del estado actual de la calefacción
  feed_estado_calefaccion->get();
  feed_temp_progamada->get();
  feed_hora_progamada->get();

  //Se inicia el cliente NTP
  clienteNTP.begin();
  clienteNTP.setTimeOffset(7200); //GMT+2 (en segundos)
}

void loop(){
  io.run();
  
  if(millis() - tiempoAnterior > intervaloEnviotemperatura){
    clienteNTP.update();
    horaActual = clienteNTP.getHours();
    minutoActual = clienteNTP.getMinutes();
    Serial.println("HORA ACTUAL: "+String(horaActual));
    Serial.println("MINUTO ACTUAL: "+String(minutoActual));
  
    dht11.read(pinDHT11, &temperaturaActual, &humedad, NULL);
    if (!isnan(temperaturaActual)){
      Serial.println("Temperatura: " + String(temperaturaActual));
      feed_temp_actual->save(temperaturaActual);
    }
    tiempoAnterior = millis();
  }

  if(estadoCalefaccion == "ON" && (temperaturaProgramada.toInt() < (int)temperaturaActual)){
    if(!releActivado){
      releActivado = true;
      digitalWrite(pinRele, HIGH);
    }
  }
  else if(releActivado){
    releActivado = false;
    digitalWrite(pinRele, LOW);
  }

  if(estadoCalefaccion == "OFF" &&
     programacionHoraria &&
     comparaHoras(horaActual, minutoActual, horaProgramada, minutoProgramado)){
    //se actualiza el estado de la calefacción y se desprograma
    feed_estado_calefaccion->save("ON");
    feed_hora_progamada->save("--:--");
  }
}

//Función de callback que se llama cuando se modifica el estado de la calefacción
void controlEstadoCalefaccion(AdafruitIO_Data *datos) {
  estadoCalefaccion = datos->value();
  Serial.println("Estado de la calefacción: " + estadoCalefaccion);
}

//Función de callback que se llama cuando se modifica la temperatura programada
void controlTemperaturaProgramada(AdafruitIO_Data *datos) {
  temperaturaProgramada = datos->value();
  Serial.println("Temperatura programada: " + temperaturaProgramada);
}

//Función de callback que se llama cuando se modifica la hora programada
void controlHoraProgramada(AdafruitIO_Data *datos) {
  horaMinutoProgramados = datos->value();
  Serial.println("Hora programada: " + horaMinutoProgramados);
  if (horaMinutoProgramados == "--:--") programacionHoraria = false;
  else{
    programacionHoraria = true;
    horaProgramada = horaMinutoProgramados.substring(0, 2).toInt();
    minutoProgramado = horaMinutoProgramados.substring(3).toInt();
  }
}

//funcion auxiliar que devuelve true si hora1 es mayor o igual que hora2
boolean comparaHoras(int hora1, int minuto1, int hora2, int minuto2){
  if(hora1 > hora2) return true;
  if(hora1 == hora2){
    if(minuto1 >= minuto2) return true;
    else return false;
  }
  else return false;
}

