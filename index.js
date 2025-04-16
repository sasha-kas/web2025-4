const fs = require('fs');
const http = require('http');
const commander = require('commander');
const xml2js = require('xml2js');

// Створюємо команду для отримання параметрів
const program = new commander.Command();
program
  .option('-h, --host <host>', 'Адреса сервера')
  .option('-p, --port <port>', 'Порт сервера')
  .option('-i, --input <input>', 'Шлях до файлу для читання')
  .parse(process.argv);

// Отримуємо параметри
const { host, port, input } = program.opts();

// Перевіряємо, чи всі параметри є
if (!host || !port || !input) {
  console.log('Необхідно вказати: --host, --port, --input');
  process.exit(1); // Якщо чогось немає, зупиняємо програму
}

// Перевіряємо, чи є файл
if (!fs.existsSync(input)) {
  console.log('Cannot find input file');
  process.exit(1); // Якщо немає файлу, виводимо помилку і зупиняємо програму
}

// Створюємо сервер
const server = http.createServer((req, res) => {
  // Читаємо файл
  fs.readFile(input, 'utf8', (err, data) => {
    if (err) {
      console.log('Помилка при читанні файлу');
      res.statusCode = 500;
      res.end('Помилка сервера');
      return;
    }

    // Перетворюємо JSON в об'єкт
    const jsonData = JSON.parse(data);

    // Створюємо новий об'єкт для XML
    const xmlData = {
      records: jsonData.map(item => ({
        StockCode: item.StockCode,
        ValCode: item.ValCode,
        Attraction: item.Attraction
      }))
    };

    // Перетворюємо об'єкт в XML
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(xmlData);

    // Відправляємо XML як відповідь
    res.setHeader('Content-Type', 'application/xml');
    res.end(xml);
  });
});

// Запускаємо сервер
server.listen(port, host, () => {
  console.log(`Сервер працює на http://${host}:${port}`);
});

