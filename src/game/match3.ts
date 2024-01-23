/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { rotate_matrix_90 } from "../utils/math_utils";

// направление движения при сложении ячеек(а также падение новых - анимации на клиенте)
export enum MoveDirection {
    Up,
    Down,
    Left,
    Right,
    None
}

// тип комбинации
export enum CombinationType {
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
    // // 3x3
    // [
    //     [0, 0, 1],
    //     [0, 0, 1],
    //     [1, 1, 1]
    // ],

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
    NotMoved,
    Locked,
    Disabled,
    Wall
}

// вместо null для неактивной клетки
export const NotActiveCell = -1;

// описание свойств клетки
export interface Cell {
    id: number;
    type: number; // маска свойств
    cnt_acts?: number; // число активаций которое произошло(при реакции в качестве соседней клетки + условие наличия флага ActionLocked)
    cnt_acts_req?: number; // если маска содержит свойство ActionLocked то это число требуемых активаций
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
    id: number;
    type: number;
    data?: any;
}

// используется для информации о элементе/клетке
export interface ItemInfo {
    x: number;
    y: number;
    id: number;
}

export interface DamagedInfo {
    x: number;
    y: number;
    element: Element;
}

// информация о ходе
export interface StepInfo {
    from_x: number;
    from_y: number;
    to_x: number;
    to_y: number;
}

// описание игровых данных для импорта/экспорта
export interface GameState {
    cells: (Cell | typeof NotActiveCell)[][];
    elements: (Element | typeof NullElement)[][];
}

export enum ProcessMode {
    Combinate,   // обработка соединений
    MoveElements // обработка перемещений после того как образовались дыры при комбинации
}

type FncIsCanMove = (from_x: number, from_y: number, to_x: number, to_y: number) => boolean;
type FncOnCombinated = (combined_element: ItemInfo, combination: CombinationInfo) => void;
type FncObNearActivation = (elements: ItemInfo[]) => void;
type FncIsCombined = (e1: Element, e2: Element) => boolean;
type FncOnCellActivated = (cell: ItemInfo) => void;
type FncOnDamagedElement = (info: DamagedInfo) => void;
type FncOnMoveElement = (from_x:number, from_y: number, to_x: number, to_y: number, element: Element) => void;
type FncOnRequestElement = (x: number, y: number) => Element | typeof NullElement;


export function Field(size_x: number, size_y: number, move_direction = MoveDirection.Up) {
    // откуда идет сложение ячеек, т.е. при образовании пустоты будут падать сверху вниз
    
    // наши все клетки, полностью заполненная прямоугольная/квадратная структура
    const cells: (Cell | typeof NotActiveCell)[][] = [];
    // классификаторы элементов
    const element_types: { [id: number]: ElementType } = {};
    // непосредственно игровые элементы
    const elements: (Element | typeof NullElement)[][] = [];
    
    const last_moved_elements: ItemInfo[] = [];
    const damaged_elements: number[] = [];

    // кастомные колбеки 
    let cb_is_can_move: FncIsCanMove;
    let cb_on_combinated: FncOnCombinated;
    let cb_ob_near_activation: FncObNearActivation;
    let cb_is_combined_elements: FncIsCombined;
    let cb_on_cell_activated: FncOnCellActivated;
    let cb_on_damaged_element: FncOnDamagedElement;
    let cb_on_move_element: FncOnMoveElement;
    let cb_on_request_element: FncOnRequestElement;

    function init() {
        // заполняем массив cells с размерностью size_x, size_y с порядком: cells[y][x] is_active false, типа пустое поле
        // а также массив elements с размерностью size_x, size_y и значением NullElement
        for(let y = 0; y < size_y; y++) {
            cells[y] = [];
            elements[y] = [];
            for(let x = 0; x < size_x; x++) {
                cells[y][x] = NotActiveCell;
                elements[y][x] = NullElement;
            }
        }
    }

    function is_unique_element_combination(element: Element, combinations: CombinationInfo[]) {
        for(const comb of combinations) {
            for(const elem of comb.elements) {
                if(elem.id == element.id) return false;
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
                                    const element = elements[y+i][x+j];
                                    if(element as number == NullElement) {
                                        is_combined = false;
                                        break;
                                    }

                                    // проверка на участие элемента в предыдущих комбинациях
                                    if(!is_unique_element_combination(element as Element, combinations)) {
                                        is_combined = false;
                                        break;
                                    }
                                    
                                    combination.elements.push({
                                        x: x+j,
                                        y: y+i,
                                        id: (element as Element).id
                                    });

                                    if(last_element as number != NullElement) {
                                        is_combined = is_combined_elements(last_element as Element, element as Element);
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
        return e1.type == e2.type || (element_types[e1.type] && element_types[e2.type] && element_types[e1.type].index == element_types[e2.type].index);
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
       
        const element_from = elements[from_y][from_x];
        if(element_from == NullElement) return false;

        const element_type_from = element_types[element_from.type];
        if(!element_type_from.is_movable) return false;

        const element_to = elements[to_y][to_x];
        if(element_to != NullElement) {
            const element_type_to = element_types[element_from.type];
            if(!element_type_to.is_movable) return false;
        }

        swap_elements(from_x, from_y, to_x, to_y);

        let was = false;
        const combinations = get_all_combinations();
        
        for(const combination of combinations) {
            for(const element of combination.elements) {
                const is_from = element.id == element_from.id; 
                const is_to = element_to != NullElement && element_to.id == element.id; 
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

    //-----------------------------------------------------------------------------------------------------------------------------------
    // базовая обработка при комбинации
    function on_combined_base(combined_element: ItemInfo, combination: CombinationInfo) {
        // сначала вызываем для каждого try_damage_element затем удаляем все элементы с массива
        // тут важно учесть что т.к. сначала вызвали try_damage_element то в этот момент при большом сборе будет образовываться новый элемент на поле,
        // соответственно нам нужно удалить все элементы не просто с массива elements, но и проверив что id у них не изменился, чтобы случайно не удалить новый созданный
        for(const item of combination.elements) {
            const element = elements[item.y][item.x];
            if(element != NullElement && element.id == item.id) {
                try_damage_element({x: item.x, y: item.y, element: element});
                damaged_elements.splice(damaged_elements.findIndex((elem) => elem == element.id), 1);
                elements[item.y][item.x] = NullElement;
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
    function try_damage_element(damaged_info: DamagedInfo) {
        if(damaged_elements.find((element) => element == damaged_info.element.id) == undefined) {
            damaged_elements.push(damaged_info.element.id);
            if(cb_on_damaged_element != null) return cb_on_damaged_element(damaged_info);
        }
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    function on_near_activation_base(items: ItemInfo[]) {
        // если клетка из массива содержит флаг ActionLocked то увеличиваем счетчик cnt_acts
        // а когда он достигнет cnt_acts_req то вызываем событие cb_on_cell_activated
        for(const item of items) {
            const cell = cells[item.y][item.x];
            if(cell == NotActiveCell) return;
            if(cell.type != CellType.ActionLocked) return;
            if(cell.cnt_acts) cell.cnt_acts++;
            if(cell.cnt_acts != cell.cnt_acts_req) return;
            if(cb_on_cell_activated != null) cb_on_cell_activated(item);
        }
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
        // возвращается инфа только если клетка is_active и на ней ничего нет
        const free_cells: ItemInfo[] = []; 
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                const cell = cells[y][x];
                if(cell != NotActiveCell && elements[y][x] == NullElement) {
                    free_cells.push({x, y, id: cell.id});
                }
            }
        }

        return free_cells;
    }
    
    // задает клетку
    function set_cell(x: number, y: number, cell: Cell | typeof NotActiveCell) {
        cells[y][x] = cell;
    }

    function get_cell(x: number, y: number): Cell | typeof NotActiveCell {
        return cells[y][x];
    }
    
    function set_element_type(id: number, element_type: ElementType) {
        element_types[id] = element_type;
    }
    
    // добавляет элемент на поле
    function set_element(x: number, y: number, element: Element | typeof NullElement) {
        elements[y][x] = element;
    }
    
    function get_element(x: number, y:number): Element | typeof NullElement {
        return elements[y][x];
    }

    function swap_elements(from_x: number, from_y: number, to_x: number, to_y: number) {
        const elements_from = elements[from_y][from_x]; 
        elements[from_y][from_x] = elements[to_y][to_x];
        elements[to_y][to_x] = elements_from;
    }

    // возвращает соседние елементы/клетки
    function get_neighbors(x: number, y: number, array: (Cell | typeof NotActiveCell)[][] | (Element | typeof NullElement)[][] = elements): ItemInfo[] {
        const neighbors: ItemInfo[] = [];
        
        for (let i = y - 1; i <= y + 1; i++) {
            for (let j = x - 1; j <= x + 1; j++) {
                if (i >= 0 && i < size_y && j >= 0 && j < size_x && !(i == y && j == x)) {
                    let id = -1;
                    const item = array[i][j];
                    switch(typeof array) {
                        case typeof elements: if(item as number != NullElement) id = (item as Element).id; break;
                        case typeof cells: id = (item as Cell).id; break;
                    }

                    if(id == -1) neighbors.push({x: j, y: i, id: id});
                }
            }
        }

        return neighbors;
    }

    // удаляет элемент с поля (метод нужен для вызова логики бустеров каких-то)
    function remove_element(x: number, y: number, is_damaging: boolean, is_near_activation: boolean) {
        // удаляем элемент с массива и вызываем try_damage_element если is_damaging = true
        // и вызываем on_near_activation для соседей если свойство is_near_activation = true

        const element = elements[y][x];
        if(element as number == NullElement) return;

        if(is_near_activation) on_near_activation(get_neighbors(x, y));
        if(is_damaging) {
            try_damage_element({x, y, element: element as Element});
            damaged_elements.splice(damaged_elements.findIndex((elem) => elem == (element as Element).id), 1);
            elements[y][x] = NullElement;
        }
    }

    function is_available_cell_type(cell: Cell): boolean {
        switch(cell.type) {
            case CellType.NotMoved:
            case CellType.Locked:
            case CellType.Wall:
                return false;
            case CellType.ActionLocked:
                if(cell.cnt_acts != cell.cnt_acts_req) return false;
            break;
        }

        return true;
    }

    // ввод пользователя на перемещение элементов
    // на основе ограничений клетки, а также на соответствущее разрешение перемещения у элемента(is_move) 
    // возвращает результат если успех, то уже применен ход (т.е. элементы перемещен и поменялся местами)
    function try_move(from_x: number, from_y: number, to_x: number, to_y: number) {
        const cell_from = cells[from_y][from_x];
        if(cell_from == NotActiveCell || !is_available_cell_type(cell_from)) return false;
        
        const cell_to = cells[to_y][to_x];
        if(cell_to == NotActiveCell || !is_available_cell_type(cell_to)) return false;

        const is_can = is_can_move(from_x, from_y, to_x, to_y);
        if(is_can) {
            swap_elements(from_x, from_y, to_x, to_y);
            
            const element_from = elements[from_y][from_x];
            if(element_from as number != NullElement) last_moved_elements.push({x: from_x, y: from_y, id: (element_from as Element).id});
        
            const element_to = elements[to_y][to_x];
            if(element_to as number != NullElement) last_moved_elements.push({x: to_x, y: to_y, id: (element_to as Element).id});
        }

        return is_can; 
    }

    // ввод пользователя на клик элемента
    // по идее тут проверяем на базовые правила доступности клика на основе ограничений клетки, а также на соответствущее разрешение клика у элемента(is_click) 
    // ничего больше не делаем, т.е. не удаляем и т.п.
    function try_click(x: number, y: number) {
        const cell = cells[y][x];
        if(cell == NotActiveCell) return false;
        
        const element = elements[y][x];
        if(element == NullElement) return false;
        
        const element_type = element_types[element.type];
        if(!element_type.is_clickable) return false;

        return true;
    }

    function process_combinate() {
        let is_procesed = false;
        for(const combination of get_all_combinations()) {
            let found = false;
            for(const elememnt of combination.elements) {
                for(const last_moved_element of last_moved_elements) {
                    if(last_moved_element.id == elememnt.id) {
                        on_combinated(elememnt, combination);
                        found = true;
                        break;
                    }
                }
                if(found) break;
            }
            
            for(const element of combination.elements)
                on_near_activation(get_neighbors(element.x, element.y, cells));
            is_procesed = true;
        }
        
        last_moved_elements.splice(0, last_moved_elements.length);
        
        return is_procesed;
    }

    function request_element(x: number, y: number) {
        const element = on_request_element(x, y);
        if(element as number != NullElement) {
            last_moved_elements.push({x, y, id: (element as Element).id});
        }
    }

    function try_move_element_from_up(x: number, y:number): boolean {
        for(let j = y; j >= 0; j--) {
            const cell = cells[j][x];
            if(cell as number != NotActiveCell) {
                if(!is_available_cell_type(cell as Cell)) return false;
                
                const element = elements[j][x];
                if(element as number != NullElement) {
                    elements[y][x] = element;
                    elements[j][x] = NullElement;

                    on_move_element(x, j, x, y, element as Element);
                    last_moved_elements.push({x, y, id: (element as Element).id});
                    
                    return true;
                }
            }
        }

        return false;
    }
    
    function try_move_element_from_down(x: number, y:number): boolean {
        for(let j = y; j < size_y; j++) {
            const cell = cells[j][x];
            if(cell as number != NotActiveCell) {
                if(!is_available_cell_type(cell as Cell)) return false;
                
                const element = elements[j][x];
                if(element as number != NullElement) {
                    elements[y][x] = element;
                    elements[j][x] = NullElement;

                    on_move_element(x, j, x, y, element as Element);
                    last_moved_elements.push({x, y, id: (element as Element).id});
                    
                    return true;
                }
            }
        }

        return false;
    }
    
    function try_move_element_from_left(x: number, y:number): boolean {
        for(let j = x; j >= 0; j--) {
            const cell = cells[y][j];
            if(cell as number != NotActiveCell) {
                if(!is_available_cell_type(cell as Cell)) return false;
                
                const element = elements[y][j];
                if(element as number != NullElement) {
                    elements[y][x] = element;
                    elements[y][j] = NullElement;

                    on_move_element(j, y, x, y, element as Element);
                    last_moved_elements.push({x, y, id: (element as Element).id});
                    
                    return true;
                }
            }
        }

        return false;
    }

    function try_move_element_from_right(x: number, y:number): boolean {
        for(let j = x; j < size_x; j++) {
            const cell = cells[y][j];
            if(cell as number != NotActiveCell) {
                if(!is_available_cell_type(cell as Cell)) return false;
                
                const element = elements[y][j];
                if(element as number != NullElement) {
                    elements[y][x] = element;
                    elements[y][j] = NullElement;

                    on_move_element(j, y, x, y, element as Element);
                    last_moved_elements.push({x, y, id: (element as Element).id});
                    
                    return true;
                }
            }
        }

        return false;
    }
   
   

    function process_move() {
        let is_procesed = false;
        switch(move_direction) {
            case MoveDirection.Up:
                for(let y = size_y - 1; y >= 0; y--) {
                    for(let x = 0; x < size_x; x++) {
                        const cell = cells[y][x];
                        const empty = elements[y][x];
                        if((empty as number == NullElement) && (cell as number != NotActiveCell)) {
                            if(!try_move_element_from_up(x, y)) request_element(x, y);
                            is_procesed = true;
                        }
                    }
                }
            break;
            case MoveDirection.Down:
                for(let y = 0; y < size_y; y++) {
                    for(let x = 0; x < size_x; x++) {
                        const cell = cells[y][x];
                        const empty = elements[y][x];
                        if((empty as number == NullElement) && (cell as number != NotActiveCell)) {
                            if(!try_move_element_from_down(x, y)) request_element(x, y);
                            is_procesed = true;
                        }
                    }
                }
            break;
            case MoveDirection.Left:
                for(let x = size_x - 1; x >= 0; x--) {
                    for(let y = 0; y < size_y; y++) {
                        const cell = cells[y][x];
                        const empty = elements[y][x];
                        if((empty as number == NullElement) && (cell as number != NotActiveCell)) {
                            if(!try_move_element_from_left(x, y)) request_element(x, y);
                            is_procesed = true;   
                        }
                    }
                }
            break;
            case MoveDirection.Right:
                for(let x = 0; x < size_x; x++) {
                    for(let y = 0; y < size_y; y++) {
                        const cell = cells[y][x];
                        const empty = elements[y][x];
                        if((empty as number == NullElement) && (cell as number != NotActiveCell)) {
                            if(!try_move_element_from_right(x, y)) request_element(x, y);
                            is_procesed = true;
                        }
                    }
                }
            break;
        }

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
        return {
            cells: cells,
            elements: elements
        };
    }

    // загрузить состояние игры
    function load_state(state: GameState) {
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                set_cell(x, y, state.cells[y][x]);
                set_element(x, y, state.elements[y][x]);
            }
        }
    }
    
    // возвращает массив всех возможных ходов(для подсказок например)
    function get_all_available_steps(): StepInfo[] {
        // TODO
        return [];
    }

    return {
        init, set_element_type, set_cell, get_cell, set_element, get_element, remove_element,
        try_move, try_click, process_state, save_state, load_state,
        get_all_combinations, get_all_available_steps, get_free_cells, try_damage_element,
        set_callback_on_move_element, set_callback_is_can_move, is_can_move_base,
        set_callback_is_combined_elements, is_combined_elements_base,
        set_callback_on_combinated, on_combined_base,
        set_callback_on_damaged_element,
        set_callback_on_request_element,
        set_callback_ob_near_activation, on_near_activation_base,
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