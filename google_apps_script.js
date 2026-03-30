// =============================================
// СМЛ ФАСАД — Google Apps Script
// Вставьте этот код в Apps Script вашей таблицы
// https://docs.google.com/spreadsheets/d/1IQkz_VZFEP0f6NG3QPCNlA_a_cQA73aAgW7WCtrVjd4
//
// Инструкция по деплою:
// 1. Откройте таблицу → Расширения → Apps Script
// 2. Вставьте весь этот код
// 3. Нажмите "Деплой" → "Новый деплой"
// 4. Тип: "Веб-приложение"
// 5. Выполнять от имени: "Я"
// 6. Доступ: "Все" (анонимные пользователи)
// 7. Нажмите "Деплой" → скопируйте URL
// 8. Вставьте URL в script.js → GOOGLE_SCRIPT_URL
// =============================================

// ID вашей таблицы
const SPREADSHEET_ID = '1IQkz_VZFEP0f6NG3QPCNlA_a_cQA73aAgW7WCtrVjd4';

// Название листа (вкладки) куда сохранять заявки
const SHEET_NAME = 'Заявки';

// ---- Структура таблицы ----
// Колонка A: Дата
// Колонка B: Имя
// Колонка C: Телефон
// Колонка D: Сообщение
// Колонка E: Страница отправки
// Колонка F: Статус (по умолчанию "Новая")

function doPost(e) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // Создаём лист "Заявки" если его нет
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Добавляем заголовки
      sheet.appendRow(['Дата', 'Имя', 'Телефон', 'Сообщение', 'Страница', 'Статус']);

      // Форматируем заголовок
      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setBackground('#ff6b00');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(11);
      sheet.setFrozenRows(1);

      // Ширина колонок
      sheet.setColumnWidth(1, 160); // Дата
      sheet.setColumnWidth(2, 160); // Имя
      sheet.setColumnWidth(3, 160); // Телефон
      sheet.setColumnWidth(4, 300); // Сообщение
      sheet.setColumnWidth(5, 250); // Страница
      sheet.setColumnWidth(6, 120); // Статус
    }

    // Получаем данные из POST-запроса
    const params  = e.parameter || {};
    const name    = params.name    || '';
    const phone   = params.phone   || '';
    const message = params.message || '';
    const date    = params.date    || new Date().toLocaleString('ru');
    const page    = params.page    || '';
    const status  = 'Новая';

    // Добавляем строку
    sheet.appendRow([date, name, phone, message, page, status]);

    // Подсвечиваем новую строку светло-жёлтым
    const lastRow   = sheet.getLastRow();
    const newRowRange = sheet.getRange(lastRow, 1, 1, 6);
    newRowRange.setBackground('#fff9e6');

    // Опционально: отправка уведомления на email
    // sendEmailNotification(name, phone, message, date);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Ошибка: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET-запрос для проверки работоспособности скрипта
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'СМЛ Фасад webhook активен' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Опциональная функция — уведомление на email при новой заявке
function sendEmailNotification(name, phone, message, date) {
  const recipient = 'info@sml-fasad.by'; // замените на ваш email
  const subject   = '📩 Новая заявка с сайта — СМЛ Фасад';
  const body = `
Новая заявка с сайта sml-fasad.by

Дата: ${date}
Имя: ${name || '(не указано)'}
Телефон: ${phone}
Сообщение: ${message || '(не указано)'}

Ответьте клиенту как можно скорее.
  `.trim();

  MailApp.sendEmail(recipient, subject, body);
}
