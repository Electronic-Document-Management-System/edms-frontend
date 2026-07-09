"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import useAuthStore from "@/store/authStore";
import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteAllNotifications,
    deleteNotification
} from "@/features/notification/notification.api";
import { Notification } from "@/features/notification/notification.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function NotificationBell() {
    const currentUser = useAuthStore((state) => state.user);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);

    // Initial fetch
    const fetchNotifications = async () => {
        try {
            const data = await getNotifications(1, 20);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch {

        }
    };

    // SSE connection
    useEffect(() => {
        if (!currentUser?.id) return;

        fetchNotifications();

        const es = new EventSource(
            `/api/backend/notification/stream`,
            { withCredentials: true }
        );

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "PING" || data.type === "CONNECTED") return;

                fetchNotifications();
            } catch {
            }
        };

        es.onerror = () => {
        };

        eventSourceRef.current = es;

        return () => {
            es.close();
        };
    }, [currentUser?.id]);

    const handleMarkAsRead = async (notification: Notification) => {
        if (notification.isRead) return;

        try {
            await markNotificationAsRead(notification.id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            toast.error("Failed to mark notification as read.");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setIsMarkingAll(true);
            await markAllNotificationsAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {
            toast.error("Failed to mark all as read.");
        } finally {
            setIsMarkingAll(false);
        }
    };

    const handleDeleteNotification = async (
        e: React.MouseEvent,
        notification: Notification
    ) => {
        e.stopPropagation();

        try {
            setDeletingId(notification.id);
            await deleteNotification(notification.id);
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
            if (!notification.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch {
            toast.error("Failed to delete notification.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteAll = async () => {
        try {
            setIsDeletingAll(true);
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch {
            toast.error("Failed to delete all notifications.");
        } finally {
            setIsDeletingAll(false);
        }
    };


    const getNotificationIcon = (type: string) => {
        if (type.includes("COMMENT")) return "💬";
        if (type.includes("WORKFLOW") || type.includes("APPROVED")) return "✅";
        if (type.includes("REJECTED")) return "❌";
        if (type.includes("SHARED")) return "🔗";
        if (type.includes("ASSIGNED")) return "👤";
        return "🔔";
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllAsRead}
                            disabled={isMarkingAll}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            {isMarkingAll ? "Marking..." : "Mark all read"}
                        </Button>
                    )}
                    {
                        notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size='sm'
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                                onClick={handleDeleteAll}
                                disabled={isDeletingAll}
                            >
                                {isDeletingAll ? "Deleting..." : "Clear all"}
                            </Button>
                        )
                    }
                </div>

                {/* List */}
                <div className="max-h-100 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <Bell className="mb-2 h-8 w-8 opacity-30" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleMarkAsRead(notification)}
                                className={` flex cursor-pointer gap-3 border-b px-4 py-3 transition hover:bg-background ${!notification.isRead ? "bg-blue-50/50" : ""
                                    }`}
                            >
                                <span className="mt-0.5 text-lg leading-none">
                                    {getNotificationIcon(notification.type)}
                                </span>

                                <div className="flex-1 space-y-0.5">
                                    <p className="text-sm font-medium leading-snug">
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                {!notification.isRead && (
                                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                )}
                                <button
                                    onClick={(e) => handleDeleteNotification(e, notification)}
                                    disabled={deletingId === notification.id}
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t px-4 py-2 text-center">
                        <p className="text-xs text-muted-foreground">
                            Showing {notifications.length} notifications
                        </p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}