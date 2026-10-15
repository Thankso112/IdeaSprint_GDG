import { getAccessToken } from './workspaceAuth';

export interface GmailMessagePreview {
  id: string;
  threadId: string;
  snippet?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
}

// ---------------- GMAIL API ---------------- //

/**
 * Encodes an email into base64url format for the Gmail API.
 */
function createBase64Email(to: string, from: string, subject: string, bodyText: string): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText,
  ];
  const message = messageParts.join('\r\n');
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends a rescue coordination email via the user's Gmail account.
 * User confirmation is required before dispatching.
 */
export async function sendGmailRescueAlert(params: {
  toEmail: string;
  subject: string;
  messageBody: string;
  confirmedByUser: boolean;
}): Promise<{ id: string; threadId: string }> {
  if (!params.confirmedByUser) {
    throw new Error('User confirmation required prior to sending Gmail message.');
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please connect your Google Account with Gmail permissions.');
  }

  const raw = createBase64Email(params.toEmail, 'me', params.subject, params.messageBody);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gmail API error (${res.status})`);
  }

  return await res.json();
}

/**
 * Lists the user's recent messages.
 */
export async function listRecentGmailMessages(maxResults = 5): Promise<GmailMessagePreview[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=FoodBridge`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.messages || [];
}

// ---------------- GOOGLE TASKS API ---------------- //

/**
 * Lists the user's tasks from the default task list.
 */
export async function listGoogleTasks(): Promise<GoogleTask[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await fetch(
    'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true&maxResults=20',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

/**
 * Creates a new task in Google Tasks.
 * Requires user confirmation prior to execution.
 */
export async function createGoogleTask(params: {
  title: string;
  notes?: string;
  due?: string; // RFC 3339 timestamp
  confirmedByUser: boolean;
}): Promise<GoogleTask> {
  if (!params.confirmedByUser) {
    throw new Error('User confirmation required prior to creating a Google Task.');
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please connect your Google Account with Google Tasks permissions.');
  }

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: params.title,
      notes: params.notes,
      due: params.due,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Tasks API error (${res.status})`);
  }

  return await res.json();
}

/**
 * Marks a task as completed in Google Tasks.
 * Requires user confirmation prior to execution.
 */
export async function completeGoogleTask(params: {
  taskId: string;
  confirmedByUser: boolean;
}): Promise<GoogleTask> {
  if (!params.confirmedByUser) {
    throw new Error('User confirmation required prior to modifying Google Tasks.');
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please connect your Google Account with Google Tasks permissions.');
  }

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${params.taskId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed',
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Tasks API error (${res.status})`);
  }

  return await res.json();
}
