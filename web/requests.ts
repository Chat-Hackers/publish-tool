const { origin, pathname } = window.location;
const BASE_URL = `${origin}${pathname}`;

export async function getGroup(roomId: string = "") {
    const groupResponse = await fetch(`${BASE_URL}/api/group?roomId=${roomId}`);
    const groupResult = await groupResponse.json();

    return groupResult;
}

export async function getPosts(groupId: string) {
    const postsResponse = await fetch(`${BASE_URL}/api/posts?groupId=${groupId}`);
    const postsResult = await postsResponse.json();

    return postsResult;
}

export async function postPost(groupId: string, text: string) {
    const postResponse = await fetch(`${BASE_URL}/api/post?groupId=${groupId}`, {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: {
            "Content-Type": "application/json"
        }
    });
    const postResult = await postResponse.json();

    return postResult;
}

export async function deletePost(groupId: string, text: string) {
    const deleteResponse = await fetch(`${BASE_URL}/api/post?groupId=${groupId}`, {
        method: "DELETE",
        body: JSON.stringify({ text }),
        headers: {
            "Content-Type": "application/json"
        }
    });
    const deleteResult = await deleteResponse.json();

    return deleteResult;
}