#include <ESP8266WiFi.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

//SSID de la red WIFI a la que desea conectarse
const char* ssid = "**********";
//Contraseña de dicha red
const char* password =  "**********";

//Se crea el cliente NTP con el que e va a obtener la hora
WiFiUDP ntpUDP;
NTPClient clienteNTP(ntpUDP, "pool.ntp.org");

void setup() {
  Serial.begin(115200);
  
  //Inicializamos la conexión WiFi
  Serial.print("Conectando a " + String(ssid) + " ");     
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Conectado");

//Se inicia el cliente NTP
  clienteNTP.begin();
  clienteNTP.setTimeOffset(7200); //GMT+2 (en segundos)
}

void loop() {
  clienteNTP.update();

  //Se obtiene la hora y el minuto del servidor NTP
  String horaActual = String(clienteNTP.getHours());
  String minutoActual = String(clienteNTP.getMinutes());
  if (horaActual.toInt() < 10) horaActual = "0" + horaActual;
  if (minutoActual.toInt() < 10) minutoActual = "0" + minutoActual;
  Serial.println(horaActual + ":" + minutoActual);

  delay(60000);
}
