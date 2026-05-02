import { useState, useMemo } from 'react';
import {
    Title, Text, Group, Badge, Paper, Table, Stack, Select,
    ActionIcon, Modal, TextInput, NumberInput, Textarea, Button,
    SegmentedControl, Pagination, Loader, Center, Tooltip, ThemeIcon,
    Grid, Card
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    IconPackages, IconArrowDown, IconArrowUp, IconAdjustments,
    IconPlus, IconFilter
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { inventoryService, productService } from '../api/services';

const TYPE_CONFIG = {
    in: { color: 'teal', icon: IconArrowDown, label: 'Stock In' },
    out: { color: 'red', icon: IconArrowUp, label: 'Stock Out' },
    adjustment: { color: 'blue', icon: IconAdjustments, label: 'Adjustment' },
};

const SOURCE_OPTIONS = {
    in: [
        { value: 'purchase', label: 'Purchase / Restock' },
        { value: 'return', label: 'Customer Return' },
    ],
    out: [
        { value: 'damage', label: 'Damaged / Spoiled' },
        { value: 'expired', label: 'Expired' },
        { value: 'loss', label: 'Loss / Shrinkage' },
    ],
    adjustment: [
        { value: 'opname', label: 'Stock Opname' },
    ],
};

export default function Inventory() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [opened, { open, close }] = useDisclosure(false);
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState('');
    const [dateRange, setDateRange] = useState('this_month');
    const pageSize = 15;

    // Compute start/end dates from dateRange selection
    const { startDate, endDate } = useMemo(() => {
        const now = new Date();
        let start, end;
        switch (dateRange) {
            case 'this_month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last_month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'this_year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            case 'all_time':
            default:
                start = new Date(2000, 0, 1);
                end = new Date(2099, 11, 31);
                break;
        }
        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { startDate: fmt(start), endDate: fmt(end) };
    }, [dateRange]);

    // Form state
    const [formType, setFormType] = useState('in');
    const [formProductId, setFormProductId] = useState(null);
    const [formSource, setFormSource] = useState('');
    const [formQty, setFormQty] = useState(1);
    const [formCost, setFormCost] = useState(0);
    const [formNotes, setFormNotes] = useState('');

    const TYPE_CONFIG = {
        in: { color: 'teal', icon: IconArrowDown, label: t('inventory.stock_in', 'Stock In') },
        out: { color: 'red', icon: IconArrowUp, label: t('inventory.stock_out', 'Stock Out') },
        adjustment: { color: 'blue', icon: IconAdjustments, label: t('inventory.adjustment', 'Adjustment') },
    };

    const SOURCE_OPTIONS = {
        in: [
            { value: 'purchase', label: t('source_options.purchase', 'Purchase / Restock') },
            { value: 'return', label: t('source_options.return', 'Customer Return') },
        ],
        out: [
            { value: 'damage', label: t('source_options.damage', 'Damaged / Spoiled') },
            { value: 'expired', label: t('source_options.expired', 'Expired') },
            { value: 'loss', label: t('source_options.loss', 'Loss / Shrinkage') },
        ],
        adjustment: [
            { value: 'opname', label: t('source_options.opname', 'Stock Opname') },
        ],
    };

    // Fetch inventory logs
    const { data: logData, isLoading } = useQuery({
        queryKey: ['inventory-logs', page, filterType, dateRange],
        queryFn: async () => {
            const params = { page, pageSize };
            if (filterType) params.type = filterType;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await inventoryService.getAll(params);
            return res;
        },
    });

    // Fetch products for select
    const { data: productData } = useQuery({
        queryKey: ['products-select'],
        queryFn: async () => {
            const res = await productService.getAll({ page: 1, pageSize: 500 });
            const products = res.data?.data || res.data || res || [];
            return (Array.isArray(products) ? products : []).map(p => ({
                value: String(p.id),
                label: `${p.name} (Stock: ${p.stock}) - ${p.sku || 'No SKU'}`,
                cost: p.cost || 0
            }));
        },
    });

    // Fetch inventory stats
    const { data: statsData } = useQuery({
        queryKey: ['inventory-stats', dateRange],
        queryFn: async () => {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await inventoryService.getStats(params);
            return res.data;
        },
    });

    // Mutation
    const adjustMutation = useMutation({
        mutationFn: (payload) => inventoryService.adjustStock(payload),
        onSuccess: () => {
            notifications.show({ title: t('common.success'), message: t('inventory.modal.success_msg', 'Stock adjusted successfully'), color: 'teal' });
            queryClient.invalidateQueries(['inventory-logs']);
            queryClient.invalidateQueries(['inventory-stats']);
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['products-select']);
            queryClient.invalidateQueries(['products-count']);
            queryClient.invalidateQueries(['cash-flow']);
            queryClient.invalidateQueries(['cash-flow-summary']);
            close();
            resetForm();
        },
        onError: (err) => {
            notifications.show({ title: t('common.error'), message: err.response?.data?.error || 'Failed to adjust stock', color: 'red' });
        },
    });

    const resetForm = () => {
        setFormType('in');
        setFormProductId(null);
        setFormSource('');
        setFormQty(1);
        setFormCost(0);
        setFormNotes('');
    };

    const handleSubmit = () => {
        if (!formProductId || !formSource) {
            notifications.show({ title: t('common.error'), message: 'Please fill all required fields', color: 'red' });
            return;
        }
        adjustMutation.mutate({
            product_id: parseInt(formProductId),
            type: formType,
            source: formSource,
            quantity: formQty,
            cost_price: formCost,
            notes: formNotes,
        });
    };

    const logs = logData?.data || [];
    const totalItems = logData?.total_items || 0;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return (
        <Stack gap="lg">
            {/* Page Title */}
            <Group justify="space-between" align="center">
                <div>
                    <Title order={2} fw={800}>
                        <Group gap="xs">
                            <ThemeIcon variant="light" size="lg" color="kala-lilac">
                                <IconPackages size={20} />
                            </ThemeIcon>
                            {t('inventory.title', 'Inventory Management')}
                        </Group>
                    </Title>
                    <Text c="dimmed" size="sm" mt={4}>{t('inventory.subtitle', 'Track all stock movements and adjustments')}</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} color="kala-lilac" onClick={open}>
                    {t('inventory.adjust_stock', 'Adjust Stock')}
                </Button>
            </Group>

            {/* Summary Cards */}
            <Grid>
                {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <Grid.Col span={{ base: 12, sm: 4 }} key={key}>
                        <Card padding="md" radius="md" withBorder style={{ borderLeft: `4px solid var(--mantine-color-${config.color}-6)` }}>
                            <Group justify="space-between">
                                <div>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{config.label}</Text>
                                    <Text size="xl" fw={700}>
                                        {statsData?.[key] || 0}
                                    </Text>
                                </div>
                                <ThemeIcon variant="light" size="lg" color={config.color}>
                                    <config.icon size={20} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Filters */}
            <Paper p="md" radius="md" withBorder>
                <Group gap="md" justify="space-between">
                    <Group gap="md">
                        <IconFilter size={16} />
                        <SegmentedControl
                            value={filterType}
                            onChange={(v) => { setFilterType(v); setPage(1); }}
                            data={[
                                { value: '', label: t('inventory.filter.all', 'All') },
                                { value: 'in', label: t('inventory.filter.stock_in', '↓ Stock In') },
                                { value: 'out', label: t('inventory.filter.stock_out', '↑ Stock Out') },
                                { value: 'adjustment', label: t('inventory.filter.adjustment', '⟲ Adjustment') },
                            ]}
                            size="xs"
                        />
                    </Group>
                    <SegmentedControl
                        value={dateRange}
                        onChange={(v) => { setDateRange(v); setPage(1); }}
                        data={[
                            { value: 'this_month', label: t('inventory.this_month', 'This Month') },
                            { value: 'last_month', label: t('inventory.last_month', 'Last Month') },
                            { value: 'this_year', label: t('inventory.this_year', 'This Year') },
                            { value: 'all_time', label: t('inventory.all_time', 'All Time') },
                        ]}
                        size="xs"
                    />
                </Group>
            </Paper>

            {/* Table */}
            <Paper p="md" radius="md" withBorder>
                {isLoading ? (
                    <Center py="xl"><Loader color="kala-lilac" /></Center>
                ) : logs.length === 0 ? (
                    <Center py="xl">
                        <Stack align="center" gap="xs">
                            <IconPackages size={48} color="gray" />
                            <Text c="dimmed">{t('inventory.no_data', 'No inventory logs found')}</Text>
                        </Stack>
                    </Center>
                ) : (
                    <>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('inventory.headers.type', 'Type')}</Table.Th>
                                    <Table.Th>{t('inventory.headers.product', 'Product')}</Table.Th>
                                    <Table.Th>{t('inventory.headers.source', 'Source')}</Table.Th>
                                    <Table.Th ta="right">{t('inventory.headers.qty', 'Qty')}</Table.Th>
                                    <Table.Th ta="right">{t('inventory.headers.before_after', 'Before → After')}</Table.Th>
                                    <Table.Th ta="right">{t('inventory.headers.cost', 'Cost')}</Table.Th>
                                    <Table.Th>{t('inventory.headers.notes', 'Notes')}</Table.Th>
                                    <Table.Th>{t('inventory.headers.user', 'User')}</Table.Th>
                                    <Table.Th>{t('inventory.headers.date', 'Date')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {logs.map((log) => {
                                    const cfg = TYPE_CONFIG[log.type] || TYPE_CONFIG.adjustment;
                                    return (
                                        <Table.Tr key={log.id}>
                                            <Table.Td>
                                                <Badge color={`${cfg.color}.4`} variant="light" size="sm" leftSection={<cfg.icon size={12} />}>
                                                    {cfg.label}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td fw={500}>{log.product?.name || `#${log.product_id}`}</Table.Td>
                                            <Table.Td>
                                                <Text size="sm" tt="capitalize">{t(`source_options.${log.source}`, log.source?.replace('_', ' '))}</Text>
                                            </Table.Td>
                                            <Table.Td ta="right">
                                                <Text fw={600} c={log.type === 'in' ? 'teal' : log.type === 'out' ? 'red' : 'blue'}>
                                                    {log.type === 'in' ? '+' : log.type === 'out' ? '-' : '±'}{Math.abs(log.quantity)}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td ta="right">
                                                <Text size="sm">{log.stock_before} → {log.stock_after}</Text>
                                            </Table.Td>
                                            <Table.Td ta="right">
                                                <Text size="sm">Rp {(log.total_cost || 0).toLocaleString('id-ID')}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed" lineClamp={1} maw={150}>{log.notes || '-'}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{log.user?.username || '-'}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="xs" c="dimmed">
                                                    {new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    {' '}
                                                    {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>

                        <Group justify="center" mt="md">
                            <Pagination total={totalPages} value={page} onChange={setPage} color="kala-lilac" />
                        </Group>
                    </>
                )}
            </Paper>

            {/* Adjust Stock Modal */}
            <Modal opened={opened} onClose={close} title={t('inventory.modal.title', 'Adjust Stock')} size="md" centered>
                <Stack gap="md">
                    <SegmentedControl
                        fullWidth
                        value={formType}
                        onChange={(v) => { setFormType(v); setFormSource(''); }}
                        data={[
                            { value: 'in', label: t('inventory.filter.stock_in', '↓ Stock In') },
                            { value: 'out', label: t('inventory.filter.stock_out', '↑ Stock Out') },
                            { value: 'adjustment', label: t('inventory.filter.adjustment', '⟲ Adjustment') },
                        ]}
                        color={TYPE_CONFIG[formType]?.color}
                    />

                    <Select
                        label={t('inventory.modal.product', 'Produk')}
                        placeholder={t('inventory.modal.search_product', 'Cari produk...')}
                        searchable
                        clearable
                        limit={100}
                        nothingFoundMessage="Tidak ada produk ditemukan"
                        data={productData || []}
                        value={formProductId}
                        onChange={(val) => {
                            setFormProductId(val);
                            if (val && formType === 'in') {
                                const prod = productData?.find(p => p.value === val);
                                if (prod) setFormCost(prod.cost);
                            }
                        }}
                        required
                    />

                    <Select
                        label={t('inventory.modal.source', 'Sumber / Alasan')}
                        placeholder={t('inventory.modal.select_reason', 'Pilih alasan')}
                        data={SOURCE_OPTIONS[formType] || []}
                        value={formSource}
                        onChange={setFormSource}
                        searchable
                        clearable
                        nothingFoundMessage="Tidak ada alasan ditemukan"
                        required
                    />

                    <Group grow>
                        <NumberInput
                            label={formType === 'adjustment' ? t('inventory.modal.new_stock', 'New Stock Level') : t('inventory.modal.quantity', 'Quantity')}
                            value={formQty}
                            onChange={setFormQty}
                            min={formType === 'adjustment' ? 0 : 1}
                            required
                            onFocus={(e) => e.target.select()}
                        />
                        {formType === 'in' && (
                            <NumberInput
                                label={t('inventory.modal.cost_price', 'Cost Price (per unit)')}
                                value={formCost}
                                onChange={setFormCost}
                                prefix="Rp "
                                min={0}
                                thousandSeparator=","
                                onFocus={(e) => e.target.select()}
                            />
                        )}
                    </Group>

                    <Textarea
                        label={t('inventory.modal.notes', 'Notes')}
                        placeholder={t('inventory.modal.optional_notes', 'Optional notes...')}
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                    />

                    <Button
                        color={TYPE_CONFIG[formType]?.color}
                        onClick={handleSubmit}
                        loading={adjustMutation.isPending}
                        fullWidth
                    >
                        {formType === 'in' ? t('inventory.modal.add_stock', 'Add Stock') : formType === 'out' ? t('inventory.modal.remove_stock', 'Remove Stock') : t('inventory.modal.adjust_stock', 'Adjust Stock')}
                    </Button>
                </Stack>
            </Modal>
        </Stack>
    );
}
