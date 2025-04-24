import './style.css'

// Получаем элементы DOM
const codeEditor = document.getElementById('code-editor');
const executeButton = document.getElementById('execute-btn');
const resultOutput = document.getElementById('result-output');
const autoExecuteToggle = document.getElementById('auto-execute-toggle');
const themeSelector = document.getElementById('theme-selector');

// Состояние автоматического выполнения
let autoExecuteEnabled = false;

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
