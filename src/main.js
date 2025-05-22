import './style.css'

// Получаем элементы DOM
const codeEditor = document.getElementById('code-editor');
const executeButton = document.getElementById('execute-btn');
const clearButton = document.getElementById('clear-btn'); // Added clear button
const resultOutput = document.getElementById('result-output');
const autoExecuteToggle = document.getElementById('auto-execute-toggle');
const themeSelector = document.getElementById('theme-selector');

// Elements for resizable panels
const editorPanel = document.querySelector('.editor-panel');
const resultPanel = document.querySelector('.result-panel');
const resizer = document.getElementById('resizer');

// Element for method search
const methodSearchInput = document.getElementById('method-search-input');

// Состояние автоматического выполнения
let autoExecuteEnabled = false;

// Описания для методов с входными/выходными данными и примерами
const methodDescriptions = {
  // String
  'length': {
    desc: 'Возвращает длину строки или массива.',
    input: 'Строка или массив',
    output: 'Число',
    examples: [
      `"hello".length // 5`,
      `[1,2,3].length // 3`,
      `" ".length // 1`
    ]
  },
  'charAt()': {
    desc: 'Возвращает символ по указанному индексу.',
    input: 'Строка, индекс (число)',
    output: 'Строка (один символ)',
    examples: [
      `"hello".charAt(1) // "e"`,
      `"abc".charAt(0) // "a"`,
      `"test".charAt(10) // ""`
    ]
  },
  'concat()': {
    desc: 'Объединяет две или более строки.',
    input: 'Строка, строки для объединения',
    output: 'Новая строка',
    examples: [
      `"a".concat("b") // "ab"`,
      `"foo".concat("bar", "baz") // "foobarbaz"`,
      `"".concat("test") // "test"`
    ]
  },
  'includes()': {
    desc: 'Проверяет, содержит ли строка или массив указанный элемент.',
    input: 'Строка/массив, искомое значение',
    output: 'true/false',
    examples: [
      `"hello".includes("ell") // true`,
      `[1,2,3].includes(2) // true`,
      `"abc".includes("z") // false`
    ]
  },
  'indexOf()': {
    desc: 'Возвращает первый индекс, по которому данный элемент найден.',
    input: 'Строка/массив, искомое значение',
    output: 'Число (индекс) или -1',
    examples: [
      `"hello".indexOf("l") // 2`,
      `[1,2,3].indexOf(2) // 1`,
      `"abc".indexOf("z") // -1`
    ]
  },
  'replace()': {
    desc: 'Возвращает новую строку с заменой подстроки.',
    input: 'Строка, подстрока для замены, новая подстрока',
    output: 'Новая строка',
    examples: [
      `"hello".replace("llo", "y") // "hey"`,
      `("2023-01-01".replace(/-/g, "/")) // "2023/01/01"`,
      `"xxx".replace("x", "y") // "yxx"`
    ]
  },
  'slice()': {
    desc: 'Извлекает часть строки или массива.',
    input: 'Строка/массив, начальный индекс, конечный индекс',
    output: 'Новая строка или массив',
    examples: [
      `"hello".slice(1, 4) // "ell"`,
      `[1, 2, 3, 4, 5].slice(2, 4) // [3, 4]`,
      `"abcdef".slice(-3) // "def"`
    ]
  },
  'split()': {
    desc: 'Разбивает строку на массив подстрок.',
    input: 'Строка, разделитель',
    output: 'Массив строк',
    examples: [
      `"a,b,c".split(",") // ["a", "b", "c"]`,
      `"hello".split("") // ["h", "e", "l", "l", "o"]`,
      `("2023-01-01".split("-")) // ["2023", "01", "01"]`
    ]
  },
  'toLowerCase()': {
    desc: 'Преобразует строку в нижний регистр.',
    input: 'Строка',
    output: 'Строка',
    examples: [
      `"HELLO".toLowerCase() // "hello"`,
      `"HeLLo WoRLD".toLowerCase() // "hello world"`,
      `"javaSCRIPT".toLowerCase() // "javascript"`
    ]
  },
  'toUpperCase()': {
    desc: 'Преобразует строку в верхний регистр.',
    input: 'Строка',
    output: 'Строка',
    examples: [
      `"hello".toUpperCase() // "HELLO"`,
      `"HeLLo WoRLD".toUpperCase() // "HELLO WORLD"`,
      `"javascript".toUpperCase() // "JAVASCRIPT"`
    ]
  },
  'trim()': {
    desc: 'Удаляет пробелы с начала и конца строки.',
    input: 'Строка',
    output: 'Строка',
    examples: [
      `".trim()" // ""`,
      `"   hello   ".trim() // "hello"`,
      `"\nhello\t".trim() // "hello"`
    ]
  },
  // Array
  'filter()': {
    desc: 'Создаёт новый массив с элементами, прошедшими проверку.',
    input: 'Массив, функция-предикат',
    output: 'Новый массив',
    examples: [
      `[1, 2, 3, 4].filter(n => n > 2) // [3, 4]`,
      `["apple", "banana", "cherry"].filter(fruit => fruit.startsWith("b")) // ["banana"]`,
      `[1, 2, 3].filter(() => false) // []`
    ]
  },
  'find()': {
    desc: 'Возвращает первый элемент, удовлетворяющий условию.',
    input: 'Массив, функция-предикат',
    output: 'Элемент или undefined',
    examples: [
      `[1, 2, 3, 4].find(n => n > 2) // 3`,
      `["apple", "banana", "cherry"].find(fruit => fruit.startsWith("b")) // "banana"`,
      `[1, 2, 3].find(() => false) // undefined`
    ]
  },
  'forEach()': {
    desc: 'Выполняет функцию для каждого элемента массива.',
    input: 'Массив, функция',
    output: 'undefined',
    examples: [
      `let sum = 0; [1, 2, 3].forEach(n => sum += n); sum // 6`,
      `["apple", "banana", "cherry"].forEach(fruit => console.log(fruit)); // "apple" "banana" "cherry"`,
      `[1, 2, 3].forEach(() => console.log("Hi")); // "Hi" (3 раза)`
    ]
  },
  'join()': {
    desc: 'Объединяет все элементы массива в строку.',
    input: 'Массив, разделитель',
    output: 'Строка',
    examples: [
      `["a", "b", "c"].join(", ") // "a, b, c"`,
      `[1, 2, 3].join("") // "123"`,
      `[].join(", ") // ""`
    ]
  },
  'map()': {
    desc: 'Создаёт новый массив с результатом вызова функции для каждого элемента.',
    input: 'Массив, функция',
    output: 'Новый массив',
    examples: [
      `[1, 2, 3].map(n => n * 2) // [2, 4, 6]`,
      `["apple", "banana", "cherry"].map(fruit => fruit.length) // [5, 6, 6]`,
      `[1, 2, 3].map(() => 0) // [0, 0, 0]`
    ]
  },
  'pop()': {
    desc: 'Удаляет последний элемент массива и возвращает его.',
    input: 'Массив',
    output: 'Элемент или undefined',
    examples: [
      `[1, 2, 3].pop() // 3`,
      `let a = [1, 2, 3]; a.pop(); a // [1, 2]`,
      `[].pop() // undefined`
    ]
  },
  'push()': {
    desc: 'Добавляет один или более элементов в конец массива.',
    input: 'Массив, элементы для добавления',
    output: 'Новая длина массива',
    examples: [
      `[1, 2, 3].push(4) // 4`,
      `let a = [1, 2]; a.push(3, 4); a // [1, 2, 3, 4]`,
      `[1, 2, 3].push() // 3`
    ]
  },
  'reduce()': {
    desc: 'Применяет функцию к аккумулятору и каждому элементу массива.',
    input: 'Массив, функция, начальное значение',
    output: 'Значение, возвращаемое функцией',
    examples: [
      `[1, 2, 3].reduce((a, b) => a + b, 0) // 6`,
      `["apple", "banana", "cherry"].reduce((a, b) => a + b.length, 0) // 17`,
      `[1, 2, 3].reduce(() => {}, 0) // 0`
    ]
  },
  'reverse()': {
    desc: 'Меняет порядок элементов массива на обратный.',
    input: 'Массив',
    output: 'Массив',
    examples: [
      `[1, 2, 3].reverse() // [3, 2, 1]`,
      `let a = [1, 2, 3]; a.reverse(); a // [3, 2, 1]`,
      `[].reverse() // []`
    ]
  },
  'shift()': {
    desc: 'Удаляет первый элемент массива и возвращает его.',
    input: 'Массив',
    output: 'Элемент или undefined',
    examples: [
      `[1, 2, 3].shift() // 1`,
      `let a = [1, 2, 3]; a.shift(); a // [2, 3]`,
      `[].shift() // undefined`
    ]
  },
  'some()': {
    desc: 'Проверяет, удовлетворяет ли хотя бы один элемент условию.',
    input: 'Массив, функция-предикат',
    output: 'true/false',
    examples: [
      `[1, 2, 3].some(n => n > 2) // true`,
      `["apple", "banana", "cherry"].some(fruit => fruit.startsWith("z")) // false`,
      `[1, 2, 3].some(() => false) // false`
    ]
  },
  'sort()': {
    desc: 'Сортирует элементы массива на месте.',
    input: 'Массив, функция сравнения',
    output: 'Массив',
    examples: [
      `[3, 1, 2].sort() // [1, 2, 3]`,
      `["banana", "apple", "cherry"].sort() // ["apple", "banana", "cherry"]`,
      `[1, 2, 3].sort(() => 0) // [1, 2, 3]` // стабильная сортировка
    ]
  },
  'splice()': {
    desc: 'Изменяет содержимое массива, удаляя или добавляя элементы.',
    input: 'Массив, начальный индекс, количество удаляемых элементов, элементы для добавления',
    output: 'Массив с удалёнными элементами',
    examples: [
      `[1, 2, 3, 4].splice(1, 2) // [2, 3]`,
      `let a = [1, 2, 3]; a.splice(1, 0, "a"); a // [1, "a", 2, 3]`,
      `[1, 2, 3].splice(0, 3, 4, 5) // [1, 2, 3]` // возвращает удалённые элементы
    ]
  },
  'unshift()': {
    desc: 'Добавляет элементы в начало массива.',
    input: 'Массив, элементы для добавления',
    output: 'Новая длина массива',
    examples: [
      `[1, 2, 3].unshift(0) // 4`,
      `let a = [1, 2]; a.unshift(0); a // [0, 1, 2]`,
      `[1, 2, 3].unshift() // 3`
    ]
  },
  // Object
  'Object.keys()': {
    desc: 'Возвращает массив имён свойств объекта.',
    input: 'Объект',
    output: 'Массив строк',
    examples: [
      `Object.keys({a: 1, b: 2}) // ["a", "b"]`,
      `Object.keys({}) // []`,
      `Object.keys({length: 1}) // ["length"]` // свойство length
    ]
  },
  'Object.values()': {
    desc: 'Возвращает массив значений свойств объекта.',
    input: 'Объект',
    output: 'Массив',
    examples: [
      `Object.values({a: 1, b: 2}) // [1, 2]`,
      `Object.values({}) // []`,
      `Object.values({length: 1}) // [1]` // свойство length
    ]
  },
  'Object.entries()': {
    desc: 'Возвращает массив пар [ключ, значение] объекта.',
    input: 'Объект',
    output: 'Массив массивов',
    examples: [
      `Object.entries({a: 1, b: 2}) // [["a", 1], ["b", 2]]`,
      `Object.entries({}) // []`,
      `Object.entries({length: 1}) // [["length", 1]]` // свойство length
    ]
  },
  'Object.assign()': {
    desc: 'Копирует значения всех перечисляемых свойств из одного или более объектов.',
    input: 'Целевой объект, источник 1, источник 2, ...',
    output: 'Целевой объект',
    examples: [
      `Object.assign({a: 1}, {b: 2}) // {a: 1, b: 2}`,
      `Object.assign({}, {a: 1}) // {a: 1}`,
      `const target = {}; Object.assign(target, {a: 1}); target === target // true` // ссылка на тот же объект
    ]
  },
  'Object.freeze()': {
    desc: 'Замораживает объект, предотвращая добавление/удаление свойств.',
    input: 'Объект',
    output: 'Объект',
    examples: [
      `const obj = {}; Object.freeze(obj); obj === obj // true`,
      `const obj = {a: 1}; Object.freeze(obj); obj.a = 2; obj.a // 1`,
      `const obj = Object.freeze({}); obj === obj // true` // замороженный объект
    ]
  },
  'hasOwnProperty()': {
    desc: 'Проверяет, содержит ли объект указанное свойство.',
    input: 'Объект, строка с именем свойства',
    output: 'true/false',
    examples: [
      `({a: 1}).hasOwnProperty("a") // true`,
      `({}).hasOwnProperty("a") // false`,
      `Object.create({a: 1}).hasOwnProperty("a") // false` // свойство из прототипа
    ]
  },
  'JSON.stringify()': {
    desc: 'Преобразует объект в строку JSON.',
    input: 'Объект',
    output: 'Строка',
    examples: [
      `JSON.stringify({a: 1}) // '{"a":1}'`,
      `JSON.stringify([1, 2, 3]) // '[1,2,3]'`,
      `JSON.stringify({a: undefined}) // '{"a":null}'` // undefined становится null
    ]
  },
  'JSON.parse()': {
    desc: 'Преобразует строку JSON в объект.',
    input: 'Строка',
    output: 'Объект',
    examples: [
      `JSON.parse('{"a":1}') // {a: 1}`,
      `JSON.parse('[1,2,3]') // [1, 2, 3]`,
      `JSON.parse('{"a":null}') // {a: undefined}` // null становится undefined
    ]
  },
  // Number
  'Number.isInteger()': {
    desc: 'Проверяет, является ли значение целым числом.',
    input: 'Число',
    output: 'true/false',
    examples: [
      `Number.isInteger(4) // true`,
      `Number.isInteger(4.0) // true`,
      `Number.isInteger(4.1) // false`
    ]
  },
  'Number.isNaN()': {
    desc: 'Проверяет, является ли значение NaN.',
    input: 'Число',
    output: 'true/false',
    examples: [
      `Number.isNaN(NaN) // true`,
      `Number.isNaN("hello") // false`,
      `Number.isNaN(4) // false`
    ]
  },
  'toFixed()': {
    desc: 'Форматирует число с фиксированным количеством знаков после запятой.',
    input: 'Число, количество знаков',
    output: 'Строка',
    examples: [
      `Math.PI.toFixed(2) // "3.14"`,
      `(.1 + .2).toFixed(1) // "0.3"`,
      `3.456.toFixed(0) // "3"`
    ]
  },
  'toString()': {
    desc: 'Преобразует число в строку.',
    input: 'Число, основание (2-36)',
    output: 'Строка',
    examples: [
      ` (123).toString() // "123"`,
      `(456).toString(16) // "1c8"`,
      `(255).toString(2) // "11111111"`
    ]
  },
  'parseInt()': {
    desc: 'Преобразует строку в целое число.',
    input: 'Строка, основание (2-36)',
    output: 'Число',
    examples: [
      `parseInt("10") // 10`,
      `parseInt("10", 16) // 16`,
      `parseInt("10.5") // 10`
    ]
  },
  'parseFloat()': {
    desc: 'Преобразует строку в число с плавающей точкой.',
    input: 'Строка',
    output: 'Число',
    examples: [
      `parseFloat("10.5") // 10.5`,
      `parseFloat("10") // 10`,
      `parseFloat("abc") // NaN`
    ]
  },
  'Math.round()': {
    desc: 'Округляет число до ближайшего целого.',
    input: 'Число',
    output: 'Число',
    examples: [
      `Math.round(3.5) // 4`,
      `Math.round(3.1415) // 3`,
      `Math.round(-3.5) // -3`
    ]
  },
  'Math.floor()': {
    desc: 'Округляет число вниз до ближайшего целого.',
    input: 'Число',
    output: 'Число',
    examples: [
      `Math.floor(3.9) // 3`,
      `Math.floor(-3.1) // -4`,
      `Math.floor(3.0) // 3`
    ]
  },
  'Math.ceil()': {
    desc: 'Округляет число вверх до ближайшего целого.',
    input: 'Число',
    output: 'Число',
    examples: [
      `Math.ceil(3.1) // 4`,
      `Math.ceil(-3.9) // -3`,
      `Math.ceil(3.0) // 3`
    ]
  },
  'Math.abs()': {
    desc: 'Возвращает абсолютное значение числа.',
    input: 'Число',
    output: 'Число',
    examples: [
      `Math.abs(-5) // 5`,
      `Math.abs(5) // 5`,
      `Math.abs(0) // 0`
    ]
  },
  'Math.random()': {
    desc: 'Возвращает псевдослучайное число от 0 до 1.',
    input: 'Нет',
    output: 'Число',
    examples: [
      `Math.random() // 0.123456789`,
      `Math.random() // 0.987654321`,
      `Math.random() // 0.555555555`
    ]
  },
  // Date
  'new Date()': {
    desc: 'Создаёт новый объект даты.',
    input: 'Нет',
    output: 'Объект Date',
    examples: [
      `new Date() // текущая дата и время`,
      `new Date("2023-01-01") // Sun Jan 01 2023 00:00:00 GMT+0000 (Coordinated Universal Time)`,
      `new Date(0) // Thu Jan 01 1970 00:00:00 GMT+0000 (Coordinated Universal Time)`
    ]
  },
  'getDate()': {
    desc: 'Возвращает день месяца.',
    input: 'Нет',
    output: 'Число',
    examples: [
      `new Date("2023-01-15").getDate() // 15`,
      `new Date("2023-02-01").getDate() // 1`,
      `new Date(0).getDate() // 1`
    ]
  },
  'getMonth()': {
    desc: 'Возвращает месяц (0-11).',
    input: 'Нет',
    output: 'Число',
    examples: [
      `new Date("2023-01-15").getMonth() // 0`,
      `new Date("2023-02-15").getMonth() // 1`,
      `new Date("2023-12-15").getMonth() // 11`
    ]
  },
  'getFullYear()': {
    desc: 'Возвращает год.',
    input: 'Нет',
    output: 'Число',
    examples: [
      `new Date("2023-01-15").getFullYear() // 2023`,
      `new Date(0).getFullYear() // 1970`,
      `new Date("2023-12-31").getFullYear() // 2023`
    ]
  },
  'getHours()': {
    desc: 'Возвращает часы.',
    input: 'Нет',
    output: 'Число',
    examples: [
      `new Date("2023-01-15T10:20:30").getHours() // 10`,
      `new Date("2023-01-15T23:20:30").getHours() // 23`,
      `new Date("2023-01-15T00:20:30").getHours() // 0`
    ]
  },
  'getMinutes()': {
    desc: 'Возвращает минуты.',
    input: 'Нет',
    output: 'Число',
    examples: [
      `new Date("2023-01-15T10:20:30").getMinutes() // 20`,
      `new Date("2023-01-15T10:59:30").getMinutes() // 59`,
      `new Date("2023-01-15T10:00:30").getMinutes() // 0`
    ]
  },
  'getSeconds()': {
    desc: 'Возвращает секунды.',
    input: 'Нет',
    output: 'Число',
    examples: [
      `new Date("2023-01-15T10:20:30").getSeconds() // 30`,
      `new Date("2023-01-15T10:20:59").getSeconds() // 59`,
      `new Date("2023-01-15T10:20:00").getSeconds() // 0`
    ]
  },
  'toISOString()': {
    desc: 'Возвращает строку даты в формате ISO.',
    input: 'Нет',
    output: 'Строка',
    examples: [
      `new Date("2023-01-15").toISOString() // "2023-01-15T00:00:00.000Z"`,
      `new Date(0).toISOString() // "1970-01-01T00:00:00.000Z"`,
      `new Date("2023-12-31").toISOString() // "2023-12-31T00:00:00.000Z"`
    ]
  },
  'toLocaleDateString()': {
    desc: 'Возвращает строку с датой в локальном формате.',
    input: 'Нет',
    output: 'Строка',
    examples: [
      `new Date("2023-01-15").toLocaleDateString() // "1/15/2023"`,
      `new Date("2023-12-31").toLocaleDateString() // "12/31/2023"`,
      `new Date(0).toLocaleDateString() // "1/1/1970"`
    ]
  },
  'toLocaleTimeString()': {
    desc: 'Возвращает строку с временем в локальном формате.',
    input: 'Нет',
    output: 'Строка',
    examples: [
      `new Date("2023-01-15T10:20:30").toLocaleTimeString() // "10:20:30 AM"`,
      `new Date("2023-01-15T22:20:30").toLocaleTimeString() // "10:20:30 PM"`,
      `new Date(0).toLocaleTimeString() // "12:00:00 AM"`
    ]
  },
  // Promise
  'new Promise()': {
    desc: 'Создаёт новый промис.',
    input: 'Функция с параметрами resolve и reject',
    output: 'Промис',
    examples: [
      `new Promise((resolve, reject) => { /*...*/ })`,
      `new Promise((resolve) => setTimeout(resolve, 1000))`,
      `new Promise((_, reject) => reject("Ошибка"))`
    ]
  },
  'then()': {
    desc: 'Добавляет обработчик успешного выполнения промиса.',
    input: 'Функция',
    output: 'Промис',
    examples: [
      `Promise.resolve(1).then(n => n + 1)`,
      `new Promise(resolve => resolve(1)).then(n => n + 1)`,
      `Promise.reject(1).then(n => n + 1, err => err + 1)`
    ]
  },
  'catch()': {
    desc: 'Добавляет обработчик ошибки промиса.',
    input: 'Функция',
    output: 'Промис',
    examples: [
      `Promise.reject("Ошибка").catch(err => console.log(err))`,
      `new Promise((_, reject) => reject("Ошибка")).catch(err => console.log(err))`,
      `Promise.resolve(1).catch(err => console.log(err))`
    ]
  },
  'finally()': {
    desc: 'Добавляет обработчик, выполняющийся после завершения промиса.',
    input: 'Функция',
    output: 'Промис',
    examples: [
      `Promise.resolve(1).finally(() => console.log("Завершено"))`,
      `new Promise((resolve) => { setTimeout(resolve, 1000) }).finally(() => console.log("Завершено"))`,
      `Promise.reject(1).finally(() => console.log("Завершено"))`
    ]
  },
  'Promise.all()': {
    desc: 'Ожидает выполнения всех промисов.',
    input: 'Массив промисов',
    output: 'Промис',
    examples: [
      `Promise.all([Promise.resolve(1), Promise.resolve(2)]).then(console.log)`,
      `Promise.all([Promise.resolve(1), new Promise((resolve) => setTimeout(resolve, 1000))]).then(console.log)`,
      `Promise.all([Promise.resolve(1), Promise.reject(2)]).catch(console.log)`
    ]
  },
  'Promise.race()': {
    desc: 'Ожидает выполнения первого из промисов.',
    input: 'Массив промисов',
    output: 'Промис',
    examples: [
      `Promise.race([new Promise((resolve) => setTimeout(resolve, 1000)), Promise.resolve(1)]).then(console.log)`,
      `Promise.race([Promise.resolve(1), new Promise((_, reject) => setTimeout(reject, 1000))]).catch(console.log)`,
      `Promise.race([]).catch(console.log)`
    ]
  },
  'Promise.resolve()': {
    desc: 'Возвращает успешно выполненный промис.',
    input: 'Значение',
    output: 'Промис',
    examples: [
      `Promise.resolve(1).then(n => n + 1)`,
      `Promise.resolve(new Promise(resolve => resolve(1))).then(n => n + 1)`,
      `Promise.resolve().then(() => console.log("Успех"))`
    ]
  },
  'Promise.reject()': {
    desc: 'Возвращает отклонённый промис.',
    input: 'Причина отклонения',
    output: 'Промис',
    examples: [
      `Promise.reject("Ошибка").catch(err => console.log(err))`,
      `Promise.reject(new Error("Ошибка")).catch(err => console.log(err.message))`,
      `Promise.reject().catch(() => console.log("Неудача"))`
    ]
  },
  'async function': {
    desc: 'Объявляет асинхронную функцию.',
    input: 'Функция',
    output: 'Функция',
    examples: [
      `async function f() { return 1 }`,
      `const f = async () => 1`,
      `async function f() { throw "Ошибка" }`
    ]
  },
  'await': {
    desc: 'Ожидает завершения промиса.',
    input: 'Промис',
    output: 'Значение',
    examples: [
      `async function f() { const result = await Promise.resolve(1); console.log(result) }`,
      `async function f() { try { await Promise.reject("Ошибка") } catch (e) { console.log(e) } }`,
      `const f = async () => await Promise.resolve(1)`
    ]
  },
  // RegExp
  'new RegExp()': {
    desc: 'Создаёт новый регулярный объект.',
    input: 'Строка с шаблоном, флаги',
    output: 'Объект RegExp',
    examples: [
      `new RegExp("\\d+")`,
      `new RegExp("\\d+", "g")`,
      `new RegExp(/\\d+/)`
    ]
  },
  'pattern literal': {
    desc: 'Синтаксис литерала регулярного выражения.',
    input: 'Строка с шаблоном',
    output: 'Объект RegExp',
    examples: [
      `/\\d+/`,
      `/\\d+/g`,
      `/\\d+/i`
    ]
  },
  'test()': {
    desc: 'Проверяет соответствие строки регулярному выражению.',
    input: 'Строка',
    output: 'true/false',
    examples: [
      `/\\d+/.test("123") // true`,
      `/\\d+/.test("abc") // false`,
      `/\\d+/.test("abc123") // true`
    ]
  },
  'exec()': {
    desc: 'Выполняет поиск совпадения в строке.',
    input: 'Строка',
    output: 'Массив с найденными совпадениями или null',
    examples: [
      `/\\d+/.exec("123") // ["123"]`,
      `/\\d+/.exec("abc") // null`,
      `/\\d+/.exec("abc123") // ["123"]`
    ]
  },
  'string.match()': {
    desc: 'Ищет совпадения строки с регулярным выражением.',
    input: 'Регулярное выражение',
    output: 'Массив с найденными совпадениями или null',
    examples: [
      `"abc123".match(/\\d+/) // ["123"]`,
      `"abc".match(/\\d+/) // null`,
      `"123abc456".match(/\\d+/g) // ["123", "456"]`
    ]
  },
  'string.replace()': {
    desc: 'Заменяет совпадения в строке по регулярному выражению.',
    input: 'Регулярное выражение, замена',
    output: 'Новая строка',
    examples: [
      `"abc123".replace(/\\d+/, "#") // "abc#"`,
      `"abc123abc".replace(/\\d+/, "#") // "abc#abc"`,
      `"abc123abc".replace(/\\d+/g, "#") // "abc##abc"`
    ]
  },
  'string.search()': {
    desc: 'Ищет совпадение регулярного выражения в строке.',
    input: 'Регулярное выражение',
    output: 'Индекс совпадения или -1',
    examples: [
      `"abc123".search(/\\d+/) // 3`,
      `"abc".search(/\\d+/) // -1`,
      `"123abc".search(/\\d+/) // 0`
    ]
  },
  'string.split()': {
    desc: 'Разбивает строку по регулярному выражению.',
    input: 'Регулярное выражение',
    output: 'Массив строк',
    examples: [
      `"a,b,c".split(/,/) // ["a", "b", "c"]`,
      `"hello".split(/l/) // ["he", "lo"]`,
      `"2023-01-01".split(/-/) // ["2023", "01", "01"]`
    ]
  }
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
  let currentTooltip = null;
  let tooltipTimeout = null;

  methodItems.forEach(method => {
    method.addEventListener('mouseenter', (e) => {
      clearTimeout(tooltipTimeout);
      if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
      }
      const methodName = method.textContent.trim();
      const info = methodDescriptions[methodName];
      if (!info) return;
      const tooltip = document.createElement('div');
      tooltip.className = 'method-tooltip';
      tooltip.innerHTML = `<b>${methodName}</b><br><span>${info.desc}</span><br><br><b>Входные данные:</b> ${info.input}<br><b>Выходные данные:</b> ${info.output}<br><b>Примеры:</b><br><code>${info.examples.join('</code><br><code>')}</code>`;
      document.body.appendChild(tooltip);
      const rect = method.getBoundingClientRect();
      tooltip.style.left = rect.left + window.scrollX + 'px';
      tooltip.style.top = (rect.bottom + window.scrollY + 4) + 'px';
      currentTooltip = tooltip;
    });
    method.addEventListener('mouseleave', () => {
      tooltipTimeout = setTimeout(() => {
        if (currentTooltip) {
          currentTooltip.remove();
          currentTooltip = null;
        }
      }, 100);
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
  if (type === 'error') {
    outputLine.className = 'console-line console-error-enhanced';
  } else {
    outputLine.className = `console-line console-${type}`;
  }
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

  // Event listener for the clear button
  clearButton.addEventListener('click', () => {
    codeEditor.value = ''; // Clear the code editor
    saveCode(); // Save the cleared state
    resultOutput.innerHTML = ''; // Clear the result output
  });

  // Event listener for method search input
  if (methodSearchInput) {
    methodSearchInput.addEventListener('input', () => {
      const searchTerm = methodSearchInput.value.toLowerCase().trim();
      const datatypeItems = document.querySelectorAll('.datatypes-list .datatype-item');

      datatypeItems.forEach(item => {
        const datatypeNameElement = item.querySelector('.datatype-name');
        if (!datatypeNameElement) return; // Skip if structure is unexpected

        const datatypeName = datatypeNameElement.textContent.toLowerCase();
        const methodItems = item.querySelectorAll('.datatype-methods .method-item');
        let datatypeItselfMatchesSearch = false; 

        // Check if the datatype name matches
        if (datatypeName.includes(searchTerm)) {
          datatypeItselfMatchesSearch = true;
        }

        let visibleMethodsCount = 0;
        methodItems.forEach(method => {
          const methodName = method.textContent.toLowerCase();
          // Get original case name for lookup in methodDescriptions
          const originalMethodName = method.textContent.trim(); 
          const methodInfo = methodDescriptions[originalMethodName];
          let methodMatchesSearch = false;

          if (methodName.includes(searchTerm)) {
            methodMatchesSearch = true;
          }
          
          if (methodInfo && methodInfo.desc && methodInfo.desc.toLowerCase().includes(searchTerm)) {
            methodMatchesSearch = true;
          }
          // Optional: search in examples
          // if (methodInfo && methodInfo.examples) {
          //   methodInfo.examples.forEach(ex => {
          //     if (ex.toLowerCase().includes(searchTerm)) methodMatchesSearch = true;
          //   });
          // }

          if (methodMatchesSearch) {
            method.style.display = ''; // Show method
            visibleMethodsCount++;
          } else {
            method.style.display = 'none'; // Hide method
          }
        });

        // Determine if the datatype group should be visible
        if (datatypeItselfMatchesSearch || visibleMethodsCount > 0) {
          item.style.display = ''; // Show datatype group
          // If the datatype name itself matched, but no methods did (e.g. searching for "string"
          // and all string methods are hidden by a more specific term), ensure methods are shown.
          // This part is tricky: if datatype name matches, should all its methods be visible
          // *regardless* of method-specific search? The current logic correctly filters methods
          // individually. If datatype name matches, the group is visible, and then methods are filtered.
          // If the requirement is "if datatype name matches, show ALL its methods", then the logic
          // for method.style.display would need adjustment here.
          // The current subtask implies methods are filtered individually.
        } else {
          item.style.display = 'none'; // Hide datatype group
        }
      });
    });
  } else {
    console.error("Method search input not found.");
  }
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
  initResize(); // Initialize the resizer functionality
  
  // Выполняем код при загрузке страницы
  executeCode();
}

// Function to initialize resizing functionality
function initResize() {
  let isResizing = false;
  let startX, startEditorWidth, startResultWidth;

  if (!resizer || !editorPanel || !resultPanel) {
    console.error("Resizer or panels not found for initResize. Ensure editor-panel, result-panel classes and resizer ID are correct.");
    return;
  }
  
  const container = editorPanel.parentElement; // Should be editor-container

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent text selection
    isResizing = true;
    startX = e.clientX;
    startEditorWidth = editorPanel.offsetWidth;
    startResultWidth = resultPanel.offsetWidth;

    // Apply a class to the body to indicate resizing (optional, for global cursor changes)
    document.body.style.cursor = 'col-resize'; 

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  function handleMouseMove(e) {
    if (!isResizing) return;
    const deltaX = e.clientX - startX;
    
    let newEditorWidth = startEditorWidth + deltaX;
    let newResultWidth = startResultWidth - deltaX;

    const minWidth = 200; // Minimum width for a panel in pixels (synced with CSS)
    
    // Ensure the container's and resizer's widths are correctly accounted for
    const resizerWidth = resizer.offsetWidth;
    const containerWidth = container.offsetWidth;

    if (newEditorWidth < minWidth) {
      newEditorWidth = minWidth;
      newResultWidth = containerWidth - newEditorWidth - resizerWidth;
    }
    
    if (newResultWidth < minWidth) {
      newResultWidth = minWidth;
      newEditorWidth = containerWidth - newResultWidth - resizerWidth;
    }

    // Check if the sum of new widths exceeds container width (can happen due to minWidth adjustments)
    if (newEditorWidth + newResultWidth + resizerWidth > containerWidth) {
        // Prioritize editor panel if it was being expanded, else result panel
        if (deltaX > 0) { // Editor was being expanded
             newResultWidth = containerWidth - newEditorWidth - resizerWidth;
        } else { // Result panel was being expanded (or editor shrunk)
             newEditorWidth = containerWidth - newResultWidth - resizerWidth;
        }
    }
    
    // Final check to ensure panels don't become smaller than minWidth after combined adjustments
    if (newEditorWidth < minWidth) newEditorWidth = minWidth;
    if (newResultWidth < minWidth) newResultWidth = minWidth;


    editorPanel.style.flex = `0 0 ${newEditorWidth}px`;
    resultPanel.style.flex = `0 0 ${newResultWidth}px`;
  }

  function handleMouseUp() {
    isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = ''; // Reset body cursor
  }
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', init);

// Горячая перезагрузка модуля для Vite
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('Горячая перезагрузка модуля');
  });
}
