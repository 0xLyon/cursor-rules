import type { gmail_v1 } from "@googleapis/gmail";
import { getMessage } from "@/utils/gmail/message";
import { getThreadsWithNextPageToken } from "@/utils/gmail/thread";
import type { MessageWithPayload } from "@/utils/types";
import type { SenderMap } from "@/app/api/user/categorize/senders/types";

export async function findSendersWithPagination(
  gmail: gmail_v1.Gmail,
  maxPages: number,
) {
  const allSenders: SenderMap = new Map();
  let nextPageToken: string | undefined = undefined;
  let currentPage = 0;

  while (currentPage < maxPages) {
    const { senders, nextPageToken: newNextPageToken } = await findSenders(
      gmail,
      nextPageToken,
    );

    Object.entries(senders).forEach(([sender, messages]) => {
      const existingMessages = allSenders.get(sender) ?? [];
      allSenders.set(sender, [...existingMessages, ...messages]);
    });

    if (!newNextPageToken) break; // No more pages

    nextPageToken = newNextPageToken;
    currentPage++;
  }

  return { senders: allSenders, nextPageToken };
}

export async function findSenders(
  gmail: gmail_v1.Gmail,
  pageToken?: string,
  maxResults = 50,
) {
  const senders: SenderMap = new Map();

  const { threads, nextPageToken } = await getThreadsWithNextPageToken({
    q: `-in:sent`,
    gmail,
    maxResults,
    pageToken,
  });

  for (const thread of threads) {
    if (!thread.id) continue;
    try {
      const message = await getMessage(thread.id, gmail, "metadata");

      const sender = extractSenderInfo(message);
      if (sender) {
        const existingMessages = senders.get(sender) ?? [];
        senders.set(sender, [...existingMessages, message]);
      }
    } catch (error) {
      if (isNotFoundError(error)) continue;
      console.error("Error getting message", error);
    }
  }

  return { senders, nextPageToken };
}

function extractSenderInfo(message: MessageWithPayload) {
  const fromHeader = message.payload?.headers?.find((h) => h.name === "From");
  if (!fromHeader?.value) return null;

  return fromHeader.value;
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as any).errors) &&
    (error as any).errors.some(
      (e: any) =>
        e.message === "Requested entity was not found." &&
        e.reason === "notFound",
    )
  );
}
