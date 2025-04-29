import './style.css'

// Получаем элементы DOM
const codeEditor = document.getElementById('code-editor');
const executeButton = document.getElementById('execute-btn');
const resultOutput = document.getElementById('result-output');
const autoExecuteToggle = document.getElementById('auto-execute-toggle');
const themeSelector = document.getElementById('theme-selector');

// Состояние автоматического выполнения
let autoExecuteEnabled = false;

// Описания для методов
const methodDescriptions = {
  // String
  'length': 'Возвращает длину строки или массива.',
  'charAt()': 'Возвращает символ по указанному индексу.',
  'concat()': 'Объединяет две или более строки.',
  'includes()': 'Проверяет, содержит ли строка или массив указанный элемент.',
  'indexOf()': 'Возвращает первый индекс, по которому данный элемент найден.',
  'replace()': 'Возвращает новую строку с заменой подстроки.',
  'slice()': 'Извлекает часть строки или массива.',
  'split()': 'Разбивает строку на массив подстрок.',
  'toLowerCase()': 'Преобразует строку в нижний регистр.',
  'toUpperCase()': 'Преобразует строку в верхний регистр.',
  'trim()': 'Удаляет пробелы с начала и конца строки.',
  // Array
  'filter()': 'Создаёт новый массив с элементами, прошедшими проверку.',
  'find()': 'Возвращает первый элемент, удовлетворяющий условию.',
  'forEach()': 'Выполняет функцию для каждого элемента массива.',
  'join()': 'Объединяет все элементы массива в строку.',
  'map()': 'Создаёт новый массив с результатом вызова функции для каждого элемента.',
  'pop()': 'Удаляет последний элемент массива и возвращает его.',
  'push()': 'Добавляет один или более элементов в конец массива.',
  'reduce()': 'Применяет функцию к аккумулятору и каждому элементу массива.',
  'reverse()': 'Меняет порядок элементов массива на обратный.',
  'shift()': 'Удаляет первый элемент массива и возвращает его.',
  'some()': 'Проверяет, удовлетворяет ли хотя бы один элемент условию.',
  'sort()': 'Сортирует элементы массива на месте.',
  'splice()': 'Изменяет содержимое массива, удаляя или добавляя элементы.',
  'unshift()': 'Добавляет элементы в начало массива.',
  // Object
  'Object.keys()': 'Возвращает массив имён свойств объекта.',
  'Object.values()': 'Возвращает массив значений свойств объекта.',
  'Object.entries()': 'Возвращает массив пар [ключ, значение] объекта.',
  'Object.assign()': 'Копирует значения всех перечисляемых свойств из одного или более объектов.',
  'Object.freeze()': 'Замораживает объект, предотвращая добавление/удаление свойств.',
  'hasOwnProperty()': 'Проверяет, содержит ли объект указанное свойство.',
  'JSON.stringify()': 'Преобразует объект в строку JSON.',
  'JSON.parse()': 'Преобразует строку JSON в объект.',
  // Number
  'Number.isInteger()': 'Проверяет, является ли значение целым числом.',
  'Number.isNaN()': 'Проверяет, является ли значение NaN.',
  'toFixed()': 'Форматирует число с фиксированным количеством знаков после запятой.',
  'toString()': 'Преобразует число в строку.',
  'parseInt()': 'Преобразует строку в целое число.',
  'parseFloat()': 'Преобразует строку в число с плавающей точкой.',
  'Math.round()': 'Округляет число до ближайшего целого.',
  'Math.floor()': 'Округляет число вниз до ближайшего целого.',
  'Math.ceil()': 'Округляет число вверх до ближайшего целого.',
  'Math.abs()': 'Возвращает абсолютное значение числа.',
  'Math.random()': 'Возвращает псевдослучайное число от 0 до 1.',
  // Date
  'new Date()': 'Создаёт новый объект даты.',
  'getDate()': 'Возвращает день месяца.',
  'getMonth()': 'Возвращает месяц (0-11).',
  'getFullYear()': 'Возвращает год.',
  'getHours()': 'Возвращает часы.',
  'getMinutes()': 'Возвращает минуты.',
  'getSeconds()': 'Возвращает секунды.',
  'toISOString()': 'Возвращает строку даты в формате ISO.',
  'toLocaleDateString()': 'Возвращает строку с датой в локальном формате.',
  'toLocaleTimeString()': 'Возвращает строку с временем в локальном формате.',
  // Promise
  'new Promise()': 'Создаёт новый промис.',
  'then()': 'Добавляет обработчик успешного выполнения промиса.',
  'catch()': 'Добавляет обработчик ошибки промиса.',
  'finally()': 'Добавляет обработчик, выполняющийся после завершения промиса.',
  'Promise.all()': 'Ожидает выполнения всех промисов.',
  'Promise.race()': 'Ожидает выполнения первого из промисов.',
  'Promise.resolve()': 'Возвращает успешно выполненный промис.',
  'Promise.reject()': 'Возвращает отклонённый промис.',
  'async function': 'Объявляет асинхронную функцию.',
  'await': 'Ожидает завершения промиса.',
  // RegExp
  'new RegExp()': 'Создаёт новый регулярный объект.',
  'pattern literal': 'Синтаксис литерала регулярного выражения.',
  'test()': 'Проверяет соответствие строки регулярному выражению.',
  'exec()': 'Выполняет поиск совпадения в строке.',
  'string.match()': 'Ищет совпадения строки с регулярным выражением.',
  'string.replace()': 'Заменяет совпадения в строке по регулярному выражению.',
  'string.search()': 'Ищет совпадение регулярного выражения в строке.',
  'string.split()': 'Разбивает строку по регулярному выражению.'
};

// Функция для сохранения кода в localStorage
function saveCode() {
  localStorage.setItem('js-live-editor-code', codeEditor.value);
}

// Функция для загрузки кода из localStorage
function loadCode() {
  const savedCode = localStorage.getItem('js-live-editor-code');
  if (savedCode) {
    codeEditor.value = savedCode;
  }
}

// Функция для сохранения состояния автовыполнения
function saveAutoExecuteState() {
  localStorage.setItem('js-live-editor-auto-execute', autoExecuteEnabled.toString());
}

// Функция для загрузки состояния автовыполнения
function loadAutoExecuteState() {
  const savedState = localStorage.getItem('js-live-editor-auto-execute');
  if (savedState !== null) {
    autoExecuteEnabled = savedState === 'true';
    autoExecuteToggle.checked = autoExecuteEnabled;
  }
}

// Функция для сохранения выбранной темы
function saveTheme(theme) {
  localStorage.setItem('js-live-editor-theme', theme);
}

// Функция для загрузки выбранной темы
function loadTheme() {
  const savedTheme = localStorage.getItem('js-live-editor-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSelector.value = savedTheme;
  } else {
    // Определяем системную тему по умолчанию
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', defaultTheme);
    themeSelector.value = defaultTheme;
  }
}

// Инициализация панели типов данных
function setupDatatypesPanel() {
  const datatypeItems = document.querySelectorAll('.datatype-item');
  const methodsDropdownBtn = document.getElementById('methods-dropdown-btn');
  const methodsDropdownContainer = document.querySelector('.methods-dropdown-container');
  
  // Обработчик клика по кнопке выпадающего меню
  if (methodsDropdownBtn) {
    methodsDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      methodsDropdownContainer.classList.toggle('active');
    });
    
    // Клик вне меню закрывает его
    document.addEventListener('click', (e) => {
      if (!methodsDropdownContainer.contains(e.target)) {
        methodsDropdownContainer.classList.remove('active');
      }
    });
  }
  
  // Обработчик клика по названию типа данных
  datatypeItems.forEach(item => {
    const datatypeName = item.querySelector('.datatype-name');
    
    datatypeName.addEventListener('click', (e) => {
      e.stopPropagation(); // Предотвращаем закрытие меню при клике на элемент
      
      // Если текущий элемент уже активен, закрываем его
      if (item.classList.contains('active')) {
        item.classList.remove('active');
      } else {
        // Закрываем все остальные элементы
        datatypeItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Открываем текущий элемент
        item.classList.add('active');
      }
    });
  });
  
  // Обработчик клика по методу
  const methodItems = document.querySelectorAll('.method-item');

  // Для хранения текущей подсказки
  let currentTooltip = null;

  methodItems.forEach(method => {
    method.addEventListener('click', (e) => {
      e.stopPropagation(); // Предотвращаем закрытие меню при клике на метод
      
      const insertText = method.getAttribute('data-insert');
      
      // Получаем текущую позицию курсора
      const cursorPos = codeEditor.selectionStart;
      
      // Получаем текст до и после позиции курсора
      const textBefore = codeEditor.value.substring(0, cursorPos);
      const textAfter = codeEditor.value.substring(cursorPos);
      
      // Вставляем метод в позицию курсора
      codeEditor.value = textBefore + insertText + textAfter;
      
      // Устанавливаем курсор после вставленного текста
      const newCursorPos = cursorPos + insertText.length;
      codeEditor.setSelectionRange(newCursorPos, newCursorPos);
      
      // Фокусируемся на редакторе
      codeEditor.focus();
      
      // Если включено автоматическое выполнение, выполняем код
      if (autoExecuteEnabled) {
        executeCode();
      }
      
      // Сохраняем изменения
      saveCode();
      
      // Закрываем меню после выбора метода
      methodsDropdownContainer.classList.remove('active');

      // Всплывающая подсказка
      if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
      }
      const methodName = method.textContent.trim();
      const description = methodDescriptions[methodName] || 'Описание не найдено.';
      const tooltip = document.createElement('div');
      tooltip.className = 'method-tooltip';
      tooltip.textContent = description;
      document.body.appendChild(tooltip);
      // Позиционирование
      const rect = method.getBoundingClientRect();
      tooltip.style.left = rect.left + window.scrollX + 'px';
      tooltip.style.top = (rect.bottom + window.scrollY + 4) + 'px';
      currentTooltip = tooltip;
      // Закрытие по клику вне
      setTimeout(() => {
        document.addEventListener('click', hideTooltip, { once: true });
      }, 0);
      function hideTooltip(ev) {
        if (tooltip && !tooltip.contains(ev.target)) {
          tooltip.remove();
          currentTooltip = null;
        }
      }
    });
  });
}

// Переопределяем console.log для отображения в нашем результате
function setupConsoleOverride() {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;

  // Функция для форматирования различных типов данных
  function formatOutput(args) {
    return Array.from(args).map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (error) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  // Переопределяем методы консоли
  console.log = function() {
    const output = formatOutput(arguments);
    appendToResult('log', output);
    originalConsoleLog.apply(console, arguments);
  };

  console.error = function() {
    const output = formatOutput(arguments);
    appendToResult('error', output);
    originalConsoleError.apply(console, arguments);
  };

  console.warn = function() {
    const output = formatOutput(arguments);
    appendToResult('warn', output);
    originalConsoleWarn.apply(console, arguments);
  };

  console.info = function() {
    const output = formatOutput(arguments);
    appendToResult('info', output);
    originalConsoleInfo.apply(console, arguments);
  };
}

// Функция для добавления вывода в панель результатов
function appendToResult(type, content) {
  const outputLine = document.createElement('div');
  outputLine.className = `console-line console-${type}`;
  outputLine.textContent = content;
  resultOutput.appendChild(outputLine);
}

// Функция для выполнения кода
function executeCode() {
  // Очищаем предыдущий результат
  resultOutput.innerHTML = '';
  
  try {
    // Оборачиваем код в самовызывающуюся функцию, чтобы обеспечить изоляцию
    const wrappedCode = `
      try {
        ${codeEditor.value}
      } catch (error) {
        console.error('Ошибка выполнения:', error.message);
      }
    `;
    
    // Создаем новую функцию и выполняем код
    const executeFunction = new Function(wrappedCode);
    executeFunction();
  } catch (error) {
    // Обрабатываем ошибки синтаксиса
    appendToResult('error', `Ошибка синтаксиса: ${error.message}`);
  }
}

// Обработчики событий
function setupEventListeners() {
  // Выполнение кода по нажатию кнопки
  executeButton.addEventListener('click', () => {
    executeCode();
    saveCode();
  });

  // Выполнение кода по Ctrl+Enter
  codeEditor.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      executeCode();
      saveCode();
    }
  });

  // Автоматическое выполнение при изменении кода
  codeEditor.addEventListener('input', debounce(() => {
    saveCode();
    if (autoExecuteEnabled) {
      executeCode();
    }
  }, 500));

  // Обработчик переключателя автоматического выполнения
  autoExecuteToggle.addEventListener('change', () => {
    autoExecuteEnabled = autoExecuteToggle.checked;
    saveAutoExecuteState();
    
    if (autoExecuteEnabled) {
      executeCode(); // Выполняем код сразу после включения
    }
  });

  // Обработчик переключателя тем
  themeSelector.addEventListener('change', () => {
    const selectedTheme = themeSelector.value;
    document.documentElement.setAttribute('data-theme', selectedTheme);
    saveTheme(selectedTheme);
  });
}

// Функция debounce для предотвращения слишком частого выполнения функции
function debounce(func, delay) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// Инициализация приложения
function init() {
  setupConsoleOverride();
  loadCode();
  loadAutoExecuteState();
  loadTheme();
  setupDatatypesPanel();
  setupEventListeners();
  
  // Выполняем код при загрузке страницы
  executeCode();
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', init);

// Горячая перезагрузка модуля для Vite
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('Горячая перезагрузка модуля');
  });
}
