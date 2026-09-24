"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markNotificationRead = markNotificationRead;
exports.markAllNotificationsRead = markAllNotificationsRead;
const mockDb_js_1 = require("../services/mockDb.js");
async function getNotifications(req, res) {
    const userId = req.user?.id;
    const notifs = mockDb_js_1.mockDb.notifications.filter((n) => n.user_id === userId);
    return res.json(notifs);
}
async function markNotificationRead(req, res) {
    const { id } = req.params;
    const notif = mockDb_js_1.mockDb.notifications.find((n) => n.id === id);
    if (!notif) {
        return res.status(404).json({ error: 'Notification not found' });
    }
    notif.is_read = true;
    notif.read_at = new Date().toISOString();
    return res.json(notif);
}
async function markAllNotificationsRead(req, res) {
    const userId = req.user?.id;
    mockDb_js_1.mockDb.notifications
        .filter((n) => n.user_id === userId)
        .forEach((n) => {
        n.is_read = true;
        n.read_at = new Date().toISOString();
    });
    return res.json({ message: 'All notifications marked as read' });
}
