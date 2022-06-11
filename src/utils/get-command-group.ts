export type CommandGroup = 'PLAY' | 'QUEUE' | 'REMOVE' | string;
export default function getCommandGroup(
    prefix: string,
    command: string,
): CommandGroup {
    if ([`${prefix}p`, `${prefix}play`].includes(command)) {
        return 'PLAY';
    }

    if ([`${prefix}q`, `${prefix}queue`].includes(command)) {
        return 'QUEUE';
    }

    if ([`${prefix}rm`, `${prefix}remove`].includes(command)) {
        return 'REMOVE';
    }

    return 'unknown';
}
