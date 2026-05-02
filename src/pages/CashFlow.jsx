import { useState, useMemo } from 'react';
import {
    Title, Text, Group, Badge, Paper, Table, Stack, Select,
    ActionIcon, Modal, TextInput, NumberInput, Textarea, Button,
    SegmentedControl, Pagination, Loader, Center, Tooltip, ThemeIcon,
    Grid, Card, RingProgress
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    IconCashBanknote, IconArrowUpRight, IconArrowDownRight,
    IconPlus, IconFilter, IconTrash, IconEdit, IconChartPie
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { cashFlowService } from '../api/services';

const TYPE_CONFIG = {
    income: { color: 'teal', icon: IconArrowDownRight, label: 'Income' },
    expense: { color: 'red', icon: IconArrowUpRight, label: 'Expense' },
};

const SOURCE_OPTIONS = {
    income: [
        { value: 'modal_awal', label: 'Modal Awal (Initial Capital)' },
        { value: 'modal_tambahan', label: 'Modal Tambahan (Additional Capital)' },
        { value: 'penjualan', label: 'Penjualan (Sales)' },
        { value: 'pembayaran_piutang', label: 'Pembayaran Piutang (Receivable Payment)' },
        { value: 'restore_transaksi', label: 'Restore Transaksi (Transaction Restore)' },
        { value: 'lain_lain', label: 'Pemasukan Lain-lain (Other Income)' },
    ],
    expense: [
        { value: 'sewa', label: 'Sewa (Rent)' },
        { value: 'listrik', label: 'Listrik (Electricity)' },
        { value: 'gaji_karyawan', label: 'Gaji Karyawan (Employee Salary)' },
        { value: 'penambahan_stok', label: 'Penambahan Stok Barang (Stock Replenishment)' },
        { value: 'biaya_operasional', label: 'Biaya Operasional (Operational Costs)' },
        { value: 'penarikan_owner', label: 'Penarikan oleh Owner (Owner Withdrawal)' },
        { value: 'perawatan_alat', label: 'Perawatan Alat (Equipment Maintenance)' },
        { value: 'return_pelanggan', label: 'Return Pelanggan (Customer Return)' },
        { value: 'pengeluaran_lain', label: 'Pengeluaran Lain-lain (Other Expense)' },
    ],
};

export default function CashFlow() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [opened, { open, close }] = useDisclosure(false);
    const [editId, setEditId] = useState(null);
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
    const [formType, setFormType] = useState('income');
    const [formSource, setFormSource] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formDate, setFormDate] = useState(new Date());
    const [formNotes, setFormNotes] = useState('');

    const TYPE_CONFIG = {
        income: { color: 'teal', icon: IconArrowDownRight, label: t('cash_flow.income', 'Income') },
        expense: { color: 'red', icon: IconArrowUpRight, label: t('cash_flow.expense', 'Expense') },
    };

    const SOURCE_OPTIONS = {
        income: [
            { value: 'modal_awal', label: t('source_options.modal_awal', 'Modal Awal (Initial Capital)') },
            { value: 'modal_tambahan', label: t('source_options.modal_tambahan', 'Modal Tambahan (Additional Capital)') },
            { value: 'penjualan', label: t('source_options.penjualan', 'Penjualan (Sales)') },
            { value: 'pembayaran_piutang', label: t('source_options.pembayaran_piutang', 'Pembayaran Piutang (Receivable Payment)') },
            { value: 'restore_transaksi', label: t('source_options.restore_transaksi', 'Restore Transaksi (Transaction Restore)') },
            { value: 'lain_lain', label: t('source_options.lain_lain', 'Pemasukan Lain-lain (Other Income)') },
        ],
        expense: [
            { value: 'sewa', label: t('source_options.sewa', 'Sewa (Rent)') },
            { value: 'listrik', label: t('source_options.listrik', 'Listrik (Electricity)') },
            { value: 'gaji_karyawan', label: t('source_options.gaji_karyawan', 'Gaji Karyawan (Employee Salary)') },
            { value: 'penambahan_stok', label: t('source_options.penambahan_stok', 'Penambahan Stok Barang (Stock Replenishment)') },
            { value: 'biaya_operasional', label: t('source_options.biaya_operasional', 'Biaya Operasional (Operational Costs)') },
            { value: 'penarikan_owner', label: t('source_options.penarikan_owner', 'Penarikan oleh Owner (Owner Withdrawal)') },
            { value: 'perawatan_alat', label: t('source_options.perawatan_alat', 'Perawatan Alat (Equipment Maintenance)') },
            { value: 'return_pelanggan', label: t('source_options.return_pelanggan', 'Return Pelanggan (Customer Return)') },
            { value: 'pengeluaran_lain', label: t('source_options.pengeluaran_lain', 'Pengeluaran Lain-lain (Other Expense)') },
        ],
    };

    // Fetch cash flow entries
    const { data: cfData, isLoading } = useQuery({
        queryKey: ['cash-flow', page, filterType, dateRange],
        queryFn: async () => {
            const params = { page, pageSize };
            if (filterType) params.type = filterType;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await cashFlowService.getAll(params);
            return res;
        },
    });

    // Fetch summary
    const { data: summaryData } = useQuery({
        queryKey: ['cash-flow-summary', dateRange],
        queryFn: async () => {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await cashFlowService.getSummary(params);
            return res.data;
        },
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: (payload) => {
            if (editId) {
                return cashFlowService.update(editId, payload);
            }
            return cashFlowService.create(payload);
        },
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: editId ? t('cash_flow.modal.update_success', 'Entry updated') : t('cash_flow.modal.create_success', 'Entry created'),
                color: 'teal',
            });
            queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
            queryClient.invalidateQueries({ queryKey: ['cash-flow-summary'] });
            close();
            resetForm();
        },
        onError: (err) => {
            notifications.show({
                title: t('common.error'),
                message: err.response?.data?.error || 'Operation failed',
                color: 'red',
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => cashFlowService.delete(id),
        onSuccess: () => {
            notifications.show({ title: t('common.success'), message: t('cash_flow.modal.delete_success', 'Entry removed'), color: 'orange' });
            queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
            queryClient.invalidateQueries({ queryKey: ['cash-flow-summary'] });
        },
    });

    const resetForm = () => {
        setEditId(null);
        setFormType('income');
        setFormSource('');
        setFormAmount('');
        setFormDate(new Date());
        setFormNotes('');
    };

    const handleEdit = (entry) => {
        setEditId(entry.id);
        setFormType(entry.type);
        setFormSource(entry.source);
        setFormAmount(entry.amount);
        setFormDate(new Date(entry.date));
        setFormNotes(entry.notes || '');
        open();
    };

    const handleSubmit = () => {
        if (!formSource || formAmount <= 0) {
            notifications.show({ title: t('common.error'), message: 'Please fill all required fields', color: 'red' });
            return;
        }

        const dateStr = formDate instanceof Date
            ? `${formDate.getFullYear()}-${String(formDate.getMonth() + 1).padStart(2, '0')}-${String(formDate.getDate()).padStart(2, '0')}`
            : formDate;

        saveMutation.mutate({
            type: formType,
            source: formSource,
            amount: formAmount,
            date: dateStr,
            notes: formNotes,
        });
    };

    const entries = cfData?.data || [];
    const totalItems = cfData?.total_items || 0;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const totalCapital = summaryData?.total_capital || 0;
    const totalIncome = summaryData?.total_income || 0;
    const totalExpense = summaryData?.total_expense || 0;
    const netProfit = summaryData?.net_profit || 0;

    // Period label for summary cards
    const periodLabel = {
        this_month: t('cash_flow.this_month', 'This Month'),
        last_month: t('cash_flow.last_month', 'Last Month'),
        this_year: t('cash_flow.this_year', 'This Year'),
        all_time: t('cash_flow.all_time', 'All Time'),
    }[dateRange] || '';

    // Ring progress percentage
    const total = totalIncome + totalExpense;
    const incomePercent = total > 0 ? (totalIncome / total) * 100 : 50;

    return (
        <Stack gap="lg">
            {/* Page Title */}
            <Group justify="space-between" align="center">
                <div>
                    <Title order={2} fw={800}>
                        <Group gap="xs">
                            <ThemeIcon variant="light" size="lg" color="kala-lilac">
                                <IconCashBanknote size={20} />
                            </ThemeIcon>
                            {t('cash_flow.title', 'Cash Flow')}
                        </Group>
                    </Title>
                    <Text c="dimmed" size="sm" mt={4}>{t('cash_flow.subtitle', 'Track income and expenses')}</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} color="kala-lilac" onClick={() => { resetForm(); open(); }}>
                    {t('cash_flow.add_entry', 'Add Entry')}
                </Button>
            </Group>

            {/* Summary Cards */}
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card padding="lg" radius="md" withBorder style={{ borderLeft: '4px solid var(--mantine-color-blue-6)' }}>
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{t('cash_flow.total_capital', 'Total Capital')}</Text>
                                <Text size="xl" fw={700} c="blue">Rp {totalCapital.toLocaleString('id-ID')}</Text>
                            </div>
                            <ThemeIcon variant="light" size="lg" color="blue">
                                <IconCashBanknote size={20} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card padding="lg" radius="md" withBorder style={{ borderLeft: '4px solid var(--mantine-color-teal-6)' }}>
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{t('cash_flow.income', 'Income')} ({periodLabel})</Text>
                                <Text size="xl" fw={700} c="teal">Rp {totalIncome.toLocaleString('id-ID')}</Text>
                            </div>
                            <ThemeIcon variant="light" size="lg" color="teal">
                                <IconArrowDownRight size={20} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card padding="lg" radius="md" withBorder style={{ borderLeft: '4px solid var(--mantine-color-red-6)' }}>
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{t('cash_flow.expense', 'Expense')} ({periodLabel})</Text>
                                <Text size="xl" fw={700} c="red">Rp {totalExpense.toLocaleString('id-ID')}</Text>
                            </div>
                            <ThemeIcon variant="light" size="lg" color="red">
                                <IconArrowUpRight size={20} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card padding="lg" radius="md" withBorder style={{ borderLeft: `4px solid var(--mantine-color-${netProfit >= 0 ? 'teal' : 'red'}-6)` }}>
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{t('cash_flow.net_flow', 'Net Flow')}</Text>
                                <Text size="xl" fw={700} c={netProfit >= 0 ? 'teal' : 'red'}>
                                    Rp {netProfit.toLocaleString('id-ID')}
                                </Text>
                            </div>
                            <RingProgress
                                size={48}
                                thickness={5}
                                roundCaps
                                sections={[{ value: incomePercent, color: 'teal' }]}
                                label={<IconChartPie size={16} style={{ display: 'block', margin: 'auto' }} />}
                            />
                        </Group>
                    </Card>
                </Grid.Col>
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
                                { value: '', label: t('cash_flow.filter.all', 'All') },
                                { value: 'income', label: t('cash_flow.filter.income', '↓ Income') },
                                { value: 'expense', label: t('cash_flow.filter.expense', '↑ Expenses') },
                            ]}
                            size="xs"
                        />
                    </Group>
                    <SegmentedControl
                        value={dateRange}
                        onChange={(v) => { setDateRange(v); setPage(1); }}
                        data={[
                            { value: 'this_month', label: t('cash_flow.this_month', 'This Month') },
                            { value: 'last_month', label: t('cash_flow.last_month', 'Last Month') },
                            { value: 'this_year', label: t('cash_flow.this_year', 'This Year') },
                            { value: 'all_time', label: t('cash_flow.all_time', 'All Time') },
                        ]}
                        size="xs"
                    />
                </Group>
            </Paper>

            {/* Table */}
            <Paper p="md" radius="md" withBorder>
                {isLoading ? (
                    <Center py="xl"><Loader color="kala-lilac" /></Center>
                ) : entries.length === 0 ? (
                    <Center py="xl">
                        <Stack align="center" gap="xs">
                            <IconCashBanknote size={48} color="gray" />
                            <Text c="dimmed">{t('cash_flow.no_data', 'No cash flow entries found')}</Text>
                        </Stack>
                    </Center>
                ) : (
                    <>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('cash_flow.headers.date', 'Date')}</Table.Th>
                                    <Table.Th>{t('cash_flow.headers.type', 'Type')}</Table.Th>
                                    <Table.Th>{t('cash_flow.headers.source', 'Source')}</Table.Th>
                                    <Table.Th ta="right">{t('cash_flow.headers.amount', 'Amount')}</Table.Th>
                                    <Table.Th>{t('cash_flow.headers.notes', 'Notes')}</Table.Th>
                                    <Table.Th>{t('cash_flow.headers.user', 'User')}</Table.Th>
                                    <Table.Th ta="center">{t('cash_flow.headers.actions', 'Actions')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {entries.map((entry) => {
                                    const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.expense;
                                    return (
                                        <Table.Tr key={entry.id}>
                                            <Table.Td>
                                                <Text size="sm">
                                                    {new Date(entry.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={`${cfg.color}.4`} variant="light" size="sm" leftSection={<cfg.icon size={12} />}>
                                                    {cfg.label}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" tt="capitalize">{t(`source_options.${entry.source}`, entry.source?.replace(/_/g, ' '))}</Text>
                                            </Table.Td>
                                            <Table.Td ta="right">
                                                <Text fw={600} c={entry.type === 'income' ? 'teal' : 'red'}>
                                                    {entry.type === 'income' ? '+' : '-'} Rp {entry.amount.toLocaleString('id-ID')}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed" lineClamp={1} maw={200}>{entry.notes || '-'}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{entry.user?.username || '-'}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap={4} justify="center">
                                                    <Tooltip label={t('common.edit', 'Edit')}>
                                                        <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => handleEdit(entry)}>
                                                            <IconEdit size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label={t('common.delete', 'Delete')}>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => deleteMutation.mutate(entry.id)}
                                                        >
                                                            <IconTrash size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
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

            {/* Add/Edit Modal */}
            <Modal
                opened={opened}
                onClose={() => { close(); resetForm(); }}
                title={editId ? t('cash_flow.modal.edit_entry', 'Edit Entry') : t('cash_flow.modal.add_entry', 'Add Cash Flow Entry')}
                size="md"
                centered
            >
                <Stack gap="md">
                    <SegmentedControl
                        fullWidth
                        value={formType}
                        onChange={(v) => { setFormType(v); setFormSource(''); }}
                        data={[
                            { value: 'income', label: t('cash_flow.filter.income', '↓ Income') },
                            { value: 'expense', label: t('cash_flow.filter.expense', '↑ Expense') },
                        ]}
                        color={TYPE_CONFIG[formType]?.color}
                    />

                    <Select
                        label={t('inventory.modal.source', 'Source / Category')}
                        placeholder={t('inventory.modal.select_reason', 'Select category')}
                        data={SOURCE_OPTIONS[formType] || []}
                        value={formSource}
                        onChange={setFormSource}
                        required
                    />

                    <Group grow>
                        <NumberInput
                            label={t('cash_flow.headers.amount', 'Amount')}
                            value={formAmount}
                            onChange={setFormAmount}
                            placeholder="0"
                            prefix="Rp "
                            min={1}
                            thousandSeparator=","
                            required
                        />
                        <DateTimePicker
                            label={t('cash_flow.headers.date', 'Date')}
                            value={formDate}
                            onChange={setFormDate}
                            required
                        />
                    </Group>

                    <Textarea
                        label={t('cash_flow.headers.notes', 'Notes')}
                        placeholder={t('inventory.modal.optional_notes', 'Optional notes...')}
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                    />

                    <Button
                        color={TYPE_CONFIG[formType]?.color}
                        onClick={handleSubmit}
                        loading={saveMutation.isPending}
                        fullWidth
                    >
                        {editId ? t('cash_flow.modal.update_entry', 'Update Entry') : formType === 'income' ? t('cash_flow.modal.record_income', 'Record Income') : t('cash_flow.modal.record_expense', 'Record Expense')}
                    </Button>
                </Stack>
            </Modal>
        </Stack>
    );
}
