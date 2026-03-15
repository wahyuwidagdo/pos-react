import { useRef } from 'react';
import {
    Popover,
    ActionIcon,
    Indicator,
    Text,
    Group,
    Stack,
    ScrollArea,
    UnstyledButton,
    Paper,
    Divider,
    ThemeIcon,
    Tooltip,
    Center,
    Button,
} from '@mantine/core';
import {
    IconBell,
    IconPackage,
    IconReceipt,
    IconAlertTriangle,
    IconInfoCircle,
    IconTrash,
    IconChecks,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import useNotificationStore from '../../store/useNotificationStore';

const ICON_MAP = {
    stock_alert: { icon: IconPackage, color: 'orange' },
    transaction: { icon: IconReceipt, color: 'teal' },
    warning: { icon: IconAlertTriangle, color: 'red' },
    system: { icon: IconInfoCircle, color: 'blue' },
};

function formatTimeAgo(timestamp, t) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return t('notifications.just_now', 'Just now');
    if (diffMin < 60) return `${diffMin}m ${t('notifications.ago', 'ago')}`;
    if (diffHr < 24) return `${diffHr}h ${t('notifications.ago', 'ago')}`;
    if (diffDay < 7) return `${diffDay}d ${t('notifications.ago', 'ago')}`;
    return date.toLocaleDateString();
}

function NotificationItem({ notification, onRead, onRemove, t }) {
    const config = ICON_MAP[notification.type] || ICON_MAP.system;
    const Icon = config.icon;

    return (
        <UnstyledButton
            onClick={() => onRead(notification.id)}
            style={{ width: '100%' }}
        >
            <Paper
                p="sm"
                radius="md"
                style={{
                    background: notification.read
                        ? 'transparent'
                        : 'var(--mantine-color-kala-lilac-0)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    border: notification.read
                        ? '1px solid transparent'
                        : '1px solid rgba(147, 117, 250, 0.1)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--mantine-color-default-hover)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.read
                        ? 'transparent'
                        : 'var(--mantine-color-kala-lilac-0)';
                }}
            >
                <Group gap="sm" wrap="nowrap" align="flex-start">
                    <ThemeIcon
                        variant="light"
                        color={config.color}
                        size="md"
                        radius="md"
                        style={{ flexShrink: 0, marginTop: 2 }}
                    >
                        <Icon size={14} stroke={1.5} />
                    </ThemeIcon>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Group justify="space-between" gap={4} wrap="nowrap">
                            <Text
                                size="sm"
                                fw={notification.read ? 400 : 600}
                                lineClamp={1}
                            >
                                {notification.title}
                            </Text>
                            {!notification.read && (
                                <div
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        background: '#9775FA',
                                        flexShrink: 0,
                                    }}
                                />
                            )}
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                            {notification.message}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4} style={{ opacity: 0.6 }}>
                            {formatTimeAgo(notification.timestamp, t)}
                        </Text>
                    </div>

                    <Tooltip label={t('common.delete', 'Delete')}>
                        <ActionIcon
                            size="xs"
                            variant="subtle"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(notification.id);
                            }}
                            style={{ marginTop: 2, flexShrink: 0 }}
                        >
                            <IconTrash size={12} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Paper>
        </UnstyledButton>
    );
}

export default function NotificationCenter() {
    const { t } = useTranslation();
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
        useNotificationStore();

    return (
        <Popover width={380} position="bottom-end" radius="lg" shadow="xl" withArrow arrowSize={12}>
            <Popover.Target>
                <Indicator
                    inline
                    label={unreadCount > 9 ? '9+' : unreadCount}
                    size={18}
                    offset={4}
                    color="red"
                    disabled={unreadCount === 0}
                    processing={unreadCount > 0}
                >
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        radius="xl"
                        style={{
                            color: 'var(--mantine-color-dimmed)',
                        }}
                    >
                        <IconBell size={20} stroke={1.5} />
                    </ActionIcon>
                </Indicator>
            </Popover.Target>

            <Popover.Dropdown p={0} style={{ overflow: 'hidden' }}>
                {/* Header */}
                <Group justify="space-between" p="md" pb="xs">
                    <div>
                        <Text fw={700} size="sm">
                            {t('notifications.title', 'Notifications')}
                        </Text>
                        {unreadCount > 0 && (
                            <Text size="xs" c="dimmed">
                                {unreadCount} {t('notifications.unread', 'unread')}
                            </Text>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <Group gap={4}>
                            {unreadCount > 0 && (
                                <Tooltip label={t('notifications.mark_all_read', 'Mark all read')}>
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        color="kala-lilac"
                                        onClick={markAllAsRead}
                                    >
                                        <IconChecks size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                            <Tooltip label={t('notifications.clear_all', 'Clear all')}>
                                <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    color="gray"
                                    onClick={clearAll}
                                >
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    )}
                </Group>

                <Divider />

                {/* Notification List */}
                <ScrollArea.Autosize mah={400} type="auto">
                    {notifications.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="xs">
                                <IconBell size={32} stroke={1} style={{ opacity: 0.3 }} />
                                <Text size="sm" c="dimmed">
                                    {t('notifications.empty', 'No notifications yet')}
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Stack gap={2} p="xs">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={markAsRead}
                                    onRemove={removeNotification}
                                    t={t}
                                />
                            ))}
                        </Stack>
                    )}
                </ScrollArea.Autosize>
            </Popover.Dropdown>
        </Popover>
    );
}
