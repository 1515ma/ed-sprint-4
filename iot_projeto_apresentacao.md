# Monitoramento Inteligente de Sala de Triagem Hospitalar com IoT

## Equipe:

- Marcos Gabriel (RM559809)
- Musashi Mabuti (RM559444)


---

## Visão Geral

Sistema IoT para monitoramento em tempo real de temperatura, umidade e presença em sala de triagem hospitalar. Utiliza **ESP32** com sensores **DHT22** e **HC-SR04**, publicando dados via **MQTT** para o **Node-RED**, que processa, envia à plataforma **TagoIO** e também oferece uma **API REST** que abastece um front-end responsivo.

---

## Arquitetura do Sistema

- **Hardware:** ESP32, DHT22, HC-SR04
- **Comunicação:** MQTT (`broker.hivemq.com`)
- **Processamento:** Node-RED recebe, converte, junta e envia dados via HTTP POST para TagoIO e expõe os dados em um endpoint `/api/sala`
- **Aplicação:**
  - TagoIO armazena/exibe dados via dashboard
  - Front-end em HTML + JavaScript consome a API do Node-RED para exibição local em tempo real

---

## Componentes

**Hardware**

- ESP32 DevKit
- Sensor DHT22 (Temp/Umidade)
- Sensor HC-SR04 (Presença)
- Protoboard e jumpers

**Software**

- Arduino IDE (ou PlatformIO)
- MQTT Broker (broker.hivemq.com)
- Node-RED
- TagoIO
- Front-end HTML/JS

---

## Funcionamento

1. ESP32 lê sensores
2. Publica dados via MQTT
3. Node-RED processa, armazena localmente (flow context) e envia ao TagoIO
4. Disponibiliza endpoint HTTP `/api/sala` com dados atuais
5. Interface Web consome e exibe dados em tempo real (sem uso direto do TagoIO)

---

## Instalação e Configuração

### ESP32

- Configurar Wi-Fi, MQTT e sensores
- Carregar o firmware abaixo
- Publicar dados nos tópicos:
  - `hospital/sala/temperature`
  - `hospital/sala/humidity`
  - `hospital/sala/presence`

### Node-RED

- Importar fluxo JSON com os seguintes recursos:
  - Subscrição aos tópicos MQTT
  - Funções para tratar os dados e armazenar no flow
  - Envio via HTTP POST ao TagoIO com token
  - Criação do endpoint REST `/api/sala`

### TagoIO

- Criar dispositivo e token
- Criar dashboard com widgets para:
  - `temperature`
  - `humidity`
  - `presence`

### Front-end

- Desenvolvido em HTML + JavaScript
- Faz requisições à API REST do Node-RED a cada 5 segundos
- Exibe os dados com visual simples e responsivo

---

## Aplicações Possíveis

- Monitoramento ambiental hospitalar
- Controle automático de climatização
- Alertas por e-mail/SMS
- Registro de histórico
- Expansão para sensores de CO₂, ruído, luminosidade, etc.

---

## Código da Aplicação (ESP32)

```cpp
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
  return duration * 0.034 / 2;
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  float distance = readDistance();
  bool presence = distance < 100;
  client.publish(TOPIC_PRESENCE, presence ? "1" : "0");

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (!isnan(temperature) && !isnan(humidity)) {
    char tempStr[8], humStr[8];
    dtostrf(temperature, 6, 2, tempStr);
    dtostrf(humidity, 6, 2, humStr);
    client.publish(TOPIC_TEMPERATURE, tempStr);
    client.publish(TOPIC_HUMIDITY, humStr);
  } else {
    Serial.println("Erro na leitura do DHT22");
  }

  Serial.printf("Presença: %s | Temp: %.2f°C | Umidade: %.2f%%\n",
                presence ? "Detectada" : "Nenhuma",
                temperature, humidity);
  delay(5000);
}
```

---

## Links Importantes

- 🎥 **Vídeo Demonstração:** [https://youtu.be/3jhSg6TSzXE](https://youtu.be/3jhSg6TSzXE)
- 📏 **Diagrama Draw\.io:** [Abrir Diagrama](https://viewer.diagrams.net/?tags=%7B%7D\&lightbox=1\&highlight=0000ff\&edit=_blank\&layers=1\&nav=1\&title=diagrama_iot_node_red_tagoio.drawio\&dark=auto#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1UoAqGqqxdLCldB8Nu3LF6DjwIDXtBVMR%26export%3Ddownload)
- 🚀 **Projeto no Wokwi:** [https://wokwi.com/projects/429616017569088513](https://wokwi.com/projects/429616017569088513)

---

## Conclusão

Este projeto integra todos os conceitos de IoT práticos: sensores, comunicação via MQTT, processamento em Node-RED, armazenamento na nuvem com TagoIO e exibição em tempo real via front-end. É uma base escalável para projetos de automação e monitoramento ambiental hospitalar ou industrial.

