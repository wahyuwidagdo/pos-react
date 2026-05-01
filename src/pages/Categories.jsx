import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Title,
    Button,
    Group,
    Table,
    ActionIcon,
    Text,
    Modal,
    TextInput,
    Stack,
    LoadingOverlay,
    Card,
    Breadcrumbs,
    Anchor,
    Badge,
    Tooltip,
    SegmentedControl
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import {
    IconPlus,
    IconEdit,
    IconTrash,
    IconSearch,
    IconRestore,
    IconTrashX,
    IconAlertTriangle
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { categoryService } from '../api/services';

export default function Categories() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingId, setEditingId] = useState(null);
    const [showTrash, setShowTrash] = useState('active'); // 'active' or 'trash'

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        opened: false,
        title: '',
        message: '',
        action: null,
        confirmLabel: '',
        color: 'red'
    });

    // Search State
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 500);

    // Fetch Categories
    const { data, isLoading } = useQuery({
        queryKey: ['categories', showTrash],
        queryFn: async () => {
            const res = await categoryService.getAll({
                trashed: showTrash === 'trash'
            });
            return res.data || res;
        },
    });

    // Client-side filtering
    const filteredData = Array.isArray(data)
        ? data.filter(item => item?.name && item.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
        : [];

    // Form
    const form = useForm({
        initialValues: {
            name: '',
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Name is too short' : null),
        },
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (values) => categoryService.create(values),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            closeModal();
            notifications.show({ title: 'Success', message: 'Category created', color: 'green' });
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to create category', color: 'red' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (values) => categoryService.update(editingId, values),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            closeModal();
            notifications.show({ title: 'Success', message: 'Category updated', color: 'green' });
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to update category', color: 'red' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => categoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            notifications.show({ title: 'Success', message: 'Category deleted', color: 'green' });
            closeConfirmModal();
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to delete category', color: 'red' });
            closeConfirmModal();
        }
    });

    const restoreMutation = useMutation({
        mutationFn: (id) => categoryService.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            notifications.show({ title: 'Success', message: t('categories.restore_success'), color: 'green' });
            closeConfirmModal();
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to restore category', color: 'red' });
            closeConfirmModal();
        }
    });

    const forceDeleteMutation = useMutation({
        mutationFn: (id) => categoryService.forceDelete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            notifications.show({ title: 'Success', message: t('categories.force_delete_success'), color: 'green' });
            closeConfirmModal();
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to permanently delete category', color: 'red' });
            closeConfirmModal();
        }
    });

    const handleSubmit = (values) => {
        if (editingId) {
            updateMutation.mutate(values);
        } else {
            createMutation.mutate(values);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        form.setValues({
            name: category.name,
        });
        open();
    };

    // Confirmation Handler
    const openConfirmModal = ({ title, message, action, confirmLabel, color }) => {
        setConfirmModal({
            opened: true,
            title,
            message,
            action,
            confirmLabel,
            color
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal((prev) => ({ ...prev, opened: false }));
    };

    const handleConfirmAction = () => {
        if (confirmModal.action) {
            confirmModal.action();
        }
    };

    const handleDelete = (id) => {
        openConfirmModal({
            title: t('common.delete'),
            message: t('common.confirm_delete'),
            confirmLabel: t('common.delete'),
            color: 'red',
            action: () => deleteMutation.mutate(id)
        });
    };

    const handleRestore = (id) => {
        openConfirmModal({
            title: t('categories.restore'),
            message: t('categories.confirm_restore'),
            confirmLabel: t('categories.restore'),
            color: 'green',
            action: () => restoreMutation.mutate(id)
        });
    };

    const handleForceDelete = (id) => {
        openConfirmModal({
            title: t('categories.delete_permanently'),
            message: t('categories.confirm_force_delete'),
            confirmLabel: t('categories.delete_permanently'),
            color: 'red',
            action: () => forceDeleteMutation.mutate(id)
        });
    };

    const closeModal = () => {
        form.reset();
        setEditingId(null);
        close();
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Breadcrumbs */}
            <Breadcrumbs mb="xs" separator="›">
                <Anchor href="/" size="sm" c="dimmed">{t('nav.dashboard')}</Anchor>
                <Text size="sm" fw={500}>{t('categories.title')}</Text>
            </Breadcrumbs>

            <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
                <div>
                    <Title order={2} fw={800} c="kala-lilac.9">{t('categories.title')}</Title>
                    <Text c="dimmed" size="sm">{t('common.manage_categories')}</Text>
                </div>
                <Group gap="sm">
                    <Group bg="gray.1" p={4} style={{ borderRadius: 8 }} gap={0}>
                        <Button
                            size="xs"
                            variant={showTrash === 'active' ? 'white' : 'subtle'}
                            color="dark"
                            radius="md"
                            style={{ boxShadow: showTrash === 'active' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                            onClick={() => setShowTrash('active')}
                        >
                            {t('categories.title')}
                        </Button>
                        <Button
                            size="xs"
                            variant={showTrash === 'trash' ? 'white' : 'subtle'}
                            color={showTrash === 'trash' ? 'red' : 'gray'}
                            radius="md"
                            style={{ boxShadow: showTrash === 'trash' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                            onClick={() => setShowTrash('trash')}
                        >
                            <Group gap={4}>
                                <span>{t('categories.trash')}</span>
                                <IconTrash size={12} />
                            </Group>
                        </Button>
                    </Group>
                    {showTrash === 'active' && (
                        <Button leftSection={<IconPlus size={18} />} onClick={open}>{t('categories.add_category')}</Button>
                    )}
                </Group>
            </Group>

            <Card withBorder={false} shadow="sm" radius="md" p={{ base: 'md', sm: 'xl' }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
                <Group justify="space-between">
                    <TextInput
                        placeholder={`${t('common.search')}...`}
                        leftSection={<IconSearch size={16} stroke={1.5} />}
                        style={{ width: '100%', maxWidth: 300 }}
                        radius="md"
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                    />
                </Group>

                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <LoadingOverlay key="loading-overlay" visible={isLoading} />
                    <Table.ScrollContainer minWidth={500} style={{ height: '100%' }}>
                        <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('common.name')}</Table.Th>
                                    <Table.Th style={{ textAlign: 'center' }}>{t('categories.product_count')}</Table.Th>
                                    <Table.Th style={{ textAlign: 'center' }}>{t('common.actions', 'Actions')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <Table.Tr key={item.id || index} style={{ cursor: 'pointer', opacity: showTrash === 'trash' ? 0.7 : 1 }}>
                                            <Table.Td>
                                                <Text fw={600} size="sm">{item.name}</Text>
                                            </Table.Td>
                                            <Table.Td align="center">
                                                <Badge variant="light" color="blue" size="lg" radius="sm">
                                                    {item.product_count || 0}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td align="center">
                                                <Group gap={4} justify="center">
                                                    {showTrash === 'active' ? (
                                                        <>
                                                            <Tooltip label={t('common.edit', 'Edit')}>
                                                                <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => handleEdit(item)}>
                                                                    <IconEdit size={14} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                            <Tooltip label={t('common.delete', 'Delete')}>
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="red"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(item.id)}
                                                                >
                                                                    <IconTrash size={14} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Tooltip label={t('categories.restore')}>
                                                                <ActionIcon variant="subtle" color="green" size="sm" onClick={() => handleRestore(item.id)}>
                                                                    <IconRestore size={16} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                            <Tooltip label={t('categories.delete_permanently')}>
                                                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleForceDelete(item.id)}>
                                                                    <IconTrashX size={16} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={3} align="center">
                                            <Text c="dimmed" py="xl">{t('common.no_data')}</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </div>
            </Card>

            <Modal
                opened={opened}
                onClose={closeModal}
                title={<Text fw={700}>{editingId ? t('categories.edit_category') : t('categories.add_category')}</Text>}
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput
                            label={t('common.name')}
                            placeholder={t('common.name')}
                            required
                            {...form.getInputProps('name')}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            mt="md"
                            loading={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingId ? t('categories.update_category') : t('categories.create_category')}
                        </Button>
                    </Stack>
                </form>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                opened={confirmModal.opened}
                onClose={closeConfirmModal}
                title={<Group gap="xs"><IconAlertTriangle size={20} color="orange" /><Text fw={700}>{confirmModal.title}</Text></Group>}
                centered
            >
                <Text size="sm" mb="lg">
                    {confirmModal.message}
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeConfirmModal}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        color={confirmModal.color}
                        onClick={handleConfirmAction}
                        loading={deleteMutation.isPending || restoreMutation.isPending || forceDeleteMutation.isPending}
                    >
                        {confirmModal.confirmLabel}
                    </Button>
                </Group>
            </Modal>
        </div>
    );
}
