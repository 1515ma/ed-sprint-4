#include <WiFi.h>
#include <PubSubClient.h>
 #include <DHT.h>


  const char* ssid = "Wokwi-GUEST";
  const char* password = "";


  const char* mqtt_server = "broker.hivemq.com";
  const int mqtt_port = 1883;
  const char* mqtt_user = "";
  const char* mqtt_password = "";
  const char* mqtt_client_id = "ESP32_Sala_Triagem";


  #define TRIG_PIN 5
  #define ECHO_PIN 18
  #define DHT_PIN 4
  #define DHT_TYPE DHT22


  #define TOPIC_PRESENCE "hospital/sala/presence"
  #define TOPIC_TEMPERATURE "hospital/sala/temperature"
  #define TOPIC_HUMIDITY "hospital/sala/humidity"


  WiFiClient espClient;
  PubSubClient client(espClient);
  DHT dht(DHT_PIN, DHT_TYPE);

  void setup() {
    Serial.begin(115200);
    

    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    

    dht.begin();
    

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.println("Conectando ao WiFi...");
    }
    Serial.println("Conectado ao WiFi");


    client.setServer(mqtt_server, mqtt_port);
  }

  void reconnect() {
    while (!client.connected()) {
      Serial.println("Conectando ao MQTT...");
      if (client.connect(mqtt_client_id, mqtt_user, mqtt_password)) {
        Serial.println("Conectado ao MQTT");
      } else {
        Serial.print("Falha, rc=");
        Serial.print(client.state());
        Serial.println(" tentando novamente em 5 segundos");
        delay(5000);
      }
    }
  }

  float readDistance() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance = duration * 0.034 / 2; 
    return distance;
  }

  void loop() {
    if (!client.connected()) {
      reconnect();
    }
    client.loop();

  
    float distance = readDistance();
    bool presence = distance < 100;
    client.publish(TOPIC_PRESENCE, presence ? "1" : "0");

    // Leitura do DHT22
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    if (!isnan(temperature) && !isnan(humidity)) {
      char tempStr[8];
      char humStr[8];
      dtostrf(temperature, 6, 2, tempStr);
      dtostrf(humidity, 6, 2, humStr);
      client.publish(TOPIC_TEMPERATURE, tempStr);
      client.publish(TOPIC_HUMIDITY, humStr);
    } else {
      Serial.println("Erro na leitura do DHT22");
    }

    Serial.print("Presença: ");
    Serial.print(presence ? "Detectada" : "Nenhuma");
    Serial.print(" | Temp: ");
    Serial.print(temperature);
    Serial.print("C | Umidade: ");
    Serial.print(humidity);
    Serial.println("%");

    delay(5000); 
  }