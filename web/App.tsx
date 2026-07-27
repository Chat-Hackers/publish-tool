import "./App.css";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { getPosts, postPost, deletePost, getGroup } from "./requests";

const { origin, pathname } = window.location;
const BASE_URL = `${origin}${pathname}`;

export default function App() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [groupId, setGroupId] = useState<string>();
  const [posts, setPosts] = useState<
    { group_id: string; text: string; time: string }[]
  >([]);
  const [newPost, setNewPost] = useState("");
  const [deletingPost, setDeletingPost] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadGroupId() {
    const group = roomId ? await getGroup(roomId) : "";
    setGroupId(group.group_id);
  }

  async function loadPosts(groupId: string) {
    const posts = await getPosts(groupId);
    setPosts(posts);
  }

  async function createPost() {
    if (groupId && newPost) {
      setNewPost("");
      await postPost(groupId, newPost);
      loadPosts(groupId);
    }
  }

  async function removePost(text: string) {
    if (groupId) {
      await deletePost(groupId, text);
      loadPosts(groupId);
    }
  }

  useEffect(() => {
    loadGroupId();
    if (groupId) {
      loadPosts(groupId);
    }
  }, [groupId]);

  const publishingUrl = `${BASE_URL}/api/posts?groupId=${groupId}`;

  return (
    <>
      <h1>Publish to Web</h1>
      <h2>Web publishing url</h2>
      <div className="copy-container">
        <input
          id="url-input"
          readOnly
          value={publishingUrl}
          className="copy-box"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(publishingUrl);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 2000);
          }}
        >
          Copy
        </button>
        {copied && <p className="copy-text">Copied!</p>}
      </div>
      <input
        type="text"
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="new post"
      ></input>
      <button onClick={createPost}>Create</button>
      {posts.map((post) => (
        <>
          <p>{post.text}</p>
          <p>{post.time}</p>
          {deletingPost === post.text ? (
            <>
              <button onClick={() => setDeletingPost("")}>Cancel</button>
              <button onClick={() => removePost(post.text)}>Delete</button>
            </>
          ) : (
            <button onClick={() => setDeletingPost(post.text)}>Delete</button>
          )}
        </>
      ))}
    </>
  );
}
