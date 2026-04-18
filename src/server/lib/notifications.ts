import {
  notifications,
  nextNotificationId,
  type Notification,
} from "../data/store.js";

export interface CreateNotificationInput {
  userType: Notification["userType"];
  userId: string;
  ticketId: string;
  title: string;
  message: string;
  type: Notification["type"];
}

export function createNotification(input: CreateNotificationInput): Notification {
  const notification: Notification = {
    id: nextNotificationId(),
    userType: input.userType,
    userId: input.userId,
    ticketId: input.ticketId,
    title: input.title,
    message: input.message,
    type: input.type,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(notification);
  return notification;
}

export function listNotifications(userType: string, userId: string): Notification[] {
  return notifications.filter(
    (n) => n.userType === userType && n.userId === userId,
  );
}

export function markNotificationRead(id: string): Notification | null {
  const notification = notifications.find((n) => n.id === id);
  if (!notification) return null;
  notification.isRead = true;
  return notification;
}
