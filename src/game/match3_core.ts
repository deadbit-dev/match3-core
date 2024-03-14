/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { is_valid_pos, rotate_matrix_90 } from "../utils/math_utils";

// тип комбинации
export enum CombinationType {
    Comb3,
    Comb4,
    Comb5,
    Comb2x2,
    Comb3x3a,
    Comb3x3b,
    Comb3x4,
    Comb3x5
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
    // 2x2
    [
        [1, 1],
        [1, 1]
    ],
    // 3x3a
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 1]
    ],
    // 3x3b
    [
        [1, 0, 0],
        [1, 0, 0],
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

export interface CombinationInfo {
    elements: ItemInfo[];
    type: CombinationType;
    angle: number;
}

// набор возможных свойств клетки
export enum CellType {
    Base,
    ActionLocked,
    ActionLockedNear,
    NotMoved,
    Locked,
    Disabled
}

// вместо null для неактивной клетки
export const NotActiveCell = -1;

// описание свойств клетки
export interface Cell {
    id: number;
    uid: number;
    type: number; // маска свойств
    cnt_acts?: number; // число активаций которое произошло(при реакции в качестве соседней клетки + условие наличия флага ActionLocked)
    cnt_near_acts?: number; // если маска содержит свойство ActionLocked то это число требуемых активаций
    data?: any;
}

// классификаторы элементов
export interface ElementType {
    index: number;
    is_movable: boolean;
    is_clickable: boolean;
    data?: any;
}

// вместо null для пустоты
export const NullElement = -1;

// непосредственно элемент
export interface Element {
    uid: number;
    type: number;
    data?: any;
}

// используется для информации о элементе/клетке
export interface ItemInfo {
    x: number;
    y: number;
    uid: number;
}

// информация о ходе
export interface StepInfo {
    from_x: number;
    from_y: number;
    to_x: number;
    to_y: number;
}

export enum MoveType {
    Swaped,
    Falled,
    Requested,
    Filled
}

// FIXME: extends of ItemInfo, beacause from_x and from_y dont used anyway!
export interface MovedInfo {
    points: [{to_x: number, to_y: number, type: MoveType}];
    data: Element;
}

// описание игровых данных для импорта/экспорта
export interface GameState {
    cells: (Cell | typeof NotActiveCell)[][]; // наши все клетки, полностью заполненная прямоугольная/квадратная структура
    element_types: {[id: number]: ElementType}; // классификаторы элементов
    elements: (Element | typeof NullElement)[][]; // непосредственно игровые элементы
}

export enum ProcessMode {
    Combinate,   // обработка соединений
    MoveElements // обработка перемещений после того как образовались дыры при комбинации
}

type FncIsCanMove = (from_x: number, from_y: number, to_x: number, to_y: number) => boolean;
type FncOnCombinated = (combined_element: ItemInfo, combination: CombinationInfo) => void;
type FncOnNearActivation = (items: ItemInfo[]) => void;
type FncOnCellActivation = (cell: ItemInfo) => void;
type FncOnCellActivated = (cell: ItemInfo) => void;
type FncIsCombined = (e1: Element, e2: Element) => boolean;
type FncOnDamagedElement = (item: ItemInfo) => void;
type FncOnMoveElement = (from_x: number, from_y: number, to_x: number, to_y: number, element: Element) => void;
type FncOnMovedElements = (elements: MovedInfo[], state: GameState) => void;
type FncOnRequestElement = (x: number, y: number) => Element | typeof NullElement;


export function Field(size_x: number, size_y: number, complex_process_move = true) {
    // откуда идет сложение ячеек, т.е. при образовании пустоты будут падать сверху вниз
    
    let state: GameState = {
        cells: [],
        element_types: {},
        elements: []
    };
    
    const moved_elements: MovedInfo[] = [];
    const damaged_elements: number[] = [];

    // кастомные колбеки 
    let cb_is_can_move: FncIsCanMove;
    let cb_on_combinated: FncOnCombinated;
    let cb_is_combined_elements: FncIsCombined;
    let cb_on_near_activation: FncOnNearActivation;
    let cb_on_cell_activation: FncOnCellActivation;
    let cb_on_cell_activated: FncOnCellActivated;
    let cb_on_damaged_element: FncOnDamagedElement;
    let cb_on_move_element: FncOnMoveElement;
    let cb_on_moved_elements: FncOnMovedElements;
    let cb_on_request_element: FncOnRequestElement;

    function init() {
        // заполняем массив cells с размерностью size_x, size_y с порядком: cells[y][x] is_active false, типа пустое поле
        // а также массив elements с размерностью size_x, size_y и значением NullElement
        for(let y = 0; y < size_y; y++) {
            state.cells[y] = [];
            state.elements[y] = [];
            for(let x = 0; x < size_x; x++) {
                state.cells[y][x] = NotActiveCell;
                state.elements[y][x] = NullElement;
            }
        }
    }

    function is_unique_element_combination(element: Element, combinations: CombinationInfo[]) {
        for(const comb of combinations) {
            for(const elem of comb.elements) {
                if(elem.uid == element.uid) return false;
            }
        }

        return true;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    // возвращает массив всех рабочих комбинаций в данном игровом состоянии
    function get_all_combinations(): CombinationInfo[] {
        // комбинации проверяются через сверку масок по всему игровому полю
        // чтобы получить что вся комбинация работает нам нужно все элементы маски взять и пройтись правилом
        // is_combined_elements, при этом допустим у нас комбинация Comb4, т.е. 4 подряд элемента должны удовлетворять правилу
        // мы можем не каждый с каждым чекать, а просто сверять 1x2, 2x3, 3x4 т.е. вызывать функцию is_combined_elements с такими вот парами, 
        // надо прикинуть вроде ведь не обязательно делать все переборы, если че потом будет несложно чуть изменить, но для оптимизации пока так

        const combinations: CombinationInfo[] = [];
        // проходимся по всем маскам с конца
        for(let mask_index = CombinationMasks.length - 1; mask_index >= 0; mask_index--) {
            let mask = CombinationMasks[mask_index];

            // оптимизация для одноразмерных масок
            let is_one_row_mask = false;
            switch(mask_index) {
                case CombinationType.Comb3:
                case CombinationType.Comb4:
                case CombinationType.Comb5:
                    is_one_row_mask = true;
                break;
            }

            let angle = 0;
            const max_angle = is_one_row_mask ? 90 : 270;
            while(angle <= max_angle) {
                // проход по полю
                for(let y = 0; y + mask.length <= size_y; y++) {
                    for(let x = 0; x + mask[0].length <= size_x; x++) {
                        const combination = {} as CombinationInfo;
                        combination.elements = [];
                        combination.angle = angle;
                        
                        let is_combined = true;
                        let last_element: Element | typeof NullElement = NullElement;
                        
                        // проходимся маской по элементам
                        for(let i = 0; i < mask.length && is_combined; i++) {
                            for(let j = 0; j < mask[0].length && is_combined; j++) {
                                if(mask[i][j] == 1) {
                                    const cell = get_cell(x+j, y+i);
                                    const element = get_element(x+j, y+i);
                                    
                                    if(cell == NotActiveCell || !is_available_cell_type_for_activation(cell) || element == NullElement) {
                                        is_combined = false;
                                        break;
                                    }

                                    // проверка на участие элемента в предыдущих комбинациях
                                    if(!is_unique_element_combination(element, combinations)) {
                                        is_combined = false;
                                        break;
                                    }
                                    
                                    combination.elements.push({
                                        x: x+j,
                                        y: y+i,
                                        uid: (element).uid
                                    });

                                    if(last_element != NullElement) {
                                        is_combined = is_combined_elements(last_element, element);
                                    }

                                    last_element = element;
                                }
                            }
                        }

                        if(is_combined) {
                            combination.type = mask_index as CombinationType;
                            combinations.push(combination);
                        }
                    }
                }
                
                mask = rotate_matrix_90(mask);
                angle +=90;
            }
        }

        return combinations;
    }

    // базовая функция проверки могут ли участвовать в комбинации два элемента 
    function is_combined_elements_base(e1: Element, e2: Element) {
        // как пример грубая проверка что классификатор элементов одинаковый
        // либо индекс внутри классификатора одинаковый, это для случая например собираем зеленые ячейки две, а третья тоже зеленая, но с горизонтальным взрывом
        // т.е. визуально и по классификатору она другая, но по индексу она одинаковая, как раз он и нужен для проверки принадлежности к одной группе
        return e1.type == e2.type || (state.element_types[e1.type] && state.element_types[e2.type] && state.element_types[e1.type].index == state.element_types[e2.type].index);
    }

    // задаем кастомный колбек для проверки могут ли участвовать в комбинации два элемента
    function set_callback_is_combined_elements(fnc: FncIsCombined) {
        cb_is_combined_elements = fnc;
    }
    
    // функция проверки могут ли участвовать в комбинации два элемента 
    function is_combined_elements(e1: Element, e2: Element) {
        if(cb_is_combined_elements != null) return cb_is_combined_elements(e1, e2);
        else return is_combined_elements_base(e1, e2);
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    // базовая реализация, которая должна стандартными правилами разрешать перемещение если собирается комбинация
    function is_can_move_base(from_x: number, from_y: number, to_x: number, to_y: number) {
        // логика тут в том что мы делаем пробное перемещение элементов, а затем получаем все возможные комбинации (get_all_combinations)
        // затем смотрим присутствует ли среди них комбинация хоть с одним из элементов, который был в позиции from_x, from_y или to_x, to_y
       
        const cell_from = get_cell(from_x, from_y);
        if(cell_from == NotActiveCell || !is_available_cell_type_for_move(cell_from)) return false;
        
        const cell_to = get_cell(to_x, to_y);
        if(cell_to == NotActiveCell || !is_available_cell_type_for_move(cell_to)) return false;
        
        const element_from = get_element(from_x, from_y);
        if(element_from == NullElement) return false;

        const element_type_from = state.element_types[element_from.type];
        if(!element_type_from.is_movable) return false;

        const element_to = get_element(to_x, to_y);
        if(element_to != NullElement) {
            const element_type_to = state.element_types[element_from.type];
            if(!element_type_to.is_movable) return false;
        }

        swap_elements(from_x, from_y, to_x, to_y);

        let was = false;
        const combinations = get_all_combinations();
        
        for(const combination of combinations) {
            for(const element of combination.elements) {
                const is_from = element.uid == element_from.uid; 
                const is_to = element_to != NullElement && element_to.uid == element.uid; 
                if(is_from || is_to) {
                    was = true;
                    break;
                }
            }
            if(was) break;
        }

        swap_elements(from_x, from_y, to_x, to_y);

        return was;
    }

    // функция проверки можно ли переместить элемент
    // но перед вызовом этой функции сначала проверяются ограничения клеток
    function is_can_move(from_x: number, from_y: number, to_x: number, to_y: number) {
        if(cb_is_can_move != null) return cb_is_can_move(from_x, from_y, to_x, to_y);
        else return is_can_move_base(from_x, from_y, to_x, to_y);
    }

    // задаем кастомный колбек для проверки можно ли переместить
    function set_callback_is_can_move(fnc: FncIsCanMove) {
        cb_is_can_move = fnc;
    }

    function on_move_element(from_x: number, from_y: number, to_x: number, to_y: number, element: Element) {
        if(cb_on_move_element != null) return cb_on_move_element(from_x, from_y, to_x, to_y, element);
    }

    function set_callback_on_move_element(fnc: FncOnMoveElement) {
        cb_on_move_element = fnc;
    }

    function on_moved_elements(elements: MovedInfo[], state: GameState) {
        if(cb_on_moved_elements != null) return cb_on_moved_elements(elements, state);
    }

    function set_callback_on_moved_elements(fnc: FncOnMovedElements) {
        cb_on_moved_elements = fnc;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    // базовая обработка при комбинации
    function on_combined_base(combined_element: ItemInfo, combination: CombinationInfo) {
        // сначала вызываем для каждого try_damage_element затем удаляем все элементы с массива
        // тут важно учесть что т.к. сначала вызвали try_damage_element то в этот момент при большом сборе будет образовываться новый элемент на поле,
        // соответственно нам нужно удалить все элементы не просто с массива elements, но и проверив что id у них не изменился, чтобы случайно не удалить новый созданный
        for(const item of combination.elements) {
            const cell = get_cell(item.x, item.y);
            const element = get_element(item.x, item.y);
            if(cell != NotActiveCell && element != NullElement && element.uid == item.uid) {
                on_cell_activation({x: item.x, y: item.y, uid: cell.uid});
                on_near_activation(get_neighbor_cells(item.x, item.y));
                if(try_damage_element(item)) {
                    set_element(item.x, item.y, NullElement);
                    damaged_elements.splice(damaged_elements.findIndex((elem) => elem == element.uid), 1);
                }
            }
        }
    }

    // Задаем кастомный колбек для обработки комбинации
    function set_callback_on_combinated(fnc: FncOnCombinated) {
        cb_on_combinated = fnc;
    }

    // обработка действия когда сработала комбинация 
    // элемент который сдвинулся(он нужен для того чтобы например при образовании пары из 4х элементов понять в каком месте образовался другой элемент)
    // и массив элементов которые задействованы
    function on_combinated(combined_element: ItemInfo, combination: CombinationInfo) {
        if(cb_on_combinated != null) return cb_on_combinated(combined_element, combination);
        else return on_combined_base(combined_element, combination);
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    function set_callback_on_damaged_element(fnc: FncOnDamagedElement) {
        cb_on_damaged_element = fnc;
    }

    // попытка нанести урон элементу, смысл в том чтобы вызвать колбек активации, при этом только 1 раз за жизнь элемента
    // при успехе вызываем колбек cb_on_damaged_element 
    function try_damage_element(item: ItemInfo) {
        if(damaged_elements.find((element) => element == item.uid) == undefined) {
            damaged_elements.push(item.uid);
            if(cb_on_damaged_element != null) cb_on_damaged_element(item);
            return true;
        }

        return false;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    function on_near_activation_base(items: ItemInfo[]) {
        // если клетка из массива содержит флаг ActionLockedNear то увеличиваем счетчик cnt_near_acts и вызываем событие cb_on_cell_activated
        for(const item of items) {
            const cell = get_cell(item.x, item.y);
            if(cell != NotActiveCell && (bit.band(cell.type, CellType.ActionLockedNear) == CellType.ActionLockedNear) && cell.cnt_near_acts != undefined) {
                cell.cnt_near_acts++;
                if(cb_on_cell_activated != undefined) cb_on_cell_activated(item);
            }
        }
    }

    // задаем колбек для обработки ячеек, возле которых была активация комбинации
    function set_callback_on_near_activation(fnc: FncOnNearActivation) {
        cb_on_near_activation = fnc;
    }
    
    // список клеток возле которых произошла активация комбинации или удаление элемента
    function on_near_activation(cells: ItemInfo[]) {
        if (cb_on_near_activation != null) return cb_on_near_activation(cells);
        else on_near_activation_base(cells);
    }
    
    function on_cell_activation_base(item: ItemInfo) {
        let activated = false;

        const cell = get_cell(item.x, item.y);
    
        if(cell != NotActiveCell && (bit.band(cell.type, CellType.ActionLocked) == CellType.ActionLocked) && cell.cnt_acts != undefined) {
            cell.cnt_acts++;
            activated = true;
        }

        if(cell != NotActiveCell && (bit.band(cell.type, CellType.ActionLockedNear) == CellType.ActionLockedNear) && cell.cnt_near_acts != undefined) {
            cell.cnt_near_acts++;
            activated = true;
        }
        
        if(activated && cb_on_cell_activated != undefined) cb_on_cell_activated(item);
    }

    function set_callback_on_cell_activation(fnc: FncOnCellActivation) {
        cb_on_cell_activation = fnc;
    }
    
    function on_cell_activation(item: ItemInfo) {
        if (cb_on_cell_activation != null) return cb_on_cell_activation(item);
        else on_cell_activation_base(item);
    }

    // Задаем кастомный колбек для обработки события активации клетки
    function set_callback_on_cell_activated(fnc: FncOnCellActivated) {
        cb_on_cell_activated = fnc;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    function on_request_element(x: number, y: number) : Element | typeof NullElement {
        if(cb_on_request_element != null) return cb_on_request_element(x, y);
        return NullElement;                         
    }

    function set_callback_on_request_element(fnc: FncOnRequestElement) {
        cb_on_request_element = fnc;
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // возвращает массив свободных клеток
    function get_free_cells(): ItemInfo[] {
        const free_cells: ItemInfo[] = []; 
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                const cell = get_cell(x, y);
                if(cell != NotActiveCell && get_element(x, y) == NullElement) {
                    free_cells.push({x, y, uid: cell.uid});
                }
            }
        }

        return free_cells;
    }
    
    function get_all_elements_by_type(element_type: number) {
        const target_elements: ItemInfo[] = []; 
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                const cell = get_cell(x, y);
                const element = get_element(x, y);
                if(cell != NotActiveCell && is_available_cell_type_for_move(cell) && element != NullElement && element.type == element_type) {
                    target_elements.push({x, y, uid: element.uid});
                }
            }
        }

        return target_elements;
    }
    
    // задает клетку
    function set_cell(x: number, y: number, cell: Cell | typeof NotActiveCell) {
        state.cells[y][x] = cell;
    }

    function get_cell(x: number, y: number): Cell | typeof NotActiveCell {
        return state.cells[y][x];
    }
    
    function set_element_type(id: number, element_type: ElementType) {
        state.element_types[id] = element_type;
    }
    
    // добавляет элемент на поле
    function set_element(x: number, y: number, element: Element | typeof NullElement) {
        state.elements[y][x] = element;
    }
    
    function get_element(x: number, y:number): Element | typeof NullElement {
        return state.elements[y][x];
    }

    function swap_elements(from_x: number, from_y: number, to_x: number, to_y: number) {
        const elements_from = get_element(from_x, from_y); 
        set_element(from_x, from_y, get_element(to_x, to_y));
        set_element(to_x, to_y, elements_from);
    }

    // возвращает соседние клетки
    function get_neighbor_cells(x: number, y: number, mask = [[0, 1, 0,], [1, 1, 1], [0, 1, 0]]) {
        const neighbors: ItemInfo[] = [];

        for (let i = y - 1; i <= y + 1; i++) {
            for (let j = x - 1; j <= x + 1; j++) {
                if (i >= 0 && i < size_y && j >= 0 && j < size_x && mask[i - (y - 1)][j - (x - 1)] == 1) {
                    const cell = get_cell(j, i);
                    if(cell != NotActiveCell) neighbors.push({x: j, y: i, uid: cell.uid});
                }
            }
        }

        return neighbors;
    }
    
    // возвращает соседние элементы
    function get_neighbor_elements(x: number, y: number, mask = [[0, 1, 0,], [1, 0, 1], [0, 1, 0]]) {
        const neighbors: ItemInfo[] = [];

        for (let i = y - 1; i <= y + 1; i++) {
            for (let j = x - 1; j <= x + 1; j++) {
                if (i >= 0 && i < size_y && j >= 0 && j < size_x && mask[i - (y - 1)][j - (x - 1)] == 1) {
                    const element = get_element(j, i);
                    if(element != NullElement) neighbors.push({x: j, y: i, uid: element.uid});
                }
            }
        }

        return neighbors;
    }

    // удаляет элемент с поля (метод нужен для вызова логики бустеров каких-то)
    function remove_element(x: number, y: number, is_damaging: boolean, is_near_activation: boolean) {
        // удаляем элемент с массива и вызываем try_damage_element если is_damaging = true
        // и вызываем on_near_activation для соседей если свойство is_near_activation = true

        const cell = get_cell(x, y);
        if(cell == NotActiveCell) return;

        on_cell_activation({x, y, uid: cell.uid});
        if(is_near_activation) on_near_activation(get_neighbor_cells(x, y));

        if(!is_available_cell_type_for_move(cell)) return;

        const element = get_element(x, y);
        if(element == NullElement) return;

        if(is_damaging && try_damage_element({x, y, uid: element.uid})) {
            damaged_elements.splice(damaged_elements.findIndex((elem) => elem == element.uid), 1);
            set_element(x, y, NullElement);
        }

        return element;
    }

    function is_available_cell_type_for_activation(cell: Cell): boolean {
        const is_disabled = bit.band(cell.type, CellType.Disabled) == CellType.Disabled;
        if(is_disabled) return false;

        return true;
    }

    function is_available_cell_type_for_move(cell: Cell): boolean {
        const is_not_moved = bit.band(cell.type, CellType.NotMoved) == CellType.NotMoved;
        const is_locked = bit.band(cell.type, CellType.Locked) == CellType.Locked;
        const is_disabled = bit.band(cell.type, CellType.Disabled) == CellType.Disabled;
        if(is_not_moved || is_locked || is_disabled) return false;

        return true;
    }

    function is_available_cell_type_for_click(cell: Cell): boolean {
        const is_disabled = bit.band(cell.type, CellType.Disabled) == CellType.Disabled;
        if(is_disabled) return false;

        return true;
    }
    
    // ввод пользователя на перемещение элементов
    // на основе ограничений клетки, а также на соответствущее разрешение перемещения у элемента(is_move) 
    // возвращает результат если успех, то уже применен ход (т.е. элементы перемещен и поменялся местами)
    function try_move(from_x: number, from_y: number, to_x: number, to_y: number) {
        const is_can = is_can_move(from_x, from_y, to_x, to_y);
        if(is_can) {
            swap_elements(from_x, from_y, to_x, to_y);
            
            const element_from = get_element(from_x, from_y);
            if(element_from != NullElement) {
                const index = moved_elements.findIndex((e) => e.data.uid == element_from.uid); 
                if(index == -1) moved_elements.push({points: [{to_x, to_y, type: MoveType.Swaped}], data: element_from});
                else moved_elements[index].points.push({to_x, to_y, type: MoveType.Swaped});
            }
        
            const element_to = get_element(to_x, to_y);
            if(element_to != NullElement) {
                const index = moved_elements.findIndex((e) => e.data.uid == element_to.uid); 
                if(index == -1) moved_elements.push({points: [{to_x: from_x, to_y: from_y, type: MoveType.Swaped}], data: element_to});
                else moved_elements[index].points.push({to_x: from_x, to_y: from_y, type: MoveType.Swaped});
            }
        }

        return is_can; 
    }

    // ввод пользователя на клик элемента
    // по идее тут проверяем на базовые правила доступности клика на основе ограничений клетки, а также на соответствущее разрешение клика у элемента(is_click) 
    // ничего больше не делаем, т.е. не удаляем и т.п.
    function try_click(x: number, y: number) {
        const cell = get_cell(x, y);
        if(cell == NotActiveCell || !is_available_cell_type_for_click(cell)) return false;
        
        const element = get_element(x, y);
        if(element == NullElement) return false;
        
        const element_type = state.element_types[element.type];
        if(!element_type.is_clickable) return false;

        return true;
    }

    function process_combinate() {
        let is_procesed = false;
        for(const combination of get_all_combinations()) {
            let found = false;
            for(const element of combination.elements) {
                for(const moved_element of moved_elements) {
                    if(moved_element.data.uid == element.uid) {
                        on_combinated(element, combination);
                        found = true;
                        break;
                    }
                }
                if(found) break;
            }
            
            if(!found) {
                const element = combination.elements[math.random(0, combination.elements.length - 1)];
                on_combinated(element, combination);
            }

            is_procesed = true;
        }
        
        moved_elements.splice(0, moved_elements.length);
        
        return is_procesed;
    }

    function request_element(x: number, y: number) {
        const element = on_request_element(x, y);
        if(element != NullElement) {
            let j = GAME_CONFIG.movement_to_point ? y - 1 : 0;
            const index = moved_elements.push({points: [{to_x: x, to_y: j, type: MoveType.Requested}], data: element}) - 1;
            while(j++ < y) moved_elements[index].points.push({to_x: x, to_y: j, type: MoveType.Falled});
        }
    }

    function try_move_element_from_up(x: number, y: number) {
        for(let j = y; j >= 0; j--) {
            const cell = get_cell(x, j);
            if(cell != NotActiveCell) {
                if(!is_available_cell_type_for_move(cell)) return false;
                
                const element = get_element(x, j);
                if(element != NullElement) {
                    set_element(x, y, element);
                    set_element(x, j, NullElement);

                    on_move_element(x, j, x, y, element);
                    
                    j = GAME_CONFIG.movement_to_point ? y - 1 : j;

                    while(j++ < y) {
                        const index = moved_elements.findIndex((e) => e.data.uid == element.uid); 
                        if(index == -1) moved_elements.push({points: [{to_x: x, to_y: j, type: MoveType.Falled}], data: element});
                        else moved_elements[index].points.push({to_x: x, to_y: j, type: MoveType.Falled});
                    }
                    
                    return true;
                }
            }
        }

        request_element(x, y);
        return true;
    }
    
    function try_move_element_from_corners(x: number, y: number) {
        const neighbor_cells = get_neighbor_cells(x, y, [
            [1, 0, 1],
            [0, 0, 0],
            [0, 0, 0]
        ]);

        for(const neighbor_cell of neighbor_cells) {
            const cell = get_cell(neighbor_cell.x, neighbor_cell.y);
            if(cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                const element = get_element(neighbor_cell.x, neighbor_cell.y);
                if(element != NullElement) {
                    set_element(x, y, element);
                    set_element(neighbor_cell.x, neighbor_cell.y, NullElement);

                    on_move_element(neighbor_cell.x, neighbor_cell.y, x, y, element);

                    const index = moved_elements.findIndex((e) => e.data.uid == element.uid); 
                    if(index == -1) moved_elements.push({points: [{to_x: x, to_y: y, type: MoveType.Filled}], data: element});
                    else moved_elements[index].points.push({to_x: x, to_y: y, type: MoveType.Filled});

                    return true;
                }
            }
        }

        return false;
    }

    function process_falling() {
        let is_procesed = false;
        for(let y = size_y - 1; y >= 0; y--) {
            for(let x = 0; x < size_x; x++) {
                const cell = get_cell(x, y);
                const element = get_element(x, y);
                if((element == NullElement) && (cell != NotActiveCell) && is_available_cell_type_for_move(cell)) {
                    try_move_element_from_up(x, y);
                    is_procesed = true;
                }
            }
        }

        return is_procesed;
    }

    function process_filling() {
        for(let y = size_y - 1; y >= 0; y--) {
            for(let x = 0; x < size_x; x++) {
                const cell = get_cell(x, y);
                const element = get_element(x, y);
                if((element == NullElement) && (cell != NotActiveCell) && is_available_cell_type_for_move(cell)) {
                    if(try_move_element_from_corners(x, y)) return true;
                }
            }
        }

        return false;
    }

    function process_move() {
        const is_procesed = process_falling();
        
        if(complex_process_move) {
            while(process_filling())
                process_falling();
        }

        // FIXME: one state ? write element data into the messsage or send message on each falling
        if(is_procesed) on_moved_elements(Object.assign([], moved_elements), save_state());
        return is_procesed;
    }

    // вызываем шаг обработки текущего состояния игры
    // mode = Combinate: т.е. выполняет поиск всех комбинаций и вызываются методы on_combinated и on_near_activation 
    // возвращает истину если хоть одна комбинация активирована, по хорошему тут логика должна быть такая что если например   
    // mode = MoveElements: производит смещение элементов после образования дыр при комбинации например
    // возвращает истину если смещение произведено
    function process_state(mode: ProcessMode) {
        switch(mode) {
            case ProcessMode.Combinate: return process_combinate();
            case ProcessMode.MoveElements: return process_move();
        }
    }

    // сохранение состояния игры
    function save_state(): GameState {
        const st: GameState = {
            cells: [],
            element_types: state.element_types,
            elements: []
        };

        for(let y = 0; y < size_y; y++) {
            st.cells[y] = [];
            st.elements[y] = [];
            
            for(let x = 0; x < size_x; x++) {
                st.cells[y][x] = state.cells[y][x];
                st.elements[y][x] = state.elements[y][x];
            }
        }

        const copy_state = json.decode(json.encode(st)) as GameState;
        for(const [key, value] of Object.entries(copy_state.element_types)) {
            const id = tonumber(key);
            if(id != undefined) copy_state.element_types[id] = value;
        }
    
        return copy_state;
    }

    // загрузить состояние игры
    function load_state(st: GameState) {
        state.element_types = st.element_types;

        for(let y = 0; y < size_y; y++) {
            state.cells[y] = [];
            state.elements[y] = [];
            
            for(let x = 0; x < size_x; x++) {
                state.cells[y][x] = st.cells[y][x];
                state.elements[y][x] = st.elements[y][x];
            }
        }
    }
    
    // возвращает массив всех возможных ходов(для подсказок например)
    function get_all_available_steps(): StepInfo[] {
        const steps: StepInfo[] = [];
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                if(is_valid_pos(x + 1, y, size_x, size_y) && is_can_move(x, y, x + 1, y))
                    steps.push({from_x: x, from_y: y, to_x: x + 1, to_y: y});
                if(is_valid_pos(x, y + 1, size_x, size_y) && is_can_move(x, y, x, y + 1))
                    steps.push({from_x: x, from_y: y, to_x: x, to_y: y + 1});
            }
        }

        return steps;
    }

    return {
        init, set_element_type, set_cell, get_cell, set_element, get_element, remove_element, swap_elements,
        get_neighbor_cells, get_neighbor_elements, is_available_cell_type_for_move, try_move, try_click, process_state, save_state, load_state,
        get_all_combinations, get_all_available_steps, get_free_cells, get_all_elements_by_type, try_damage_element,
        set_callback_on_move_element, set_callback_on_moved_elements, set_callback_is_can_move, is_can_move_base,
        set_callback_is_combined_elements, is_combined_elements_base,
        set_callback_on_combinated, on_combined_base,
        set_callback_on_damaged_element,
        set_callback_on_request_element,
        set_callback_on_near_activation, on_near_activation_base,
        set_callback_on_cell_activation, on_cell_activation_base,
        set_callback_on_cell_activated
    };
}


/*
порядок работы примерно такой:
const game = Match3(10,10);
game.init();
set_element_type, set_cell, set_element

и цикл примерно такой извне приходит:
    if try_move:
        while (process_state(Combinate))
            process_state(MoveElements)
*/