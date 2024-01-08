/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as druid from 'druid.druid';

interface props {
    druid: DruidClass;
}

export function init(this: props): void {
    Manager.init_gui();
    this.druid = druid.new(this);
}

export function on_input(this: props, action_id: string | hash, action: unknown): void {
    return this.druid.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid.update(dt);
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    Manager.on_message_gui(this, message_id, message, sender);
    this.druid.on_message(message_id, message, sender);

    // handle massage
}

export function final(this: props): void {
    this.druid.final();
}