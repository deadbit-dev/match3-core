/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-interface */
// направление движения при сложении ячеек(а также падение новых - анимации на клиенте)
enum MoveDirection {
    Up,
    Down,
    Left,
    Right,
    None
}

// набор возможных свойств клетки
enum CellType {
    Base,
    ActionLocked,
    NotMoved,
    Locked,
    Disabled,
    Wall
}

// тип комбинации
enum CombinationType {
    Comb3,
    Comb4,
    Comb5,
    Comb3x3,
    Comb3x4,
    Comb3x5,
}

// маски комбинации, для проверки надо также вращать(90,180,270)
// но для оптимизаций те маски, которые имеют размерность 1, т.е.: 3,4,5 вращаем только на 90
const CombinationMasks = [
    // 3
    [
        [1, 1, 1]
    ],
    // 4
    [
        [1, 1, 1, 1]
    ],
    // 5
    [
        [1, 1, 1, 1, 1]
    ],
    // 3x3
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 1]
    ],
    // 3x3
    [
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1]
    ],
    // 3x3
    [
        [0, 0, 1],
        [0, 0, 1],
        [1, 1, 1]
    ],

    // 3x4
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 1]
    ],
    // 3x4
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 1]
    ],
    // 3x5
    [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1]
    ]
];

// описание свойств клетки
interface Cell {
    id: number;
    type: number; // маска свойств
    is_active: boolean;
    cnt_acts?: number; // число активаций которое произошло(при реакции в качестве соседней клетки + условие наличия флага ActionLocked)
    cnt_acts_req?: number; // если маска содержит свойство ActionLocked то это число требуемых активаций
    data?: any;
}

// классификаторы элементов
interface DcElement {
    index: number;
    is_move: boolean;
    is_click: boolean;
    data?: any;
}

// вместо null для пустоты
const NullElement = 0;
// непосредственно элемент
interface Element {
    id: number;
    dc_element: number;
    data?: any;
}

// используется для информации о элементе/клетке
interface ItemInfo {
    x: number;
    y: number;
    id: number;
}

interface DamagedInfo {
    x: number;
    y: number;
    element: Element;
}

// информация о ходе
interface StepInfo {
    from_x: number;
    from_y: number;
    to_x: number;
    to_y: number;
}

// описание игровых данных для импорта/экспорта
interface GameState {
    // todo
}

enum ProcessMode {
    Combinate,   // обработка соединений
    MoveElements // обработка перемещений после того как образовались дыры при комбинации
}

type FncIsCanMove = (from_x: number, from_y: number, to_x: number, to_y: number) => boolean;
type FncOnCombinated = (combined_element: ItemInfo, elements: ItemInfo[], combination_type: CombinationType, combination_angle: number) => void;
type FncObNearActivation = (elements: ItemInfo[]) => void;
type FncIsCombined = (e1: Element, e2: Element) => boolean;
type FncOnCellActivated = (cell: ItemInfo) => void;
type FncOnDamagedElement = (info: DamagedInfo) => void;


function Match3(size_x: number, size_y: number) {
    // откуда идет сложение ячеек, т.е. при образовании пустоты будут падать сверху вниз
    let move_direction = MoveDirection.Up;
    // наши все клетки, полностью заполненная прямоугольная/квадратная структура
    const cells: Cell[][] = [];
    // классификаторы элементов
    const dc_elements: { [id: number]: DcElement } = {};
    // непосредственно игровые элементы
    const elements: (Element | typeof NullElement)[][] = [];

    // кастомные колбеки 
    let cb_is_can_move: FncIsCanMove;
    let cb_on_combinated: FncOnCombinated;
    let cb_ob_near_activation: FncObNearActivation;
    let cb_is_combined_elements: FncIsCombined;
    let cb_on_cell_activated: FncOnCellActivated;
    let cb_on_damaged_element: FncOnDamagedElement;
    
    function init() {
        // заполняем массив cells с размерностью size_x, size_y с порядком: cells[y][x] is_active false, типа пустое поле
        // а также массив elements с размерностью size_x, size_y и значением NullElement
        for(let y = 0; y < size_y; y++) {
            cells[y] = [];
            elements[y] = [];
            for(let x = 0; x < size_x; x++) {
                cells[y][x] = {
                    id: y * size_x + x,
                    type: CellType.Base,
                    is_active: false
                };

                elements[y][x] = NullElement;
            }
        }
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    // возвращает массив всех рабочих комбинаций в данном игровом состоянии
    function get_all_combinations() {
        // todo...
        // комбинации проверяются через сверку масок по всему игровому полю
        // чтобы получить что вся комбинация работает нам нужно все элементы маски взять и пройтись правилом
        // is_combined_elements, при этом допустим у нас комбинация Comb4, т.е. 4 подряд элемента должны удовлетворять правилу
        // мы можем не каждый с каждым чекать, а просто сверять 1x2, 2x3, 3x4 т.е. вызывать функцию is_combined_elements с такими вот парами, 
        // надо прикинуть вроде ведь не обязательно делать все переборы, если че потом будет несложно чуть изменить, но для оптимизации пока так
    }

    // базовая функция проверки могут ли участвовать в комбинации два элемента 
    function is_combined_elements_base(e1: Element, e2: Element) {
        // todo...
        // как пример грубая проверка что классификатор элементов одинаковый
        // либо индекс внутри классификатора одинаковый, это для случая например собираем зеленые ячейки две, а третья тоже зеленая, но с горизонтальным взрывом
        // т.е. визуально и по классификатору она другая, но по индексу она одинаковая, как раз он и нужен для проверки принадлежности к одной группе
        return e1.dc_element == e2.dc_element || (dc_elements[e1.dc_element] && dc_elements[e2.dc_element] && dc_elements[e1.dc_element].index == dc_elements[e2.dc_element].index);
    }

    // функция проверки могут ли участвовать в комбинации два элемента 
    function is_combined_elements(e1: Element, e2: Element) {
        if (cb_is_combined_elements)
            return cb_is_combined_elements(e1, e2);
        else
            return is_combined_elements_base(e1, e2);
    }

    // задаем кастомный колбек для проверки могут ли участвовать в комбинации два элемента
    function set_callback_is_combined_elements(fnc: FncIsCombined) {
        cb_is_combined_elements = fnc;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    // базовая реализация, которая должна стандартными правилами разрешать перемещение если собирается комбинация
    function is_can_move_base(from_x: number, from_y: number, to_x: number, to_y: number) {
        // todo...
        // логика тут в том что мы делаем пробное перемещение элементов, а затем получаем все возможные комбинации (get_all_combinations)
        // затем смотрим присутствует ли среди них комбинация хоть с одним из элементов, который был в позиции from_x, from_y или to_x, to_y
        return false;
    }

    // функция проверки можно ли переместить элемент
    // но перед вызовом этой функции сначала проверяются ограничения клеток
    function is_can_move(from_x: number, from_y: number, to_x: number, to_y: number) {
        if (cb_is_can_move)
            return cb_is_can_move(from_x, from_y, to_x, to_y);
        else
            return is_can_move_base(from_x, from_y, to_x, to_y);
    }

    // задаем кастомный колбек для проверки можно ли переместить
    function set_callback_is_can_move(fnc: FncIsCanMove) {
        cb_is_can_move = fnc;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    // базовая обработка при комбинации
    function on_base_combined(combined_element: ItemInfo, elements: ItemInfo[], combination_type: CombinationType, combination_angle: number) {
        // todo...
        // сначала вызываем для каждого try_damage_element затем удаляем все элементы с массива
        // тут важно учесть что т.к. сначала вызвали try_damage_element то в этот момент при большом сборе будет образовываться новый элемент на поле,
        // соответственно нам нужно удалить все элементы не просто с массива elements, но и проверив что id у них не изменился, чтобы случайно не удалить новый созданный
    }

    // обработка действия когда сработала комбинация 
    // элемент который сдвинулся(он нужен для того чтобы например при образовании пары из 4х элементов понять в каком месте образовался другой элемент)
    // и массив элементов которые задействованы
    function on_combinated(combined_element: ItemInfo, elements: ItemInfo[], combination_type: CombinationType, combination_angle: number) {
        // todo...
        if (cb_on_combinated)
            return cb_on_combinated(combined_element, elements, combination_type, combination_angle);
        else
            return on_base_combined(combined_element, elements, combination_type, combination_angle);
    }

    // Задаем кастомный колбек для обработки комбинации
    function set_callback_on_combinated(fnc: FncOnCombinated) {
        cb_on_combinated = fnc;
    }

    // попытка нанести урон элементу, смысл в том чтобы вызвать колбек активации, при этом только 1 раз за жизнь элемента
    // при успехе вызываем колбек cb_on_damaged_element 
    function try_damage_element(damaged_info: DamagedInfo) {
        // todo...
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    function on_near_activation_base(items: ItemInfo[]) {
        // если клетка из массива содержит флаг ActionLocked то увеличиваем счетчик cnt_acts
        // а когда он достигнет cnt_acts_req то вызываем событие cb_on_cell_activated
        items.forEach(item => {
            const cell = cells[item.x][item.y];
            if (cell.type != CellType.ActionLocked) return;
            if (cell.cnt_acts) cell.cnt_acts++;
            if (cell.cnt_acts != cell.cnt_acts_req) return;
            if (cb_on_cell_activated != null) cb_on_cell_activated(item);
        });
    }

    // задаем колбек для обработки ячеек, возле которых была активация комбинации
    function set_callback_ob_near_activation(fnc: FncObNearActivation) {
        cb_ob_near_activation = fnc;
    }

    // Задаем кастомный колбек для обработки события активации клетки
    function set_callback_on_cell_activated(fnc: FncOnCellActivated) {
        cb_on_cell_activated = fnc;
    }
    
    // список клеток возле которых произошла активация комбинации или удаление элемента
    function on_near_activation(cells: ItemInfo[]) {
        if (cb_ob_near_activation != null) return cb_ob_near_activation(cells);
        else on_near_activation_base(cells);
    }

    //-----------------------------------------------------------------------------------------------------------------------------------

    // сохранение состояния игры
    function save_state(): GameState {
        // todo...
        return {};
    }

    // загрузить состояние игры
    function load_state(state: GameState) {
        // todo...
    }

    // возвращает массив свободных клеток
    function get_free_cells(): ItemInfo[] {
        // todo...
        // возвращается инфа только если клетка is_active и на ней ничего нет
        return [];
    }

    // добавляет элемент на поле
    function set_element(x: number, y: number, element: Element) {
        elements[y][x] = element;
    }

    // удаляет элемент с поля (метод нужен для вызова логики бустеров каких-то)
    function remove_element(x: number, y: number, is_damagind: boolean, is_near_activation: boolean) {
        // todo...
        // удаляем элемент с массива и вызываем try_damage_element если is_damagind = true
        //  и вызываем on_near_activation для соседей если свойство is_near_activation = true
    }

    // задает клетку
    function set_cell(x: number, y: number, cell: Cell) {
        cells[y][x] = cell;
    }

    function set_dc_element(id: number, element: DcElement) {
        dc_elements[id] = element;
    }

    // возвращает массив всех возможных ходов(для подсказок например)
    function get_all_available_steps(): StepInfo[] {
        // todo...
        return [];
    }


    // ввод пользователя на перемещение элементов
    // на основе ограничений клетки, а также на соответствущее разрешение перемещения у элемента(is_move) 
    // возвращает результат если успех, то уже применен ход (т.е. элементы перемещен и поменялся местами)
    function try_move(from_x: number, from_y: number, to_x: number, to_y: number) {
        // todo...
        return false;
    }

    // ввод пользователя на клик элемента
    // по идее тут проверяем на базовые правила доступности клика на основе ограничений клетки, а также на соответствущее разрешение клика у элемента(is_click) 
    // ничего больше не делаем, т.е. не удаляем и т.п.
    function try_click(x: number, y: number) {
        // todo...
        return false;
    }

    // вызываем шаг обработки текущего состояния игры
    // mode = Combinate: т.е. выполняет поиск всех комбинаций и вызываются методы on_combinated и on_near_activation 
    // возвращает истину если хоть одна комбинация активирована, по хорошему тут логика должна быть такая что если например   
    // mode = MoveElements: производит смещение элементов после образования дыр при комбинации например
    // возвращает истину если смещение произведено
    function process_state(mode: ProcessMode) {
        // todo...
        return false;
    }





    return {
        init, is_can_move_base, set_callback_is_can_move, save_state, load_state, get_free_cells, set_element, set_cell, set_dc_element,
        on_base_combined, set_callback_on_combinated, set_callback_ob_near_activation, set_callback_is_combined_elements, is_combined_elements_base,
        get_all_combinations, set_callback_on_cell_activated, on_base_near_activation,
        try_move, try_click, process_state, get_all_available_steps, remove_element
    };
}


/*
порядок работы примерно такой:
const game = Match3(10,10);
game.init();
set_dc_element, set_cell, set_element

и цикл примерно такой извне приходит:
    if try_move:
        while (process_state(Combinate))
            process_state(MoveElements)
*/