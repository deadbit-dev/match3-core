/** @noResolution **/
/* eslint-disable @typescript-eslint/no-explicit-any */


declare namespace collectionproxy {
    export function missing_resources(url: string): any;
}

declare let liveupdate: any;

declare interface Mount{
    name: string,
    uri: string,
    priority: number
}

declare interface liveupdate {
    get_mounts: () => Mount[]
}