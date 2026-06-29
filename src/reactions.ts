import publish from "./publish";

export default function handleReaction(event: { [key: string]: any }, botUserId: string) {
  const reactionInfo = event.content["m.relates_to"];
  const eventFromReaction = event.prevEvent;

  const reactionEmoji = reactionInfo.key.trim();

  if (reactionEmoji.includes("🌐")) {
    return publish(eventFromReaction, event.room_id);
  }

  return undefined;
}