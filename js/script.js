// Глобальные переменные:                            
var FIELD_SIZE_X = 20;      //строки
var FIELD_SIZE_Y = 20;      //столбцы
var SNAKE_SPEED = 200;      // Интервал между перемещениями змейки раз в  0,2 с. 1000 мс = 1 с
var FOOD_SPEED = 5000;      // Интервад между созданием еды 1 в 5 сек
var PROBLEM_SPEED = 5000;   // интервал межуд созданием проблем 1 в 5 сек
var snake = [];             // Сама змейка
var direction = 'y+';       // Направление движения змейки
var gameIsRunning = false;  // Запущена ли игра
var snake_timer;            // Таймер змейки
var food_timer;             // Таймер для еды
var problem_timer;           // Таймер проблем
var score = 0;              // Результат
var points = document.getElementsByClassName("score-point")[0]; //показатель счет

function init() {
    prepareGameField(); // Генерация поля
    points.innerHTML = score;
    var wrap = document.getElementsByClassName('wrap')[0];
    // Подгоняем размер контейнера под игровое поле
	if (16 * (FIELD_SIZE_X + 1) < 380) {
        wrap.style.width = '380px';
    }
    else {
        wrap.style.width = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
    }
    
    
    // События кнопок Старт и Новая игра
    document.getElementById('snake-start').addEventListener('click', startGame); // Регистрируем событие по клику
    document.getElementById('snake-renew').addEventListener('click', refreshGame);

// Отслеживание клавиш клавиатуры
    addEventListener('keydown', changeDirection);
}

/**
 * Функция генерации игрового поля
 */
function prepareGameField() {
    // Создаём таблицу
    var game_table = document.createElement('table');
    game_table.setAttribute('class', 'game-table ');

    // Генерация ячеек игровой таблицы
    for (var i = 0; i < FIELD_SIZE_X; i++) {
        // Создание строки
        var row = document.createElement('tr');
        row.className = 'game-table-row row-' + i;

        for (var j = 0; j < FIELD_SIZE_Y; j++) {
            // Создание ячейки
            var cell = document.createElement('td');
            cell.className = 'game-table-cell cell-' + i + '-' + j;

            row.appendChild(cell); // Добавление ячейки
        }
        game_table.appendChild(row); // Добавление строки
    }

    document.getElementById('snake-field').appendChild(game_table); // Добавление таблицы
}

/**
 * Старт игры
 */
function startGame() {
    if (!gameIsRunning) {
        gameIsRunning = true;
        respawn();                                                  //создали змейку
        createFood();      
        snake_timer = setInterval(move, SNAKE_SPEED);               //каждые 200мс (0,2 с) запускаем функцию move
        food_timer = setTimeout(createFood, FOOD_SPEED);            // каждые 5 сек запускаем функцию
        problem_timer = setInterval(createProblem, PROBLEM_SPEED);  // каждые 5 сек запускаем функцию createProblem
}
}

/**
 * Функция расположения змейки на игровом поле
 */
function respawn() {
    // Змейка - массив td
    // Стартовая длина змейки = 2

    // Respawn змейки из центра
    var start_coord_x = Math.floor(FIELD_SIZE_X / 2);
    var start_coord_y = Math.floor(FIELD_SIZE_Y / 2);

    // Голова змейки
    var snake_head = document.getElementsByClassName('cell-' + start_coord_y + '-' + start_coord_x)[0];
    snake_head.setAttribute('class', snake_head.getAttribute('class') + ' snake-unit');
    // Тело змейки
    var snake_tail = document.getElementsByClassName('cell-' + (start_coord_y-1) + '-' + start_coord_x)[0];
    snake_tail.setAttribute('class', snake_tail.getAttribute('class') + ' snake-unit');

    snake.push(snake_head);
    snake.push(snake_tail);
    points.innerHTML = score;
}




/**
 * Движение змейки
 */
function move() {
    //console.log('move',direction);
    // Сборка классов
    var snake_head_classes = snake[snake.length-1].getAttribute('class').split(' ');

    // Сдвиг головы
    var new_unit;
    var snake_coords = snake_head_classes[1].split('-');//преобразовали строку в массив
    var coord_y = parseInt(snake_coords[1]);
    var coord_x = parseInt(snake_coords[2]);

    // Определяем новую точку
    if (direction == 'x-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x - 1))[0];
    }
    else if (direction == 'x+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x + 1))[0];
    }
    else if (direction == 'y+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y - 1) + '-' + (coord_x))[0];
    }
    else if (direction == 'y-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y + 1) + '-' + (coord_x))[0];
    }

    if(new_unit === undefined) {
        new_unit = headTeleport(coord_y, coord_x);
    }




    // Проверки
    // 1) new_unit не часть змейки
    // 2) не врезались в препятствие-проблему
    //console.log(new_unit);
    if (!isSnakeUnit(new_unit) && pathClear(new_unit)) {
        // Добавление новой части змейки
        new_unit.setAttribute('class', new_unit.getAttribute('class') + ' snake-unit');
        snake.push(new_unit);

        // Проверяем, надо ли убрать хвост
       
	   if (!haveFood(new_unit)) {
            // Находим хвост
           var removed = snake.splice(0, 1)[0];
            var classes = removed.getAttribute('class').split(' ');
			
            // удаляем хвост
            removed.setAttribute('class', classes[0] + ' ' + classes[1]);
        }
    }
    else {
        finishTheGame();
    }
}

/**
 * Функция переноса змейки на другую сторону
 * @param coord_y
 * @param coord_x
 * @returns {*}
 */
function headTeleport(coord_y, coord_x){
var unit;
if(direction == 'x-'){
    unit = document.getElementsByClassName('cell-' +(coord_y) + '-' +(FIELD_SIZE_X-1))[0];
}
else if (direction == 'x+'){
    unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (0))[0];
}
else if (direction == 'y+'){
    unit = document.getElementsByClassName('cell-'+ (FIELD_SIZE_Y-1) + '-' + (coord_x))[0];
}
else if (direction == 'y-'){
    unit = document.getElementsByClassName('cell-'+ (0) + '-' + (coord_x))[0];
}
return unit;
}

/**
 * Функция проверки, не врезались ли мы в преграду
 * @param unit
 */
function pathClear(unit){
    var check = false;
    var unit_classes = unit.getAttribute('class').split(' ');
    if(!unit_classes.includes('problem-unit')){
        check = true;
    }
    return check;
}

/**
 * Проверка на змейку
 * @param unit
 * @returns {boolean}
 */
function isSnakeUnit(unit) {//проверка, что змейка не попала сама в себя в новой ячейке
    var check = false;

    if (snake.includes(unit)) {//если в змейке содержится новая ячейка, значит возникло пересечение
        check = true;
    }
    return check;
}
/**
 * проверка на еду
 * @param unit
 * @returns {boolean}
 */
function haveFood(unit) {
    var check = false;

    var unit_classes = unit.getAttribute('class').split(' ');

    // Если еда
    if (unit_classes.includes('food-unit')) {
        check = true;
        createFood();
        score++;
        points.innerHTML = score;
    }
    return check;
}

/**
 * Создание еды
 */
function createFood() {
    var foodCreated = false;
    console.log("createFood1");
    while (!foodCreated) { //пока еду не создали
        // рандом
        console.log("createFood2");
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        var food_cell_classes = food_cell.getAttribute('class').split(' ');

        // проверка на змейку
        if (!food_cell_classes.includes('snake-unit') && !food_cell_classes.includes('problem-unit')) {
            var classes = '';
            for (var i = 0; i < food_cell_classes.length; i++) {
                classes += food_cell_classes[i] + ' ';
            }

            food_cell.setAttribute('class', classes + 'food-unit');
            foodCreated = true;
        }
    }
}

/* problem-unit
 * Функция созданяи препятствий-проблем для нашей змейки
 */
function createProblem() {
    console.log("createProblem1");
    var createProblem = false;
    while (!createProblem) {        //пока препятствие-проблема не создали
        // рандом
        console.log("createProblem2");
        var problem_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var problem_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var problem_cell = document.getElementsByClassName('cell-' + problem_y + '-' + problem_x)[0];
        var problem_cell_classes = problem_cell.getAttribute('class').split(' ');

        // проверка на змейку
        if ((!problem_cell_classes.includes('snake-unit')) && !problem_cell_classes.includes("food-unit")) {
            console.log("createProblem3");
            var classes1 = '';
            for (var i = 0; i < problem_cell_classes.length; i++) {
                classes1 += problem_cell_classes[i] + ' ';
            }

            problem_cell.setAttribute('class', classes1 + 'problem-unit');
            createProblem = true;
        }
    }

}

/**
 * Изменение направления движения змейки
 * @param e - событие
 */
function changeDirection(e) {
    console.log(e);
	
	switch (e.keyCode) {
        case 37: // Клавиша влево
            if (direction != 'x+') {
                direction = 'x-'
            }
            break;
        case 38: // Клавиша вверх
            if (direction != 'y-') {
                direction = 'y+'
            }
            break;
        case 39: // Клавиша вправо
            if (direction != 'x-') {
                direction = 'x+'
            }
            break;
        case 40: // Клавиша вниз
            if (direction != 'y+') {
                direction = 'y-'
            }
            break;
    }
}

/**
 * Функция завершения игры
 */
function finishTheGame() {
    gameIsRunning = false;
    clearInterval(snake_timer);
    clearInterval(food_timer);
    clearInterval(problem_timer);
    alert('Вы проиграли! Ваш результат: ' + score.toString());
}

/**
 * Новая игра
 */
function refreshGame() {
    location.reload();
}

// Инициализация
window.onload = init;