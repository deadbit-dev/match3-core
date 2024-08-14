import { NotActiveCell, NullElement } from "./match3_core";
import { CellId, ElementId, Level, RandomElement, TargetState, TargetType } from "./match3_game";

export function load_levels_config() {
    const data = sys.load_resource('/resources/levels.json')[0];
    if(data == null) return;

    const levels = json.decode(data) as { 
        time: number,
        steps: number,
        targets: {
            count: number,
            type: { cell: CellId | undefined, element: ElementId | undefined }
        }[],
        busters: {
            hammer: number,
            spinning: number,
            horizontal_rocket: number,
            vertical_rocket: number
        },
        coins: number,
        additional_element: ElementId,
        exclude_element: ElementId,
        field: (string | { cell: CellId | undefined, element: ElementId | undefined })[][]
    }[];
    
    for(const level_data of levels) {
        const level: Level = {
            field: { 
                width: 10,
                height: 10,
                max_width: 8,
                max_height: 8,
                cell_size: 128,
                offset_border: 20,

                cells: [] as (typeof NotActiveCell | CellId)[][] | CellId[][][],
                elements: [] as (typeof NullElement | typeof RandomElement | ElementId)[][]
            },

            coins: level_data.coins,

            additional_element: level_data.additional_element,
            exclude_element: level_data.exclude_element,

            time: level_data.time,
            steps: level_data.steps,
            targets: [] as TargetState[],

            busters: {
                hammer: {
                    name: 'hammer',
                    counts: level_data.busters.hammer,
                    active: false
                },
                spinning: {
                    name: 'spinning',
                    counts: level_data.busters.spinning,
                    active: false
                },
                horizontal_rocket: {
                    name: 'horizontal_rocket',
                    counts: level_data.busters.horizontal_rocket,
                    active: false
                },
                vertical_rocket: {
                    name: 'vertical_rocket',
                    counts: level_data. busters.vertical_rocket,
                    active: false
                }
            }
        };

        for(let y = 0; y < level_data.field.length; y++) {
            level.field.cells[y] = [];
            level.field.elements[y] = [];
            for(let x = 0; x < level_data.field[y].length; x++) {
                const data = level_data.field[y][x];
                if(typeof data === 'string') {
                    switch(data) {
                        case '-':
                            level.field.cells[y][x] = NotActiveCell;
                            level.field.elements[y][x] = NullElement;
                            break;
                        case '':
                            level.field.cells[y][x] = CellId.Base;
                            level.field.elements[y][x] = RandomElement;
                            break;
                    }   
                } else {
                    if(data.element != undefined) {
                        level.field.elements[y][x] = data.element;
                    } else level.field.elements[y][x] = RandomElement;
                    
                    if(data.cell != undefined) {
                        level.field.cells[y][x] = [CellId.Base, data.cell];
                        if(level.field.elements[y][x] == RandomElement && (data.cell == CellId.Stone || data.cell == CellId.Box))
                            level.field.elements[y][x] = NullElement;
                    } else level.field.cells[y][x] = CellId.Base;
                }
            }
        }

        for(const target_data of level_data.targets) {
            let target;
            if(target_data.type.element != undefined) {
                target = {
                    id: target_data.type.element as number,
                    type: TargetType.Element,
                    count: 0,
                    uids: []
                };
            }

            if(target_data.type.cell != undefined) {
                target = {
                    id: target_data.type.cell as number,
                    type: TargetType.Cell,
                    count: 0,
                    uids: []
                };
            }

            if(target != undefined) {
                const count = tonumber(target_data.count);
                target.count = count != undefined ? count : target.count;
                level.targets.push(target);
            }
        }

        GAME_CONFIG.levels.push(level);
    }
}