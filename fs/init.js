load('api_timer.js');
load('api_arduino_bme280.js');
load('api_http.js');
load('api_config.js');
load('api_math.js');

// Sensors address
let sens_addr = 0x77;
// Initialize Adafruit_BME280 library
let bme = Adafruit_BME280.create();
// Initialize the sensor
if (bme.begin(sens_addr) === 0) {
  print('Cant find a sensor');
} else {
	print('BME280 sensor found!');
	print('Initializing elastic-search data store..');
	let url = Cfg.get('elastic.baseUrl');
	if (url === '') {
		print('Initialization failed because elastic.url is empty, please configure it!');
	} else {
		let url = Cfg.get('elastic.url');
		let repeatTime = Cfg.get('elastic.repeatTime') || 30000;
		print('Started repeating timer at ', Math.round(repeatTime / 1000), 'seconds');
		print('Notifying to ', url);
		Timer.set(repeatTime, true, function() {
			let url = Cfg.get('elastic.url');
			let authorization = Cfg.get('elastic.headers.authorization');
			HTTP.query({
				url: url,
				headers: { 
					'Authorization': authorization,
					'User-Agent': 'elasticsearch-bme280-js (esp8266)'
				},
				data: {
					updated: Math.round(Timer.now() * 1000),
					type: 'bme280',
					sensorData: {
						temperature: bme.readTemperature(), 
						humidity: bme.readHumidity(), 
						pressure: bme.readPressure()
					}
				},
				success: function(body, full_http_msg) {
					let logOnSuccess = Cfg.get('elastic.logOnSuccess');
					if (logOnSuccess) {
						print(body);
					}
				},
				error: function(err) {
					print(err);
				},
			});
		}, null);
	}
	print('Initialization completed');
}
