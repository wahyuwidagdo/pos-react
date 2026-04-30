import { useState, useEffect } from 'react';
import { Title, Tabs, Paper, Text, Avatar, Group, Button, Switch, Divider, Stack, TextInput, PasswordInput, Textarea, Badge, LoadingOverlay, Table, ActionIcon, Modal, NumberInput, Tooltip, Checkbox } from '@mantine/core';
import { IconUser, IconSettings, IconShieldLock, IconDeviceFloppy, IconCheck, IconBuildingStore, IconCreditCard, IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { useMantineColorScheme } from '@mantine/core';
import useAuthStore from '../store/useAuthStore';
import { settingsService, authService } from '../api/services';import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Settings() {
    const { t } = useTranslation();
    const { user, setUser, fetchProfile } = useAuthStore();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    // Profile form state
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        full_name: user?.full_name || '',
    });

    // Password form state
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    // Store settings form state (admin only)
    const [storeLoading, setStoreLoading] = useState(false);
    const [storeForm, setStoreForm] = useState({
        store_name: '',
        address: '',
        phone: '',
        footer_text: '',
    });
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const isAdminOrManagerRole = ['admin', 'manager'].includes(user?.role?.toLowerCase());
    const queryClient = useQueryClient();

    // Payment Methods state
    const [pmModalOpened, setPmModalOpened] = useState(false);
    const [editPm, setEditPm] = useState(null);
    const [pmForm, setPmForm] = useState({ name: '', is_cash: false, is_active: true, sort_order: 0 });

    // Fetch latest profile on mount
    useEffect(() => {
        fetchProfile().then((u) => {
            if (u) {
                setProfileForm({
                    username: u.username || '',
                    full_name: u.full_name || '',
                });
            }
        });
    }, []);

    // Fetch store settings on mount (admin only)
    useEffect(() => {
        if (isAdmin) {
            settingsService.getStoreSettings().then((res) => {
                const s = res.data;
                if (s) {
                    setStoreForm({
                        store_name: s.store_name || '',
                        address: s.address || '',
                        phone: s.phone || '',
                        footer_text: s.footer_text || '',
                    });
                }
            }).catch(() => { });
        }
    }, [isAdmin]);

    const handleUpdateStoreSettings = async () => {
        setStoreLoading(true);
        try {
            await settingsService.updateStoreSettings(storeForm);
            notifications.show({
                title: t('common.success'),
                message: t('settings.store_updated'),
                color: 'green',
                icon: <IconCheck size={16} />,
            });
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: error.response?.data?.error || 'Failed to update store settings',
                color: 'red',
            });
        } finally {
            setStoreLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setProfileLoading(true);
        try {
            const response = await authService.updateProfile({
                username: profileForm.username,
                full_name: profileForm.full_name,
            });
            const updatedUser = response.data;
            setUser(updatedUser);
            notifications.show({
                title: t('common.success'),
                message: t('settings.profile_updated'),
                color: 'green',
                icon: <IconCheck size={16} />,
            });
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: error.response?.data?.error || 'Failed to update profile',
                color: 'red',
            });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async () => {
        // Client-side validation
        if (!passwordForm.current_password || !passwordForm.new_password) {
            notifications.show({
                title: t('common.error'),
                message: 'All password fields are required',
                color: 'red',
            });
            return;
        }
        if (passwordForm.new_password.length < 6) {
            notifications.show({
                title: t('common.error'),
                message: 'New password must be at least 6 characters',
                color: 'red',
            });
            return;
        }
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            notifications.show({
                title: t('common.error'),
                message: 'New passwords do not match',
                color: 'red',
            });
            return;
        }

        setPasswordLoading(true);
        try {
            await authService.changePassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
            });
            notifications.show({
                title: t('common.success'),
                message: t('settings.password_updated'),
                color: 'green',
                icon: <IconCheck size={16} />,
            });
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: error.response?.data?.error || 'Failed to change password',
                color: 'red',
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'red';
            case 'manager': return 'blue';
            case 'cashier': return 'green';
            default: return 'gray';
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Title order={2} fw={800} c="kala-lilac.9" mb="lg">{t('settings.title')}</Title>

            <Tabs defaultValue="profile" radius="md" keepMounted={false} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Tabs.List>
                    <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>{t('settings.profile')}</Tabs.Tab>
                    {isAdmin && (
                        <Tabs.Tab value="store" leftSection={<IconBuildingStore size={16} />}>{t('settings.store_details')}</Tabs.Tab>
                    )}
                    {isAdminOrManagerRole && (
                        <Tabs.Tab value="payment-methods" leftSection={<IconCreditCard size={16} />}>{t('settings.payment_methods', 'Payment Methods')}</Tabs.Tab>
                    )}
                    <Tabs.Tab value="app" leftSection={<IconSettings size={16} />}>{t('settings.application')}</Tabs.Tab>
                    <Tabs.Tab value="security" leftSection={<IconShieldLock size={16} />}>{t('settings.security')}</Tabs.Tab>
                </Tabs.List>

                <div style={{ flex: 1, overflow: 'auto', paddingTop: '1rem' }}>
                    <Tabs.Panel value="profile">
                        <Stack gap="xl" maw={600}>
                            <Paper p="md" radius="md" withBorder pos="relative">
                                <LoadingOverlay visible={profileLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                                <Title order={4} mb="md">{t('settings.personal_info')}</Title>
                                <Group mb="md">
                                    <Avatar size="xl" radius="xl" color="kala-lilac" name={user?.username} />
                                    <div>
                                        <Text size="lg" fw={600}>{user?.full_name || user?.username || 'User'}</Text>
                                        <Group gap="xs">
                                            <Text c="dimmed" size="sm">@{user?.username}</Text>
                                            <Badge
                                                color={getRoleBadgeColor(user?.role)}
                                                variant="light"
                                                size="sm"
                                            >
                                                {user?.role?.toUpperCase() || 'STAFF'}
                                            </Badge>
                                        </Group>
                                    </div>
                                </Group>
                                <Stack>
                                    <TextInput
                                        label={t('settings.username')}
                                        value={profileForm.username}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                                    />
                                    <TextInput
                                        label={t('auth.full_name')}
                                        value={profileForm.full_name}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                                    />
                                    <Button
                                        variant="light"
                                        leftSection={<IconDeviceFloppy size={16} />}
                                        w={200}
                                        onClick={handleUpdateProfile}
                                        loading={profileLoading}
                                    >
                                        {t('settings.update_profile')}
                                    </Button>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Tabs.Panel>

                    {isAdmin && (
                        <Tabs.Panel value="store">
                            <Stack gap="xl" maw={600}>
                                <Paper p="md" radius="md" withBorder pos="relative">
                                    <LoadingOverlay visible={storeLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
                                    <Title order={4} mb="md">{t('settings.store_details')}</Title>
                                    <Text c="dimmed" size="sm" mb="md">{t('settings.store_desc')}</Text>
                                    <Stack>
                                        <TextInput
                                            label={t('settings.store_name')}
                                            placeholder="My Store"
                                            value={storeForm.store_name}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, store_name: e.target.value }))}
                                        />
                                        <Textarea
                                            label={t('settings.address')}
                                            placeholder="Jl. Contoh No. 123"
                                            value={storeForm.address}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                                            minRows={2}
                                        />
                                        <TextInput
                                            label={t('settings.phone')}
                                            placeholder="021-555-0123"
                                            value={storeForm.phone}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, phone: e.target.value }))}
                                        />
                                        <TextInput
                                            label={t('settings.footer_text')}
                                            placeholder="Thank you for your purchase!"
                                            value={storeForm.footer_text}
                                            onChange={(e) => setStoreForm(prev => ({ ...prev, footer_text: e.target.value }))}
                                        />
                                        <Button
                                            variant="light"
                                            leftSection={<IconDeviceFloppy size={16} />}
                                            w={200}
                                            onClick={handleUpdateStoreSettings}
                                            loading={storeLoading}
                                        >
                                            {t('settings.save_changes')}
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Tabs.Panel>
                    )}

                    <Tabs.Panel value="app">
                        <Paper p="md" radius="md" withBorder maw={600}>
                            <Title order={4} mb="md">{t('settings.app_preferences')}</Title>
                            <Stack gap="lg">
                                <Group justify="space-between">
                                    <div>
                                        <Text fw={500}>{t('settings.dark_mode')}</Text>
                                        <Text c="dimmed" size="xs">{t('settings.toggle_theme')}</Text>
                                    </div>
                                    <Switch checked={colorScheme === 'dark'} onChange={() => toggleColorScheme()} />
                                </Group>
                                <Divider />
                                <Group justify="space-between">
                                    <div>
                                        <Text fw={500}>{t('settings.sound_effects')}</Text>
                                        <Text c="dimmed" size="xs">{t('settings.play_sounds')}</Text>
                                    </div>
                                    <Switch defaultChecked />
                                </Group>
                                <Divider />
                                <Group justify="space-between">
                                    <div>
                                        <Text fw={500}>{t('settings.cash_register')}</Text>
                                        <Text c="dimmed" size="xs">{t('settings.connect_hardware')}</Text>
                                    </div>
                                    <Button variant="outline" size="xs">{t('common.configure')}</Button>
                                </Group>
                            </Stack>
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="security">
                        <Paper p="md" radius="md" withBorder maw={600} pos="relative">
                            <LoadingOverlay visible={passwordLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                            <Title order={4} mb="md">{t('settings.change_password')}</Title>
                            <Stack>
                                <PasswordInput
                                    label={t('settings.current_password')}
                                    placeholder="********"
                                    value={passwordForm.current_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                                />
                                <PasswordInput
                                    label={t('settings.new_password')}
                                    placeholder="********"
                                    value={passwordForm.new_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                                />
                                <PasswordInput
                                    label={t('settings.confirm_password')}
                                    placeholder="********"
                                    value={passwordForm.confirm_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                                />
                                <Button
                                    color="red"
                                    variant="light"
                                    w={200}
                                    onClick={handleChangePassword}
                                    loading={passwordLoading}
                                >
                                    {t('settings.update_password')}
                                </Button>
                            </Stack>
                        </Paper>
                    </Tabs.Panel>

                    <PaymentMethodsPanel
                        queryClient={queryClient}
                        pmModalOpened={pmModalOpened}
                        setPmModalOpened={setPmModalOpened}
                        editPm={editPm}
                        setEditPm={setEditPm}
                        pmForm={pmForm}
                        setPmForm={setPmForm}
                        t={t}
                    />
                </div>
            </Tabs>
        </div>
    );
}

// ========== Payment Methods Sub-Panel ==========
function PaymentMethodsPanel({ queryClient, pmModalOpened, setPmModalOpened, editPm, setEditPm, pmForm, setPmForm, t }) {
    // Fetch payment methods
    const { data: methods = [], isLoading } = useQuery({
        queryKey: ['payment-methods'],
        queryFn: async () => {
            const res = await settingsService.getPaymentMethods();
            return res.data || [];
        },
    });

    const saveMutation = useMutation({
        mutationFn: (payload) => {
            if (editPm) return settingsService.updatePaymentMethod(editPm.id, payload);
            return settingsService.createPaymentMethod(payload);
        },
        onSuccess: () => {
            notifications.show({ title: 'Success', message: editPm ? 'Payment method updated' : 'Payment method created', color: 'green', icon: <IconCheck size={16} /> });
            queryClient.invalidateQueries(['payment-methods']);
            resetPmForm();
        },
        onError: (err) => {
            notifications.show({ title: 'Error', message: err.response?.data?.error || 'Operation failed', color: 'red' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => settingsService.deletePaymentMethod(id),
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: 'Payment method removed', color: 'orange' });
            queryClient.invalidateQueries(['payment-methods']);
        },
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, is_active }) => settingsService.updatePaymentMethod(id, { is_active }),
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-methods']);
        },
    });

    const resetPmForm = () => {
        setEditPm(null);
        setPmForm({ name: '', is_cash: false, is_active: true, sort_order: 0 });
        setPmModalOpened(false);
    };

    const handleEditPm = (pm) => {
        setEditPm(pm);
        setPmForm({ name: pm.name, is_cash: pm.is_cash, is_active: pm.is_active, sort_order: pm.sort_order });
        setPmModalOpened(true);
    };

    const handleSavePm = () => {
        if (!pmForm.name.trim()) {
            notifications.show({ title: 'Error', message: 'Name is required', color: 'red' });
            return;
        }
        saveMutation.mutate(pmForm);
    };

    return (
        <Tabs.Panel value="payment-methods">
            <Paper p="md" radius="md" withBorder maw={700}>
                <Group justify="space-between" mb="md">
                    <div>
                        <Title order={4}>{t('settings.payment_methods', 'Payment Methods')}</Title>
                        <Text c="dimmed" size="sm">Manage payment options for POS checkout</Text>
                    </div>
                    <Button size="xs" leftSection={<IconPlus size={14} />} color="kala-lilac" onClick={() => { resetPmForm(); setPmModalOpened(true); }}>
                        Add Method
                    </Button>
                </Group>

                {isLoading ? (
                    <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                ) : methods.length === 0 ? (
                    <Text c="dimmed" ta="center" py="lg">No payment methods configured. Add one to get started.</Text>
                ) : (
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th ta="center">Cash?</Table.Th>
                                <Table.Th ta="center">Active</Table.Th>
                                <Table.Th ta="center">Order</Table.Th>
                                <Table.Th ta="center">Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {methods.map((pm) => (
                                <Table.Tr key={pm.id}>
                                    <Table.Td fw={500}>{pm.name}</Table.Td>
                                    <Table.Td ta="center">
                                        {pm.is_cash ? <Badge color="green" size="xs">Cash</Badge> : <Badge color="gray" size="xs" variant="outline">Non-Cash</Badge>}
                                    </Table.Td>
                                    <Table.Td ta="center">
                                        <Switch
                                            size="xs"
                                            checked={pm.is_active}
                                            color="teal"
                                            onChange={() => toggleMutation.mutate({ id: pm.id, is_active: !pm.is_active })}
                                        />
                                    </Table.Td>
                                    <Table.Td ta="center">
                                        <Text size="sm">{pm.sort_order}</Text>
                                    </Table.Td>
                                    <Table.Td ta="center">
                                        <Group gap={4} justify="center">
                                            <Tooltip label="Edit">
                                                <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => handleEditPm(pm)}>
                                                    <IconEdit size={14} />
                                                </ActionIcon>
                                            </Tooltip>
                                            <Tooltip label="Delete">
                                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => deleteMutation.mutate(pm.id)}>
                                                    <IconTrash size={14} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Paper>

            {/* Add/Edit Modal */}
            <Modal opened={pmModalOpened} onClose={resetPmForm} title={editPm ? 'Edit Payment Method' : 'Add Payment Method'} centered size="sm">
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="e.g., Cash, QRIS, BCA Transfer"
                        value={pmForm.name}
                        onChange={(e) => setPmForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />
                    <Group grow>
                        <Checkbox
                            label="Is Cash Payment"
                            checked={pmForm.is_cash}
                            onChange={(e) => setPmForm(prev => ({ ...prev, is_cash: e.currentTarget.checked }))}
                        />
                        <Checkbox
                            label="Active"
                            checked={pmForm.is_active}
                            onChange={(e) => setPmForm(prev => ({ ...prev, is_active: e.currentTarget.checked }))}
                        />
                    </Group>
                    <NumberInput
                        label="Sort Order"
                        value={pmForm.sort_order}
                        onChange={(v) => setPmForm(prev => ({ ...prev, sort_order: v }))}
                        min={0}
                    />
                    <Button color="kala-lilac" onClick={handleSavePm} loading={saveMutation.isPending} fullWidth>
                        {editPm ? 'Update' : 'Create'}
                    </Button>
                </Stack>
            </Modal>
        </Tabs.Panel>
    );
}
