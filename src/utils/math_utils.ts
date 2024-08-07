export enum Direction {
    Up,
    Down,
    Left,
    Right,
    None
}

export enum Axis {
    Vertical,
    Horizontal,
    All
}

function is_point_in_zone(A: vmath.vector3, B: vmath.vector3, C: vmath.vector3, D: vmath.vector3, E: vmath.vector3) {
    function side(a: vmath.vector3, b: vmath.vector3, p: vmath.vector3) {
        const val = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
        if (val == 0)
            return 0;
        return val > 0 ? 1 : -1;
    }

    return side(A, B, E) == -1 &&
        side(B, C, E) == -1 &&
        side(C, D, E) == -1 &&
        side(D, A, E) == -1;
}

export function rotate_around(vec: vmath.vector3, angle_rad: number) {
    const c = math.cos(angle_rad), s = math.sin(angle_rad);
    const x = vec.x;
    const y = vec.y;
    vec.x = x * c - y * s;
    vec.y = x * s + y * c;
}

export function rotate_around_center(vec: vmath.vector3, center: vmath.vector3, angle_rad: number) {
    const c = math.cos(angle_rad), s = math.sin(angle_rad);
    const x = vec.x - center.x;
    const y = vec.y - center.y;
    vec.x = x * c - y * s + center.x;
    vec.y = x * s + y * c + center.y;
}

const a = vmath.vector3(0, 0, 0);
const b = vmath.vector3(0, 0, 0);
const c = vmath.vector3(0, 0, 0);
const d = vmath.vector3(0, 0, 0);

export function is_intersect_zone(check_pos: vmath.vector3, go_pos: vmath.vector3, go_size: vmath.vector3, go_angle_deg: number, inner_offset?: vmath.vector3) {
    const w = go_size.x;
    const h = go_size.y;
    const angle = math.rad(go_angle_deg);

    a.x = -w / 2; a.y = h / 2;
    b.x = w / 2; b.y = h / 2;
    c.x = w / 2; c.y = -h / 2;
    d.x = -w / 2; d.y = -h / 2;


    if (angle != 0) {
        rotate_around(a, angle);
        rotate_around(b, angle);
        rotate_around(c, angle);
        rotate_around(d, angle);
    }
    // если присутствует смещение спрайта внутри гошки
    if (inner_offset) {
        rotate_around(inner_offset, angle);
        a.x += inner_offset.x; a.y += inner_offset.y;
        b.x += inner_offset.x; b.y += inner_offset.y;
        c.x += inner_offset.x; c.y += inner_offset.y;
        d.x += inner_offset.x; d.y += inner_offset.y;
    }

    a.x += go_pos.x; a.y += go_pos.y;
    b.x += go_pos.x; b.y += go_pos.y;
    c.x += go_pos.x; c.y += go_pos.y;
    d.x += go_pos.x; d.y += go_pos.y;



    return is_point_in_zone(a, b, c, d, check_pos);
}

// export function rotate_matrix_90(matrix: number[][]): number[][] {
//     // const n = matrix.length;
//     // const m = matrix[0].length;
//     // const rotated_matrix: number[][] = [];

//     // for (let i = 0; i < m; i++) {
//     //     rotated_matrix[i] = [];
//     //     for (let j = n - 1; j >= 0; j--) {
//     //         rotated_matrix[i].push(matrix[j][i]);
//     //     }
//     // }

//     // return rotated_matrix;

//     return matrix[0].map((val, index) => matrix.map(row => row[row.length-1-index]));
// }

export function rotateMatrix(matrix: number[][], degrees: number): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated: number[][] = [];

    // Initialize the rotated matrix with zeros
    for (let y = 0; y < cols; y++) {
        rotated[y] = [];
        for(let x = 0; x < rows; x++) {
            rotated[y][x] = 0;
        }
    }

    // Calculate the new coordinates after rotation
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let newRow, newCol;
            switch (degrees) {
                case 90:
                    newRow = j;
                    newCol = rows - 1 - i;
                    break;
                case 180:
                    newRow = rows - 1 - i;
                    newCol = cols - 1 - j;
                    break;
                case 270:
                    newRow = cols - 1 - j;
                    newCol = i;
                    break;
                default:
                    Log.error("[ROTATION MATRIX] Invalid degrees: ", degrees);
                    return matrix;
            }
            rotated[newRow][newCol] = matrix[i][j];
        }
    }

    return rotated;
}


export function is_valid_pos(x: number, y: number, size_x: number, size_y: number): boolean {
    if(x < 0 || x >= size_x || y < 0 || y >= size_y) return false;
    return true;
}

export function get_neighbors<T>(x: number, y: number, array: T[][], mask: number[][]): T[] {
    const neighbors = [];
    for (let i = y - 1; i <= y + 1; i++) {
        for (let j = x - 1; j <= x + 1; j++) {
            if (i >= 0 && i < array.length && j >= 0 && j < array[0].length && mask[i - (y - 1)][j - (x - 1)] == 1) {
                neighbors.push(array[i][j]);
            }
        }
    }

    return neighbors;
}

export function is_neighbor(x: number, y: number, other_x: number, other_y: number, mask = [[0, 1, 0,], [1, 0, 1], [0, 1, 0]]): boolean {
    for (let i = other_y - 1; i <= other_y + 1; i++) {
        for (let j = other_x - 1; j <= other_x + 1; j++) {
            if (mask[i - (other_y - 1)][j - (other_x - 1)] == 1 && j == x && i == y) {
                return true;
            }
        }
    }

    return false;
}

export function get_debug_intersect_points() {
    return [a, b, c, d];
}