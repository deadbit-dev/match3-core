/** @noResolution */

declare namespace spine {
    export function play_anim(id: string, anim: string, easing: any, property: string | hash, complete_function?: any): void;
    export function set_ik_target_position(url: any, ik_constraint_id: any, position: vmath.vector3): void;
    export function set_ik_target(url: any, ik_constraint_id: any, target_url: any): void;
    export function get_go(url: any, bone_id: any): hash;
}