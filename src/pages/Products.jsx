import { useState } from 'react';
import {
    Title,
    Button,
    Group,
    Table,
    ActionIcon,
    Menu,
    Text,
    Avatar,
    Badge,
    Pagination,
    Modal,
    TextInput,
    NumberInput,
    Select,
    Textarea,
    Stack,
    LoadingOverlay,
    Card,
    SegmentedControl,
    Breadcrumbs,
    Anchor,
    Box,
    UnstyledButton,
    Tooltip
} from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import {
    IconPlus,
    IconDots,
    IconEdit,
    IconTrash,
    IconSearch,
    IconArrowUp,
    IconArrowDown,
    IconArrowsUpDown,
    IconDownload,
    IconBarcode,
    IconRotateClockwise,
    IconTrashX,
    IconFilter,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import api from '../api/axios';
import { formatCurrency } from '../lib/formatter';
import { downloadFile } from '../lib/export';
import { useTranslation } from 'react-i18next';
import BarcodeModal from '../components/products/BarcodeModal';

// Sortable column header component
function SortableHeader({ children, sortBy, currentSort, currentOrder, onSort, justify = 'flex-start', ...props }) {
    const isActive = currentSort === sortBy;
    const icon = isActive
        ? (currentOrder === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />)
        : <IconArrowsUpDown size={14} style={{ opacity: 0.3 }} />;

    return (
        <Table.Th {...props} style={{ ...props.style, textAlign: props.justify === 'flex-end' ? 'right' : props.justify === 'center' ? 'center' : 'left' }}>
            <UnstyledButton
                onClick={() => onSort(sortBy)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 700,
                    fontSize: 'var(--mantine-font-size-sm)',
                    justifyContent: justify,
                    width: '100%',
                    height: '100%'
                }}
            >
                {children}
                {icon}
            </UnstyledButton>
        </Table.Th>
    );
}

export default function Products() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [opened, { open, close }] = useDisclosure(false);
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'trash'
    const [stockFilter, setStockFilter] = useState('all');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [barcodeProduct, setBarcodeProduct] = useState(null);

    // Fetch Products - Sync with URL
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';

    const setSearch = (val) => {
        setSearchParams(val ? { search: val } : {}, { replace: true });
        setPage(1);
    };

    const [debouncedSearch] = useDebouncedValue(search, 500);

    const { data, isLoading } = useQuery({
        queryKey: ['products', page, pageSize, debouncedSearch, stockFilter, sortBy, sortOrder, viewMode],
        queryFn: async () => {
            const params = { page, pageSize, search: debouncedSearch };
            if (stockFilter && stockFilter !== 'all') params.stockFilter = stockFilter;
            if (viewMode === 'trash') params.trashed = true;
            if (sortBy) {
                params.sortBy = sortBy;
                params.sortOrder = sortOrder || 'asc';
            }
            const res = await api.get('/products', { params });
            return res.data;
        },
        keepPreviousData: true,
    });

    // Fetch stock counts for tab badges
    const { data: stockCounts } = useQuery({
        queryKey: ['stock-counts'],
        queryFn: async () => {
            const res = await api.get('/products/stock-counts');
            return res.data.data;
        },
        staleTime: 10000,
    });

    // Fetch Categories for Select
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const res = await api.get('/categories');
                const data = res.data.data || res.data;
                if (!Array.isArray(data)) return [];
                return data.map(c => ({ value: String(c.id), label: c.name }));
            } catch (e) {
                console.error("Failed to fetch categories", e);
                return [];
            }
        },
    });

    // Form
    const form = useForm({
        initialValues: {
            name: '',
            category_id: '',
            price: 0,
            cost: 0,
            stock: 0,
            description: '',
            sku: '',
            barcode: '',
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Name is too short' : null),
            price: (value) => (value === undefined || value === null || value <= 0 ? 'Price must be greater than 0' : null),
            cost: (value) => (value === undefined || value === null || value <= 0 ? 'Cost must be greater than 0' : null),
            category_id: (value) => (!value ? 'Category is required' : null),
        },
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (values) => api.post('/products', {
            ...values,
            category_id: Number(values.category_id),
            price: Number(values.price),
            cost: Number(values.cost),
            stock: Number(values.stock)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['stock-counts']);
            closeModal();
            notifications.show({ title: 'Success', message: 'Product created', color: 'green' });
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to create product', color: 'red' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (values) => api.put(`/products/${editingId}`, {
            ...values,
            category_id: Number(values.category_id),
            price: Number(values.price),
            cost: Number(values.cost),
            stock: Number(values.stock)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['stock-counts']);
            closeModal();
            notifications.show({ title: 'Success', message: 'Product updated', color: 'green' });
        },
        onError: (error) => {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to update product', color: 'red' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['stock-counts']);
            notifications.show({ title: 'Success', message: 'Product moved to trash', color: 'green' });
        },
    });

    const restoreMutation = useMutation({
        mutationFn: (id) => api.post(`/products/${id}/restore`),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['stock-counts']);
            notifications.show({ title: 'Success', message: 'Product restored', color: 'green' });
        },
    });

    const forceDeleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}/force`),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['stock-counts']);
            notifications.show({ title: 'Success', message: 'Product permanently deleted', color: 'green' });
        },
    });

    const handleSubmit = (values) => {
        if (editingId) {
            updateMutation.mutate(values);
        } else {
            createMutation.mutate(values);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        form.setValues({
            name: product.name,
            category_id: String(product.category_id),
            price: product.price,
            cost: product.cost || 0,
            stock: product.stock,
            description: product.description || '',
            sku: product.sku || '',
            barcode: product.barcode || '',
        });
        open();
    };

    const handleDelete = (id, name) => {
        openConfirmModal({
            title: t('common.delete_confirm_title', 'Delete Product?'),
            children: (
                <Text size="sm">
                    {t('common.delete_confirm_message', 'Are you sure you want to delete')} <strong>{name}</strong>?
                    <br />
                    {t('common.soft_delete_explanation', 'The item will be moved to the trash and can be restored later.')}
                </Text>
            ),
            labels: { confirm: t('common.delete', 'Delete'), cancel: t('common.cancel', 'Cancel') },
            confirmProps: { color: 'red' },
            onConfirm: () => deleteMutation.mutate(id),
        });
    };

    const handleRestore = (id, name) => {
        openConfirmModal({
            title: t('common.restore_confirm_title', 'Restore Product?'),
            children: (
                <Text size="sm">
                    {t('common.restore_confirm_message', 'Are you sure you want to restore')} <strong>{name}</strong>?
                </Text>
            ),
            labels: { confirm: t('common.restore', 'Restore'), cancel: t('common.cancel', 'Cancel') },
            confirmProps: { color: 'green' },
            onConfirm: () => restoreMutation.mutate(id),
        });
    };

    const handleForceDelete = (id, name) => {
        openConfirmModal({
            title: t('common.force_delete_confirm_title', 'Permanently Delete?'),
            children: (
                <Text size="sm" c="red">
                    {t('common.force_delete_confirm_message', 'This action cannot be undone. Are you sure you want to permanently delete')} <strong>{name}</strong>?
                </Text>
            ),
            labels: { confirm: t('common.delete_permanently', 'Delete Permanently'), cancel: t('common.cancel', 'Cancel') },
            confirmProps: { color: 'red' },
            onConfirm: () => forceDeleteMutation.mutate(id),
        });
    };

    // Helper for confirmation modal (simplified version of Mantine's one)
    const [confirmModalState, setConfirmModalState] = useState({ opened: false, props: {} });
    const openConfirmModal = (props) => setConfirmModalState({ opened: true, props });
    const closeConfirmModal = () => setConfirmModalState({ opened: false, props: {} });

    const closeModal = () => {
        form.reset();
        setEditingId(null);
        close();
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            // Toggle order or clear
            if (sortOrder === 'asc') {
                setSortOrder('desc');
            } else {
                setSortBy('');
                setSortOrder('');
            }
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
        setPage(1);
    };

    const handleStockFilterChange = (value) => {
        setStockFilter(value);
        setPage(1);
    };

    // Pagination info
    const totalItems = data?.total_items || 0;
    const from = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, totalItems);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Breadcrumbs */}
            <Breadcrumbs mb="xs" separator="›">
                <Anchor href="/" size="sm" c="dimmed">{t('nav.dashboard')}</Anchor>
                <Text size="sm" fw={500}>{t('products.title')}</Text>
            </Breadcrumbs>

            <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
                <div>
                    <Title order={2} fw={800} c="kala-lilac.9">{t('products.title')}</Title>
                    <Text c="dimmed" size="sm">{t('common.manage_inventory')}</Text>
                </div>
                <Group gap="sm" wrap="nowrap">
                    <Group bg="gray.1" p={4} style={{ borderRadius: 8 }} gap={0}>
                        <Button
                            size="xs"
                            variant={viewMode === 'active' ? 'white' : 'subtle'}
                            color="dark"
                            radius="md"
                            style={{ boxShadow: viewMode === 'active' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                            onClick={() => { setViewMode('active'); setPage(1); }}
                        >
                            {t('common.active')}
                        </Button>
                        <Button
                            size="xs"
                            variant={viewMode === 'trash' ? 'white' : 'subtle'}
                            color={viewMode === 'trash' ? 'red' : 'gray'}
                            radius="md"
                            style={{ boxShadow: viewMode === 'trash' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                            onClick={() => { setViewMode('trash'); setPage(1); }}
                        >
                            <Group gap={4}>
                                <span>{t('common.trash')}</span>
                                <IconTrash size={12} />
                            </Group>
                        </Button>
                    </Group>
                    <Button
                        variant="light"
                        leftSection={<IconDownload size={16} />}
                        onClick={() => {
                            downloadFile(
                                '/export/products/csv',
                                `products_${new Date().toISOString().slice(0, 10)}.csv`
                            ).catch(() => {
                                notifications.show({
                                    title: t('common.error', 'Error'),
                                    message: t('common.export_failed', 'Export failed. Please try again.'),
                                    color: 'red',
                                });
                            });
                        }}
                    >
                        {t('common.export', 'Export CSV')}
                    </Button>
                    {viewMode === 'active' &&
                        <Button leftSection={<IconPlus size={18} />} onClick={open}>{t('products.add_product')}</Button>
                    }
                </Group>
            </Group>

            <Card withBorder={false} shadow="sm" radius="md" p={{ base: 'md', sm: 'xl' }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                {/* Search & Filters Refined */}
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                    <TextInput
                        placeholder={`${t('common.search')}...`}
                        leftSection={<IconSearch size={16} stroke={1.5} />}
                        style={{ flex: 1, minWidth: 200 }}
                        radius="md"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.currentTarget.value);
                            setPage(1);
                        }}
                    />

                    {/* Simple Stock Filter Pills */}
                    {viewMode === 'active' && (
                        <Group gap="xs">
                            {[
                                { label: t('products.all'), value: 'all', count: stockCounts?.all, color: 'gray' },
                                { label: t('products.high_stock'), value: 'high', count: stockCounts?.high, color: 'teal' },
                                { label: t('products.low_stock'), value: 'low', count: stockCounts?.low, color: 'orange' },
                                { label: t('products.out_of_stock'), value: 'out', count: stockCounts?.out, color: 'red' },
                            ].map((filter) => {
                                const isActive = stockFilter === filter.value;
                                return (
                                    <Badge
                                        key={filter.value}
                                        variant={isActive ? 'filled' : 'outline'}
                                        color={filter.color}
                                        size="lg"
                                        radius="sm"
                                        style={{ cursor: 'pointer', textTransform: 'none', fontWeight: 500 }}
                                        onClick={() => handleStockFilterChange(filter.value)}
                                        rightSection={filter.count != null && <span style={{ marginLeft: 6, opacity: 0.8, fontSize: '0.85em' }}>{filter.count}</span>}
                                    >
                                        {filter.label}
                                    </Badge>
                                );
                            })}
                        </Group>
                    )}
                </Group>

                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <LoadingOverlay visible={isLoading} />

                    <Table.ScrollContainer minWidth={800} style={{ height: '100%' }}>
                        <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={60}></Table.Th>
                                    <SortableHeader sortBy="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                                        {t('common.name')}
                                    </SortableHeader>
                                    <Table.Th>{t('common.sku')}</Table.Th>
                                    <Table.Th>{t('common.barcode')}</Table.Th>
                                    <Table.Th>{t('common.category')}</Table.Th>
                                    <SortableHeader sortBy="cost" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} justify="flex-end" style={{ textAlign: 'right' }}>
                                        {t('products.cost')}
                                    </SortableHeader>
                                    <SortableHeader sortBy="price" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} justify="flex-end" style={{ textAlign: 'right' }}>
                                        {t('products.selling_price')}
                                    </SortableHeader>
                                    <SortableHeader sortBy="stock" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} justify="center" style={{ textAlign: 'center' }}>
                                        {t('common.stock')}
                                    </SortableHeader>
                                    <Table.Th w={120} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{t('common.actions')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data?.data?.map((item) => (
                                    <Table.Tr key={item.id} style={{ cursor: 'pointer' }}>
                                        <Table.Td>
                                            {item.image ? (
                                                <Avatar src={item.image} radius="md" size="md" />
                                            ) : (
                                                <Avatar radius="md" size="md" color="blue">{item.name.charAt(0)}</Avatar>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Text fw={600} size="sm" lineClamp={1}>{item.name}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">{item.sku || '-'}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed" ff="monospace">{item.barcode || '-'}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="light" color="gray" radius="sm" tt="capitalize">{item.category?.name || 'Uncategorized'}</Badge>
                                        </Table.Td>
                                        <Table.Td align="right" size="sm" c="dimmed">{formatCurrency(item.cost)}</Table.Td>
                                        <Table.Td align="right" fw={500} size="sm">{formatCurrency(item.price)}</Table.Td>
                                        <Table.Td align="center">
                                            <Text size="sm" fw={item.stock === 0 ? 700 : 500} c={item.stock === 0 ? 'red' : item.stock <= 5 ? 'orange' : 'dimmed'}>
                                                {item.stock}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td align="center">
                                            <Group gap={4} justify="center" wrap="nowrap">
                                                {viewMode === 'active' ? (
                                                    <>
                                                        <Tooltip label={t('common.edit')}>
                                                            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(item)}>
                                                                <IconEdit size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label={t('barcode.title')}>
                                                            <ActionIcon variant="subtle" color="grape" onClick={() => setBarcodeProduct(item)}>
                                                                <IconBarcode size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label={t('common.delete')}>
                                                            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.id, item.name)}>
                                                                <IconTrash size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Tooltip label={t('common.restore')}>
                                                            <ActionIcon variant="subtle" color="green" onClick={() => handleRestore(item.id, item.name)}>
                                                                <IconRotateClockwise size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label={t('common.delete_permanently')}>
                                                            <ActionIcon variant="subtle" color="red" onClick={() => handleForceDelete(item.id, item.name)}>
                                                                <IconTrashX size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </div>
            </Card>

            {/* Pagination row */}
            <Group justify="space-between" mt="md" align="center">
                <Text size="sm" c="dimmed">
                    {totalItems > 0
                        ? t('products.showing_results', { from, to, total: totalItems })
                        : ''}
                </Text>
                <Pagination
                    total={data?.total_page || 1}
                    value={page}
                    onChange={setPage}
                    color="kala-lilac"
                />
                <Select
                    data={['5', '10', '25', '50']}
                    value={String(pageSize)}
                    onChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                    w={80}
                    size="sm"
                    variant="filled"
                    radius="md"
                />
            </Group>

            {/* Modal for Add/Edit Product */}
            <Modal
                opened={opened}
                onClose={closeModal}
                title={<Text fw={700}>{editingId ? t('products.edit_product') : t('products.add_product')}</Text>}
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput
                            label={t('common.name')}
                            placeholder={t('common.name')}
                            required
                            {...form.getInputProps('name')}
                        />

                        <Group grow>
                            <TextInput
                                label={t('common.sku')}
                                placeholder="SKU-..."
                                {...form.getInputProps('sku')}
                            />
                            <TextInput
                                label={t('common.barcode')}
                                placeholder="8..."
                                {...form.getInputProps('barcode')}
                            />
                        </Group>

                        <Select
                            label={t('common.category')}
                            placeholder={t('common.category')}
                            data={categories || []}
                            required
                            {...form.getInputProps('category_id')}
                        />

                        <Group grow>
                            <NumberInput
                                label={t('products.selling_price')}
                                placeholder="0"
                                min={0}
                                required
                                allowLeadingZeros={false}
                                leftSection="Rp"
                                {...form.getInputProps('price')}
                            />
                            <NumberInput
                                label={t('products.cost')}
                                placeholder="0"
                                min={0}
                                required
                                allowLeadingZeros={false}
                                leftSection="Rp"
                                {...form.getInputProps('cost')}
                            />
                        </Group>

                        <Tooltip label={t('products.stock_readonly_tooltip', 'Stock management is handled via Inventory Management')}>
                            <NumberInput
                                label={t('common.stock')}
                                placeholder="0"
                                min={0}
                                required
                                allowLeadingZeros={false}
                                disabled={true}
                                {...form.getInputProps('stock')}
                            />
                        </Tooltip>

                        <Textarea
                            label={t('common.description')}
                            placeholder="..."
                            {...form.getInputProps('description')}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            mt="md"
                            loading={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingId ? t('products.update_product') : t('products.create_product')}
                        </Button>
                    </Stack>
                </form>
            </Modal>

            {/* Barcode Modal */}
            <BarcodeModal
                opened={!!barcodeProduct}
                onClose={() => setBarcodeProduct(null)}
                product={barcodeProduct}
            />

            {/* Confirmation Modal */}
            <Modal
                opened={confirmModalState.opened}
                onClose={closeConfirmModal}
                title={confirmModalState.props.title}
                centered
            >
                {confirmModalState.props.children}
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={closeConfirmModal}>
                        {confirmModalState.props.labels?.cancel || 'Cancel'}
                    </Button>
                    <Button
                        color={confirmModalState.props.confirmProps?.color || 'red'}
                        onClick={() => {
                            confirmModalState.props.onConfirm();
                            closeConfirmModal();
                        }}
                    >
                        {confirmModalState.props.labels?.confirm || 'Confirm'}
                    </Button>
                </Group>
            </Modal>
        </div>
    );
}
