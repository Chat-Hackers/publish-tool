import { DuckDBConnection, DuckDBInstance, DuckDBTimestampMillisecondsValue } from "@duckdb/node-api";
import path from "node:path";

let connection: DuckDBConnection;
let instance: DuckDBInstance;

export async function startDuckDB() {
    const postsDuckDBFileName = "posts_duckdb.db";

    const dataDir = process.env.DUCKDB_DATA_DIR ?? path.resolve(__dirname, "../..");
    const dbPath = path.join(dataDir, postsDuckDBFileName);

    instance = await DuckDBInstance.create(dbPath);
    connection = await instance.connect();

    const tables = [
        {
            name: "Groups",
            creationCommand:
                "CREATE TABLE Groups (room_id VARCHAR NOT NULL, group_id VARCHAR DEFAULT gen_random_uuid()::VARCHAR);"
        },
        {
            name: "Posts",
            creationCommand:
                "CREATE TABLE Posts (group_id VARCHAR NOT NULL, text VARCHAR NOT NULL, time TIMESTAMP_MS DEFAULT localtimestamp);",
        }
    ]

    const existingTablesRows = await connection.run("SHOW TABLES;");
    const existingTables = await existingTablesRows.getRowObjects();

    tables.forEach(async (table) => {
        const tableExists = existingTables.filter((existingTable) => existingTable.name === table.name).length > 0;

        if (tableExists) {
            console.log(`${table.name} already exists`);
        } else {
            await connection.run(table.creationCommand);
            console.log(`${table.name} created`);
        }
    });
}

export async function getGroupByRoomId(roomId: string) {
    const getGroup = `SELECT * FROM Groups WHERE room_id = $1;`;
    const prepared = await connection.prepare(getGroup);
    prepared.bindVarchar(1, roomId);
    const groupRows = await prepared.run();
    const groups = await groupRows.getRowObjects();
    return groups[0];
}

export async function insertGroup(roomId: string) {
    const insertGroup = `INSERT INTO Groups (room_id) values ($1);`;
    const prepared = await connection.prepare(insertGroup);
    prepared.bindVarchar(1, roomId);
    const group = await prepared.run();
    return group;
}

export async function getPostsByGroupId(groupId: string) {
    const getPosts = `SELECT * FROM Posts WHERE group_id = $1;`;
    const prepared = await connection.prepare(getPosts);
    prepared.bindVarchar(1, groupId);
    const postsRows = await prepared.run();
    const posts = await postsRows.getRowObjects();
    const postsWithDates = posts.map(post => ({ ...post, time: new Date(Number((post.time as DuckDBTimestampMillisecondsValue).millis)) }))
    return postsWithDates;
}

export async function insertPost(groupId: string, text: string) {
    const insertPost = `INSERT INTO Posts (group_id, text) values ($1, $2);`;
    const prepared = await connection.prepare(insertPost);
    prepared.bindVarchar(1, groupId);
    prepared.bindVarchar(2, text);
    await prepared.run();
    return;
}

export async function updatePost(groupId: string, newText: string, oldText: string) {
    const updatePost = `UPDATE Posts SET text = $3 WHERE group_id = $1 AND text = $2`;
    const prepared = await connection.prepare(updatePost);
    prepared.bindVarchar(1, groupId);
    prepared.bindVarchar(2, oldText);
    prepared.bindVarchar(3, newText);
    await prepared.run();
    return;
}

export async function deletePost(groupId: string, text: string) {
    const deletePost = `DELETE FROM Posts WHERE group_id=$1 AND text=$2;`;
    const prepared = await connection.prepare(deletePost);
    prepared.bindVarchar(1, groupId);
    prepared.bindVarchar(2, text);
    await prepared.run();
    return;
}

startDuckDB();