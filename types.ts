export type MatrixEvent = {
    content: {
        body: string;
    },
    sender: string;
    room_id: string;
}
export type Group = {
    group_id: string;
    room_id: string;
}