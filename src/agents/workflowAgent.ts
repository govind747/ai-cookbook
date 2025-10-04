import { insertDocument, updateDocument } from '../utils/supabaseClient';
import type { WorkflowAction } from '../types';

export const workflowAgent = async (
  action: WorkflowAction
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    switch (action.type) {
      case 'database':
        return await handleDatabaseAction(action.payload);

      case 'notification':
        return await handleNotificationAction(action.payload);

      case 'email':
        return await handleEmailAction(action.payload);

      case 'webhook':
        return await handleWebhookAction(action.payload);

      default:
        return {
          success: false,
          message: `Unknown action type: ${action.type}`,
        };
    }
  } catch (error: any) {
    console.error('Workflow Agent Error:', error);
    return {
      success: false,
      message: error.message || 'Workflow execution failed',
    };
  }
};

const handleDatabaseAction = async (
  payload: Record<string, any>
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const { operation, table, data, id } = payload;

    if (!table) {
      throw new Error('Table name is required for database operations');
    }

    switch (operation) {
      case 'insert':
        const insertResult = await insertDocument(table, data);
        if (!insertResult.success) {
          throw new Error(insertResult.error);
        }
        return {
          success: true,
          message: `Successfully inserted document into ${table}`,
          data: insertResult.data,
        };

      case 'update':
        if (!id) {
          throw new Error('Document ID is required for update operations');
        }
        const updateResult = await updateDocument(table, id, data);
        if (!updateResult.success) {
          throw new Error(updateResult.error);
        }
        return {
          success: true,
          message: `Successfully updated document in ${table}`,
          data: updateResult.data,
        };

      default:
        throw new Error(`Unsupported database operation: ${operation}`);
    }
  } catch (error: any) {
    console.error('Database Action Error:', error);
    return {
      success: false,
      message: error.message || 'Database operation failed',
    };
  }
};

const handleNotificationAction = async (
  payload: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  try {
    const { title, body, userId } = payload;

    if (!title || !body) {
      throw new Error('Title and body are required for notifications');
    }

    console.log(`[NOTIFICATION] To User ${userId || 'all'}:`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);

    const notification = {
      title,
      body,
      user_id: userId || null,
      read: false,
      created_at: new Date().toISOString(),
    };

    await insertDocument('notifications', notification);

    return {
      success: true,
      message: 'Notification sent successfully',
    };
  } catch (error: any) {
    console.error('Notification Action Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send notification',
    };
  }
};

const handleEmailAction = async (
  payload: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  try {
    const { to, subject, body } = payload;

    if (!to || !subject || !body) {
      throw new Error('To, subject, and body are required for emails');
    }

    console.log(`[EMAIL] Sending to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    const email = {
      to,
      subject,
      body,
      sent: true,
      sent_at: new Date().toISOString(),
    };

    await insertDocument('emails', email);

    return {
      success: true,
      message: `Email queued for sending to ${to}`,
    };
  } catch (error: any) {
    console.error('Email Action Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email',
    };
  }
};

const handleWebhookAction = async (
  payload: Record<string, any>
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const { url, method = 'POST', headers = {}, body } = payload;

    if (!url) {
      throw new Error('URL is required for webhook calls');
    }

    console.log(`[WEBHOOK] Calling: ${url}`);
    console.log(`Method: ${method}`);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json().catch(() => null);

    return {
      success: response.ok,
      message: response.ok
        ? 'Webhook called successfully'
        : `Webhook failed with status ${response.status}`,
      data: responseData,
    };
  } catch (error: any) {
    console.error('Webhook Action Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to call webhook',
    };
  }
};

export const createWorkflow = (
  name: string,
  actions: WorkflowAction[]
): (() => Promise<void>) => {
  return async () => {
    console.log(`[WORKFLOW] Starting: ${name}`);

    for (const action of actions) {
      const result = await workflowAgent(action);
      console.log(
        `[WORKFLOW] Action ${action.type}: ${result.success ? '✓' : '✗'} ${result.message}`
      );

      if (!result.success) {
        console.error(`[WORKFLOW] Failed at action: ${action.type}`);
        break;
      }
    }

    console.log(`[WORKFLOW] Completed: ${name}`);
  };
};

export const scheduleWorkflow = (
  workflow: () => Promise<void>,
  intervalMs: number
): NodeJS.Timeout => {
  return setInterval(workflow, intervalMs);
};
