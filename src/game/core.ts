/* eslint-disable @typescript-eslint/no-explicit-any */

import { get_debug_intersect_points, rotateMatrix } from "../utils/math_utils";

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
export const CombinationMasks = [
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

// набор возможных свойств клетки
export enum CellType {
    Base = (1 << 0),
    ActionLocked = (1 << 1),
    ActionLockedNear = (1 << 2),
    NotMoved = (1 << 3),
    Locked = (1 << 4),
    Disabled = (1 << 5)
}

export enum CellState {
    Idle,
    Busy
}

// описание свойств клетки
export interface Cell {
    id: number; // индентификатор
    uid: number; // уникальный индетификатор
    type: number; // маска свойств
    strength?: number;
    under_cells: number[];
    state: CellState;
}

// вместо null для неактивной клетки
export const NotActiveCell = -1;

// набор возможных свойств ячейки
export enum ElementType {
    Movable = (1 << 0),
    Clickable = (1 << 1)
}

export enum ElementState {
    Idle,
    Swap,
    Fall,
    Busy
}

// непосредственно элемент
export interface Element {
    id: number; // индентификатор
    uid: number; // уникальный индетификатор
    type: number; // маска свойств
    state: ElementState;
}

// вместо null для пустоты
export const NullElement = -1;

// описывает координату для упрощения передачи
export interface Position {
    x: number;
    y: number;
}

export interface CombinationInfo {
    combined_pos: Position;
    elementsInfo: Position[];
    type: CombinationType;
    angle: number;
}

// информация о ходе
export interface SwapInfo {
    from: Position;
    to: Position;
}

// информация возвращаемая при попытки нанести урон
export interface DamageInfo {
    pos: Position;
    element?: Element;
    damaged_cells?: CellDamageInfo[];
}

export interface CellDamageInfo {
    pos: Position;
    cell: Cell;
}

export interface MoveInfo {
    start_pos: Position;
    next_pos: Position;
    element: Element;
}

export interface CellInfo {
    pos: Position;
    cell: Cell;
}

export interface ElementInfo {
    pos: Position;
    element: Element;
}

export type NotFound = undefined;
export const NotFound = undefined;

export type NotDamage = undefined;
export const NotDamage = undefined;

// наши все клетки, полностью заполненная прямоугольная/квадратная структура
export type Cells = (Cell | typeof NotActiveCell)[][];

// наши все клетки, полностью заполненная прямоугольная/квадратная структура
export type Elements = (Element | typeof NullElement)[][];

// описание игровых данных для импорта/экспорта
export interface CoreState {
    cells: Cells; // непосредственно игровые ячейки
    elements: Elements; // непосредственно игровые элементы
}

//типы кастомных колбэков
type FncIsCanSwap = (from: Position, to: Position) => boolean;
type FncIsCombined = (e1: Element, e2: Element) => boolean;
type FncOnElementDamaged = (pos: Position, element: Element) => void;
type FncOnCellDamaged = (cell: Cell) => CellDamageInfo | NotDamage;
type FncOnNearCellsDamaged = (cells: Cell[]) => CellDamageInfo[];
type FncOnRequestElement = (pos: Position) => Element | typeof NullElement;

export function Field(size_x: number, size_y: number) {
    const state: CoreState = {
        cells: [],
        elements: []
    };

    const rotated_masks: number[][][][] = [];

    // кастомные колбэки
    let cb_is_can_swap: FncIsCanSwap;
    let cb_is_combined_elements: FncIsCombined;
    let cb_on_element_damaged: FncOnElementDamaged;
    let cb_on_cell_damaged: FncOnCellDamaged;
    let cb_on_near_cells_damaged: FncOnNearCellsDamaged;
    let cb_on_request_element: FncOnRequestElement;
    
    function init() {
        // заполняем массив cells с размерностью size_x, size_y с порядком: cells[y][x] is_active false, типа пустое поле
        // а также массив elements с размерностью size_x, size_y и значением NullElement

        rotate_all_masks();

        for(let y = 0; y < size_y; y++) {
            state.cells[y] = [];
            state.elements[y] = [];
            for(let x = 0; x < size_x; x++) {
                set_cell({x, y}, NotActiveCell);
                set_element({x, y}, NullElement);
            }
        }
    }

    // сохранение состояния игры
    function save_state(): CoreState {
        const st: CoreState = {
            cells: [],
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

        return json.decode(json.encode(st)) as CoreState;
    }

    // загрузить состояние игры
    function load_state(st: CoreState) {
        for(let y = 0; y < size_y; y++) {
            state.cells[y] = [];
            state.elements[y] = [];
            for(let x = 0; x < size_x; x++) {
                state.cells[y][x] = st.cells[y][x];
                state.elements[y][x] = st.elements[y][x];
            }
        }
    }

    function rotate_all_masks() {
        // вращаем все маски комбинаций

        for(let mask_index = CombinationMasks.length - 1; mask_index >= 0; mask_index--) {
            const mask = CombinationMasks[mask_index];

            // оптимизация для одноразмерных масок
            let is_one_row_mask = false;
            switch(mask_index) {
                case CombinationType.Comb3:
                case CombinationType.Comb4:
                case CombinationType.Comb5:
                    is_one_row_mask = true;
                break;
            }

            rotated_masks[mask_index] = [];
            rotated_masks[mask_index].push(mask);

            let angle = 90;
            const max_angle = is_one_row_mask ? 90 : 270;
            while(angle <= max_angle) {
                rotated_masks[mask_index].push(rotateMatrix(mask, angle));
                angle += 90;
            }
        }
    }

    // задает клетку
    function set_cell(pos: Position, cell: Cell | typeof NotActiveCell) {
        state.cells[pos.y][pos.x] = cell;
    }

    // возвращает клетку
    function get_cell(pos: Position): Cell | typeof NotActiveCell {
        return state.cells[pos.y][pos.x];
    }

    // возвращает позицию ячейки на поле
    function get_cell_pos(cell: Cell): Position
    {
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                const current_cell = get_cell({x, y});
                if(current_cell != NotActiveCell && current_cell == cell) {
                    return {x, y};
                }
            }
        }

        return {x: -1, y: -1};
    }

    function set_cell_state(pos: Position, state: CellState) {
        const cell = get_cell(pos);
        if(cell != NotActiveCell) {
            cell.state = state;
        }
    }
    
    // добавляет элемент на поле
    function set_element(pos: Position, element: Element | typeof NullElement) {
        state.elements[pos.y][pos.x] = element;
    }
    
    // возвращает элемент
    function get_element(pos: Position): Element | typeof NullElement {
        return state.elements[pos.y][pos.x];
    }

    // возвращает позицию элемента на поле
    function get_element_pos(element: Element): Position
    {
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                const current_element = get_element({x, y});
                if(current_element != NullElement && current_element == element) {
                    return {x, y};
                }
            }
        }

        return {x: -1, y: -1};
    }

    function set_element_state(pos: Position, state: ElementState) {
        const element = get_element(pos);
        if(element != NullElement) {
            element.state = state;
        }
    }

    // меняет местами два элемента
    function swap_elements(from: Position, to: Position) {
        const elements_from = get_element(from);
        set_element(from, get_element(to));
        set_element(to, elements_from);
    }

    // возвращает соседние клетки
    function get_neighbor_cells(pos: Position, mask = [[0, 1, 0,], [1, 1, 1], [0, 1, 0]]) {
        const neighbors: Cell[] = [];

        for (let i = pos.y - 1; i <= pos.y + 1; i++) {
            for (let j = pos.x - 1; j <= pos.x + 1; j++) {
                if (i >= 0 && i < size_y && j >= 0 && j < size_x && mask[i - (pos.y - 1)][j - (pos.x - 1)] == 1) {
                    const cell = get_cell({x: j, y: i});
                    if(cell != NotActiveCell) neighbors.push(cell);
                }
            }
        }

        return neighbors;
    }
    
    // возвращает соседние элементы
    function get_neighbor_elements(pos: Position, mask = [[0, 1, 0,], [1, 0, 1], [0, 1, 0]]) {
        const neighbors: Element[] = [];

        for (let i = pos.y - 1; i <= pos.y + 1; i++) {
            for (let j = pos.x - 1; j <= pos.x + 1; j++) {
                if (i >= 0 && i < size_y && j >= 0 && j < size_x && mask[i - (pos.y - 1)][j - (pos.x - 1)] == 1) {
                    const element = get_element({x: j, y: i});
                    if(element != NullElement) neighbors.push(element);
                }
            }
        }

        return neighbors;
    }

    // возвращает массив свободных клеток
    function get_free_cells(): Cell[] {
        const free_cells: Cell[] = []; 
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                const cell = get_cell({x, y});
                if(cell != NotActiveCell && get_element({x, y}) == NullElement) {
                    free_cells.push(cell);
                }
            }
        }

        return free_cells;
    }
    
    // возвращает массив елементов определенного типа
    function get_all_elements_by_id(element_id: number): Element[] {
        const target_elements: Element[] = []; 
        for(let y = 0; y < size_y; y++) {
            for(let x = 0; x < size_x; x++) {
                const cell = get_cell({x, y});
                const element = get_element({x, y});
                if(cell != NotActiveCell && element != NullElement && element.id == element_id) {
                    target_elements.push(element);
                }
            }
        }

        return target_elements;
    }

    // ввод пользователя на перемещение элементов
    // на основе ограничений клетки, а также на соответствущее разрешение перемещения у элемента(Movable) 
    // возвращает результат если успех, то уже применен ввод (т.е. элементы перемещен и поменялся местами)
    function try_swap(from: Position, to: Position) {
        const is_can = is_can_swap(from, to);
        if(is_can) {
            set_element_state(from, ElementState.Swap);
            set_element_state(to, ElementState.Swap);
            swap_elements(from, to);
        }
        return is_can; 
    }

    // ввод пользователя на клик элемента
    // по идее тут проверяем на базовые правила доступности клика на основе ограничений клетки, а также на соответствущее разрешение клика у элемента(is_click) 
    // ничего больше не делаем, т.е. не удаляем и т.п.
    function try_click(pos: Position) {
        const cell = get_cell(pos);
        if(cell == NotActiveCell || !is_available_cell_type_for_click(cell) || cell.state != CellState.Idle)
            return false;
        
        const element = get_element(pos);
        if(element == NullElement || !is_clickable_element(element) || element.state != ElementState.Idle)
            return false;

        return true;
    }

    function search_combination(combined_pos: Position): CombinationInfo | NotFound {
        // проходимся по всем маскам с конца

        for(let mask_index = CombinationMasks.length - 1; mask_index >= 0; mask_index--) {
            // берем все варианты вращений маски
            const masks = rotated_masks[mask_index];
            // проходимся по повернутым вариантам
            for(let m = 0; m < masks.length; m++) {
                const mask = masks[m];
                // ищем в маске позицию с значением 1
                for(let my = 0; my < mask.length; my++) {
                    for(let mx = 0; mx < mask[my].length; mx++) {
                        const value = mask[my][mx];
                        if(value == 1) {
                            const combination = {
                                combined_pos: combined_pos,
                                elementsInfo: [] as Position[],
                                angle: m * 90,
                                type: mask_index as CombinationType
                            };
                            // выставляем маску чтобы элемент оказался в этой позиции
                            const start_y = combined_pos.y - my;
                            const end_y = combined_pos.y + (mask.length - my);
                            if(start_y >= 0 && end_y < size_y) {
                                const start_x = combined_pos.x - mx;
                                const end_x = combined_pos.x + (mask[my].length - mx);
                                if(start_x >= 0 && end_x < size_x) {
                                    let is_combined = true;
                                    let last_element: Element | typeof NullElement = NullElement;

                                    // проходимся маской по элементам в текущей позиции
                                    for(let i = 0; i < mask.length && is_combined; i++) {
                                        for(let j = 0; j < mask[i].length && is_combined; j++) {
                                            if(mask[i][j] == 1) {
                                                const pos = {x: start_x + j, y: start_y + i};

                                                const cell = get_cell(pos);
                                                const element = get_element(pos);

                                                // проверка на доступность ячейки для комбинации
                                                if(element == NullElement || cell == NotActiveCell || !is_available_cell_type_for_activation(cell)) {
                                                    is_combined = false;
                                                    break;
                                                }

                                                // сравнение елемента с предыдущим
                                                if(last_element != NullElement)
                                                    is_combined = is_combined_elements(last_element, element);

                                                combination.elementsInfo.push(pos);
                                                last_element = element;
                                            }
                                        }
                                    }

                                    if(is_combined)
                                        return combination;
                                }
                            }
                        }
                    }
                }
            }
        }

        return NotFound;
    }
 
    // попытка нанести урон клетке
    function try_damage(pos: Position, is_near_activation = false, without_element = false, force = false): DamageInfo | NotDamage {
        const damage_info = {} as DamageInfo;
        damage_info.pos = pos;
        damage_info.damaged_cells = [];

        const cell = get_cell(pos);
        if(cell == NotActiveCell || (!force && cell.state == CellState.Busy))
            return NotDamage;

        const damaged_cell = on_cell_damaged(cell);
        if(damaged_cell != NotDamage) {
            damage_info.damaged_cells.push(damaged_cell);
        }
        
        if(is_near_activation) {
            const near_activated_cells = on_near_cells_damaged(get_neighbor_cells(pos));
            for(const near_activated_cell of near_activated_cells)
                damage_info.damaged_cells.push(near_activated_cell);
        }

        if(without_element && !is_available_cell_type_for_move(cell)) {
            if(damage_info.damaged_cells.length == 0)
                return NotDamage;
            return damage_info;
        }

        const element = get_element(pos);
        if(element == NullElement || (!force && element.state == ElementState.Busy)) {
            if(damage_info.damaged_cells.length == 0)
                return NotDamage;
            return damage_info;
        }
            
        damage_info.element = element;
        set_element(pos, NullElement);
        on_element_damaged(pos, element);

        return damage_info;
    }

    function on_element_damaged(pos: Position, element: Element) {
        if(cb_on_element_damaged != null) cb_on_element_damaged(pos, element);
    }

    function set_callback_on_element_damaged(fnc: FncOnElementDamaged) {
        cb_on_element_damaged = fnc;
    }

    // функция активации ячейки
    function on_cell_damaged(cell: Cell): CellDamageInfo | NotFound {
        if (cb_on_cell_damaged != NotDamage) return cb_on_cell_damaged(cell);
        else return on_cell_damaged_base(cell);
    }

    // базовая функция активации ячеки
    function on_cell_damaged_base(cell: Cell): CellDamageInfo | NotDamage {    
        if(cell.strength == undefined)
            return NotDamage;

        if(!is_type_cell(cell, CellType.ActionLocked) && !is_type_cell(cell, CellType.ActionLockedNear))
            return NotDamage;

        cell.strength--;
        return {pos: get_cell_pos(cell), cell};
    }

    // задаем кастомный колбек для обработки события активации ячейки
    function set_callback_on_cell_damaged(fnc: FncOnCellDamaged) {
        cb_on_cell_damaged = fnc;
    }

    // функция активации соседних ячеек
    function on_near_cells_damaged(cells: Cell[]): CellDamageInfo[] {
        if (cb_on_near_cells_damaged != null) return cb_on_near_cells_damaged(cells);
        else return on_near_cells_damaged_base(cells);
    }

    // базовая функция активации соседних ячеек
    function on_near_cells_damaged_base(cells: Cell[]): CellDamageInfo[] {
        // если клетка из массива содержит флаг ActionLockedNear то уменьшаем счетчик near_activations
        const near_damaged_cells = [] as CellDamageInfo[];
        for(const cell of cells) {
            if(cell.strength != undefined && is_type_cell(cell, CellType.ActionLockedNear)) {
                cell.strength--;
                near_damaged_cells.push({pos: get_cell_pos(cell), cell});
            }
        }
        return near_damaged_cells;
    }

    // задаем колбек для обработки активации соседних ячеек
    function set_callback_on_near_cells_damaged(fnc: FncOnNearCellsDamaged) {
        cb_on_near_cells_damaged = fnc;
    }

    // элемент который сдвинулся(он нужен для того чтобы например при образовании пары из 4х элементов понять в каком месте образовался другой элемент)
    // и массив элементов которые задействованы
    function combinate(combination: CombinationInfo): DamageInfo[] {
        // вызываем для каждого элемента try_damage
        const damages_info = [] as DamageInfo[];
        for(const elementInfo of combination.elementsInfo) {
            const damage_info = try_damage(elementInfo, true, false, true);
            if(damage_info != NotDamage) {
                damages_info.push(damage_info);
            }
        }

        return damages_info;
    }

    // функция проверки могут ли участвовать в комбинации два элемента 
    function is_combined_elements(e1: Element, e2: Element): boolean {
        if(cb_is_combined_elements != null) return cb_is_combined_elements(e1, e2);
        else return is_combined_elements_base(e1, e2);
    }

    // базовая функция проверки могут ли участвовать в комбинации два элемента 
    function is_combined_elements_base(e1: Element, e2: Element): boolean {
        // TODO: нужно ли обрабатывать случай с двумя разными по визуалу элементами, но одинаковыми по индексу, сейчас таких нет
        const is_same_id = e1.id == e2.id;
        const is_same_type = e1.type == e2.type;
        const is_right_state = (e1.state == ElementState.Idle) && (e2.state == ElementState.Idle);
        return is_same_id && is_same_type && is_right_state;
    }

    // задаем кастомный колбэк для проверки могут ли участвовать в комбинации два элемента
    function set_callback_is_combined_elements(fnc: FncIsCombined): void {
        cb_is_combined_elements = fnc;
    }

    function fell_element(element: Element): MoveInfo | NotFound {
        const moveInfo = {} as MoveInfo;
        moveInfo.element = element;
        moveInfo.start_pos = get_element_pos(element);
        moveInfo.next_pos = moveInfo.start_pos;

        let was = true;
        if(!falling_down(element, moveInfo))
            was = falling_through_corner(element, moveInfo);

        if(was) {
            set_element_state(moveInfo.next_pos, ElementState.Fall);
            return moveInfo;
        }
    }

    // падение элемента вниз
    function falling_down(element: Element, moveInfo: MoveInfo) {
        const pos = get_element_pos(element);
        if(pos.y >= get_last_pos_in_column(pos))
            return false;

        const next_y = pos.y + 1;
        const bottom_element = get_element({x: pos.x, y: next_y});
        if(bottom_element != NullElement)
            return false;
        
        const bottom_cell = get_cell({x: pos.x, y: next_y});
        if(bottom_cell != NotActiveCell) {
            if(!is_available_cell_type_for_move(bottom_cell) || bottom_cell.state != CellState.Idle)
                return false;
        }

        for(let y = next_y; y < get_last_pos_in_column(pos); y++) {
            const next_cell = get_cell({x: pos.x, y});
            if(next_cell != NotActiveCell) {
                if(is_pos_empty({x: pos.x, y}))
                    break;
                return false;
            } else if (!is_pos_empty({x: pos.x, y})) return false;
        }

        swap_elements(pos, {x: pos.x, y: next_y});
        moveInfo.next_pos = {x: pos.x, y: next_y};
        
        return true;
    }

    // падение элемента диагонально в свободное место
    function falling_through_corner(element: Element, moveInfo: MoveInfo): boolean {
        const pos = get_element_pos(element);
        const neighbor_cells = get_neighbor_cells(pos, [
            [0, 0, 0],
            [0, 0, 0],
            [1, 0, 1]
        ]);

        for(const neighbor_cell of neighbor_cells) {
            if(is_available_cell_type_for_move(neighbor_cell) && neighbor_cell.state == CellState.Idle) {
                const neighbor_cell_pos = get_cell_pos(neighbor_cell);
                const element = get_element(neighbor_cell_pos);
                if(element == NullElement) {
                    let available = false;
                    for(let y = neighbor_cell_pos.y - 1; y > 0; y--) {
                        const top_cell = get_cell({x: neighbor_cell_pos.x, y});
                        const is_not_available_cell = top_cell != NotActiveCell && !is_available_cell_type_for_move(top_cell);
                        if(is_not_available_cell) {
                            available = true;
                            break;
                        }
                        
                        const is_not_empty_pos = !is_pos_empty({x: neighbor_cell_pos.x, y});
                        if(is_not_empty_pos) {
                            available = false;
                            break;
                        }
                    }
                    if(available) {
                        swap_elements(pos, neighbor_cell_pos);
                        moveInfo.next_pos = neighbor_cell_pos;
                        
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // запрос нового элемента
    function request_element(pos: Position): Element | typeof NullElement {
        const element = on_request_element(pos);
        set_element(pos, element);
        return element;
    }

    // функция проверки можно ли переместить элемент
    // но перед вызовом этой функции сначала проверяются ограничения клеток
    function is_can_swap(from: Position, to: Position) {
        if(cb_is_can_swap != null) return cb_is_can_swap(from, to);
        else return is_can_swap_base(from, to);
    }

    // базовая реализация, которая должна стандартными правилами разрешать перемещение если собирается комбинация
    function is_can_swap_base(from: Position, to: Position) {
        // логика тут в том что мы делаем пробное перемещение элементов, а затем получаем все возможные комбинации (get_all_combinations)
        // затем смотрим присутствует ли среди них комбинация хоть с одним из элементов, который был в позиции from или to
       
        const cell_from = get_cell(from);
        if(cell_from == NotActiveCell || !is_available_cell_type_for_move(cell_from) || cell_from.state != CellState.Idle)
            return false;
        
        const cell_to = get_cell(to);
        if(cell_to == NotActiveCell || !is_available_cell_type_for_move(cell_to) || cell_to.state != CellState.Idle)
            return false;
        
        const element_from = get_element(from);
        if(element_from == NullElement || !is_movable_element(element_from) || element_from.state != ElementState.Idle)
            return false;

        const element_to = get_element(to);
        if(element_to != NullElement && (!is_movable_element(element_to) || element_to.state != ElementState.Idle))
            return false;

        swap_elements(from, to);

        const combination_from = search_combination(from);
        const combination_to = search_combination(to);
        const was = (combination_from != NotFound) || (combination_to != NotFound);

        swap_elements(to, from);

        return was;
    }

    // задаем кастомный колбэк для проверки можно ли переместить
    function set_callback_is_can_swap(fnc: FncIsCanSwap) {
        cb_is_can_swap = fnc;
    }

    function on_request_element(pos: Position) : Element | typeof NullElement {
        if(cb_on_request_element != null) return cb_on_request_element(pos);
        return NullElement;                    
    }

    function set_callback_on_request_element(fnc: FncOnRequestElement) {
        cb_on_request_element = fnc;
    }

    // проверяет доступна ли клетка для активации
    function is_available_cell_type_for_activation(cell: Cell): boolean {
        if(is_type_cell(cell, CellType.Disabled)) return false;
        return true;
    }

     // проверяет доступна ли клетка для клика
    function is_available_cell_type_for_click(cell: Cell): boolean {
        return !is_type_cell(cell, CellType.Disabled);
    }

    // проверяет тип елемента
    function is_type_element(element: Element, type: ElementType): boolean {
        return bit.band(element.type, type) == type;
    }

    // проверяет доступна ли клетка для движения
    function is_movable_element(element: Element): boolean {
        return is_type_element(element, ElementType.Movable);
    }

    // проверяет доступна ли клетка для движения
    function is_clickable_element(element: Element): boolean {
        return is_type_element(element, ElementType.Clickable);
    }

    //
    function is_outside_pos_in_column(pos: Position) {
        for(let y = pos.y; y > 0; y--) {
            const cell = get_cell({x: pos.x, y});
            if(cell != NotActiveCell)
                return false;
        }

        const cell = get_cell({x: pos.x, y: pos.y + 1});
        if(cell == NotActiveCell)
            return false;

        return true;
    }

    function get_first_pos_in_column(pos: Position) {
        for(let y = 0; y < size_y; y++) {
            const cell = get_cell({x: pos.x, y});
            if(cell != NotActiveCell)
                return y;
        }

        return 0;
    }

    function get_last_pos_in_column(pos: Position) {
        for(let y = size_y - 1; y > 0; y--) {
            const cell = get_cell({x: pos.x, y});
            if(cell != NotActiveCell)
                return y;
        }

        return size_y - 1;
    }

    // проверка нет ли элемента в переданной позиции
    function is_pos_empty(pos: Position) {
        const cell = get_cell(pos);
        const element = get_element(pos);
        return (cell == NotActiveCell || cell.state == CellState.Idle) && (element == NullElement);
    }

    return {
        init, save_state, load_state,
        set_cell, get_cell, get_cell_pos, set_cell_state,
        set_element, get_element, get_element_pos, 
        set_element_state, swap_elements,
        get_neighbor_cells, get_neighbor_elements, try_swap, try_click,
        get_free_cells, get_all_elements_by_id,
        search_combination, try_damage, combinate, fell_element,
        set_callback_is_can_swap, is_can_swap_base,
        set_callback_is_combined_elements, is_combined_elements_base,
        set_callback_on_element_damaged, on_element_damaged,
        set_callback_on_cell_damaged, on_cell_damaged_base,
        set_callback_on_near_cells_damaged, on_near_cells_damaged_base,
        set_callback_on_request_element, request_element,
        is_available_cell_type_for_activation,
        is_available_cell_type_for_click,
        is_movable_element, is_clickable_element, is_type_cell, is_type_element,
        is_outside_pos_in_column, get_first_pos_in_column, get_last_pos_in_column, is_pos_empty
    };
}

// проверяет тип клетки
export function is_type_cell(cell: Cell, type: CellType): boolean {
    return bit.band(cell.type, type) == type;
}

// проверяет доступна ли клетка для движения
export function is_available_cell_type_for_move(cell: Cell): boolean {
    const is_not_moved = is_type_cell(cell, CellType.NotMoved);
    const is_locked = is_type_cell(cell, CellType.Locked);
    const is_disabled = is_type_cell(cell, CellType.Disabled);
    if(is_not_moved || is_locked || is_disabled) return false;
    return true;
}