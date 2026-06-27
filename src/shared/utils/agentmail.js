/**
 * AgentMail - Temporary email provider for automated account registration
 * Uses agentmail.to API for creating temporary inboxes and receiving verification emails
 */

const AGENTMAIL_API = 'https://api.agentmail.to/v0';
const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY || 'am_us_db243b3bbb61770be772fda9979a40dbbc56dc7a910e33be831f6bb48366bedd';

/**
 * Create a new temporary inbox
 * @param {string} prefix - Optional prefix for the email address
 * @returns {Promise<{inboxId: string, email: string}>}
 */
export async function createInbox(prefix = '') {
  const response = await fetch(`${AGENTMAIL_API}/inboxes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
    },
    body: JSON.stringify({
      prefix: prefix || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create inbox: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Get inbox details
 * @param {string} inboxId - The inbox ID
 * @returns {Promise<{inboxId: string, email: string, createdAt: string}>}
 */
export async function getInbox(inboxId) {
  const response = await fetch(`${AGENTMAIL_API}/inboxes/${inboxId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get inbox: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List messages in an inbox
 * @param {string} inboxId - The inbox ID
 * @returns {Promise<Array<{id: string, subject: string, from: string, createdAt: string}>>}
 */
export async function listMessages(inboxId) {
  const response = await fetch(`${AGENTMAIL_API}/inboxes/${inboxId}/messages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list messages: ${response.statusText}`);
  }

  const data = await response.json();
  return data.messages || data;
}

/**
 * Get a specific message
 * @param {string} inboxId - The inbox ID
 * @param {string} messageId - The message ID
 * @returns {Promise<{id: string, subject: string, from: string, text: string, html: string}>}
 */
export async function getMessage(inboxId, messageId) {
  const response = await fetch(`${AGENTMAIL_API}/inboxes/${inboxId}/messages/${messageId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get message: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Wait for a message to arrive in an inbox
 * @param {string} inboxId - The inbox ID
 * @param {number} timeout - Timeout in milliseconds (default: 60000)
 * @param {number} interval - Poll interval in milliseconds (default: 2000)
 * @returns {Promise<{id: string, subject: string, from: string, text: string}>}
 */
export async function waitForMessage(inboxId, timeout = 60000, interval = 2000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const messages = await listMessages(inboxId);
      if (messages && messages.length > 0) {
        return messages[0];
      }
    } catch (error) {
      // Ignore errors during polling
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for message in inbox ${inboxId}`);
}

/**
 * Extract verification link from email text
 * @param {string} text - Email text content
 * @param {string} pattern - URL pattern to match (default: verification link)
 * @returns {string|null} The verification link
 */
export function extractVerificationLink(text, pattern = null) {
  const defaultPattern = /https?:\/\/[^\s<>"]+(?:verify|confirm|activate)[^\s<>"]*/gi;
  const regex = pattern ? new RegExp(pattern, 'gi') : defaultPattern;
  const match = text.match(regex);
  return match ? match[0] : null;
}

/**
 * Extract verification code from email text
 * @param {string} text - Email text content
 * @param {number} length - Code length (default: 6)
 * @returns {string|null} The verification code
 */
export function extractVerificationCode(text, length = 6) {
  const pattern = new RegExp(`\\b\\d{${length}}\\b`, 'g');
  const match = text.match(pattern);
  return match ? match[0] : null;
}

/**
 * Delete an inbox
 * @param {string} inboxId - The inbox ID
 * @returns {Promise<boolean>}
 */
export async function deleteInbox(inboxId) {
  const response = await fetch(`${AGENTMAIL_API}/inboxes/${inboxId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
    },
  });

  return response.ok;
}

export default {
  createInbox,
  getInbox,
  listMessages,
  getMessage,
  waitForMessage,
  extractVerificationLink,
  extractVerificationCode,
  deleteInbox,
};
