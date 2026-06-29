import { getGroupByRoomId, insertGroup, insertPost } from "./duckdb";
import { Group } from "../types";

export default async function publish(event: { [key: string]: any }, roomId: string) {
    const group: undefined | Group = await getGroupByRoomId(roomId) as Group;
    let groupId;

    if (group) {
        groupId = group.group_id;
    }
    else {
        await insertGroup(roomId);
        const newGroup: undefined | Group = await getGroupByRoomId(roomId) as Group;
        groupId = newGroup.group_id;
    }

    const text = event.content.body;
    await insertPost(groupId, text);

    return { message: "post added to publish list" };
}