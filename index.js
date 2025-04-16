const fs = require('fs');
const http = require('http');
const commander = require('commander');
const xml2js = require('xml2js');

const program = new commander.Command();
program
  .option('-h, --host <host>', 'сервер адреса')
  .option('-p, --port <port>', 'сервер порт')
  .option('-i, --input <input>', 'файл з даними')
  .parse(process.argv);

const { host, port, input } = program.opts();

// перевірка на параметри
if (!host || !port || !input) {
  console.log('Необхідно вказати: --host --port --input');
  process.exit(1);
}

// перевірка чи є файл
if (!fs.existsSync(input)) {
  console.log('Cannot find input file');
  process.exit(1);
}

// сервер
const server = http.createServer((req, res) => {
  fs.readFile(input, 'utf8', (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end('помилка читання файла');
      return;
    }
    let json;
    try {
      json = JSON.parse(data); // читаємо JSON
    } catch (e) {
      res.statusCode = 400;
      res.end('невірний JSON');
      return;
    }

    // формуємо XML з потрібних полів
    const output = {
      records: json.map(obj => ({
        record: {
          StockCode: obj.StockCode,
          ValCode: obj.ValCode,
          Attraction: obj.Attraction
        }
      }))
    };

    const builder = new xml2js.Builder();
    const xml = builder.buildObject(output);

    // відповідаємо XML
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xml);
  });
});

server.listen(port, host, () => {
  console.log(`Сервер працює на http://${host}:${port}`);
});
