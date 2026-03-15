import React, { useState, useRef } from 'react';
import {
    Container,
    Title,
    Paper,
    Table,
    Group,
    TextInput,
    Select,
    Button,
    Pagination,
    Badge,
    ActionIcon,
    Text,
    LoadingOverlay,
    Card,
    Menu,
    Modal,
    Stack,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
    IconSearch, IconEye, IconRefresh, IconFileSpreadsheet,
    IconDotsVertical, IconPrinter, IconArrowBackUp, IconX,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../api/transactionService';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useReactToPrint } from 'react-to-print';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';
import { Receipt } from '../components/pos/Receipt';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';

export default function Transactions() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
    const [selectedTxId, setSelectedTxId] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'cancel'|'return', id, code }
    const pageSize = 10;

    // Receipt printing
    const receiptRef = useRef(null);
    const [receiptTx, setReceiptTx] = useState(null);
    const [receiptItems, setReceiptItems] = useState([]);

    // Fetch store settings for receipt
    const { data: storeSettings } = useQuery({
        queryKey: ['store-settings'],
        queryFn: async () => {
            const res = await api.get('/store-settings');
            return res.data?.data || res.data;
        },
        staleTime: 60000,
    });

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: 'Receipt',
    });

    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handleViewDetail = (id) => {
        setSelectedTxId(id);
        openDetails();
    };

    const handlePrintReceipt = async (txId) => {
        try {
            const res = await transactionService.getTransactionById(txId);
            const tx = res.data;
            setReceiptTx(tx);
            setReceiptItems((tx.transaction_details || []).map(d => ({
                name: d.product_name,
                price: d.price_at_sale,
                quantity: d.quantity,
            })));
            // Allow state to render, then print
            setTimeout(() => handlePrint(), 300);
        } catch (err) {
            notifications.show({ title: 'Error', message: 'Failed to load transaction for printing', color: 'red' });
        }
    };

    const cancelMutation = useMutation({
        mutationFn: (id) => transactionService.cancelTransaction(id),
        onSuccess: () => {
            notifications.show({ title: t('common.success', 'Berhasil'), message: t('transactions.cancel_success', 'Transaksi berhasil dibatalkan'), color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setConfirmAction(null);
        },
        onError: (err) => {
            notifications.show({ title: 'Error', message: err.response?.data?.error || 'Failed to cancel', color: 'red' });
        },
    });

    const returnMutation = useMutation({
        mutationFn: (id) => transactionService.returnTransaction(id),
        onSuccess: () => {
            notifications.show({ title: t('common.success', 'Berhasil'), message: t('transactions.return_success', 'Transaksi berhasil diretur'), color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setConfirmAction(null);
        },
        onError: (err) => {
            notifications.show({ title: 'Error', message: err.response?.data?.error || 'Failed to return', color: 'red' });
        },
    });

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['transactions', page, search],
        queryFn: () => transactionService.getAllTransactions({ page, limit: pageSize, search }),
        keepPreviousData: true,
    });

    const pagination = data?.data;
    const transactions = pagination?.data || [];
    const totalPages = pagination?.total_pages || 1;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'returned':
                return <Badge color="orange" variant="light" radius="sm">{t('transactions.returned', 'Diretur')}</Badge>;
            case 'cancelled':
                return <Badge color="red" variant="light" radius="sm">{t('transactions.cancelled', 'Dibatalkan')}</Badge>;
            default:
                return <Badge color="green" variant="light" radius="sm">{t('transactions.completed', 'Selesai')}</Badge>;
        }
    };

    const getPaymentMethodColor = (method) => {
        const m = (method || '').toUpperCase();
        if (m === 'CASH') return 'green';
        if (m === 'QRIS') return 'teal';
        if (m.includes('DEBIT')) return 'indigo'; // DEBIT CARD
        if (m.includes('CREDIT')) return 'violet'; // CREDIT CARD
        return 'blue';
    };

    const rows = Array.isArray(transactions) ? transactions.map((tx) => (
        <Table.Tr key={tx.id}>
            <Table.Td>
                <Text fw={500} size="sm">{tx.transaction_code}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{dayjs(tx.created_at).format('DD MMM YYYY HH:mm')}</Text>
            </Table.Td>
            <Table.Td>
                <Text fw={700} size="sm">{formatIDR(tx.grand_total)}</Text>
            </Table.Td>
            <Table.Td>
                <Badge
                    color={getPaymentMethodColor(tx.payment_method)}
                    variant="light"
                >
                    {tx.payment_method}
                </Badge>
            </Table.Td>
            <Table.Td>
                {getStatusBadge(tx.status || 'completed')}
            </Table.Td>
            <Table.Td>
                <Menu shadow="md" width={200} position="bottom-end" withArrow>
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={() => handleViewDetail(tx.id)}
                        >
                            {t('transactions.detail', 'Detail')}
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconPrinter size={14} />}
                            onClick={() => handlePrintReceipt(tx.id)}
                        >
                            {t('transactions.print_receipt', 'Cetak Struk')}
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconArrowBackUp size={14} />}
                            color="orange"
                            disabled={tx.status !== 'completed' && tx.status !== '' && tx.status != null}
                            onClick={() => setConfirmAction({ type: 'return', id: tx.id, code: tx.transaction_code })}
                        >
                            {t('transactions.return', 'Return Pelanggan')}
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconX size={14} />}
                            color="red"
                            disabled={tx.status !== 'completed' && tx.status !== '' && tx.status != null}
                            onClick={() => setConfirmAction({ type: 'cancel', id: tx.id, code: tx.transaction_code })}
                        >
                            {t('transactions.cancel', 'Batalkan Transaksi')}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    )) : [];

    return (
        <Container fluid p="md">
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>{t('transactions.title', 'Riwayat Transaksi')}</Title>
                    <Text c="dimmed" size="sm">{t('transactions.subtitle', 'Daftar semua transaksi penjualan')}</Text>
                </div>
                <Group>
                    <Button
                        variant="light"
                        leftSection={<IconRefresh size={16} />}
                        onClick={() => refetch()}
                        loading={isLoading}
                    >
                        {t('common.refresh', 'Refresh')}
                    </Button>
                    <Button variant="outline" leftSection={<IconFileSpreadsheet size={16} />}>
                        {t('common.export', 'Export CSV')}
                    </Button>
                </Group>
            </Group>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                    <TextInput
                        placeholder={t('transactions.search_placeholder', 'Cari No. Invoice...')}
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        style={{ flex: 1 }}
                    />
                    <DatePickerInput
                        placeholder={t('transactions.filter_date', 'Filter Tanggal')}
                        clearable
                        type="range"
                        w={250}
                    />
                </Group>

                <div style={{ position: 'relative', minHeight: 200 }}>
                    <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>{t('transactions.invoice_no', 'No. Invoice')}</Table.Th>
                                <Table.Th>{t('transactions.date', 'Tanggal')}</Table.Th>
                                <Table.Th>{t('transactions.total', 'Total')}</Table.Th>
                                <Table.Th>{t('transactions.payment_method', 'Metode Bayar')}</Table.Th>
                                <Table.Th>{t('transactions.status', 'Status')}</Table.Th>
                                <Table.Th>{t('common.action', 'Aksi')}</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.length > 0 ? rows : (
                                <Table.Tr>
                                    <Table.Td colSpan={6}>
                                        <Text align="center" py="xl" c="dimmed">
                                            {t('transactions.no_data', 'Tidak ada data transaksi ditemukan')}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </div>

                <Group justify="flex-end" mt="md">
                    <Pagination total={totalPages} value={page} onChange={setPage} />
                </Group>
            </Card>

            {/* Detail Modal */}
            <TransactionDetailModal
                opened={detailsOpened}
                onClose={closeDetails}
                transactionId={selectedTxId}
            />

            {/* Confirmation Modal */}
            <Modal
                opened={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                title={confirmAction?.type === 'cancel'
                    ? t('transactions.confirm_cancel_title', 'Batalkan Transaksi')
                    : t('transactions.confirm_return_title', 'Return Pelanggan')}
                centered
                size="sm"
            >
                <Stack>
                    <Text size="sm">
                        {confirmAction?.type === 'cancel'
                            ? t('transactions.confirm_cancel', 'Apakah Anda yakin ingin membatalkan transaksi ini? Stok produk akan dikembalikan.')
                            : t('transactions.confirm_return', 'Apakah Anda yakin ingin meretur transaksi ini? Stok produk akan dikembalikan.')}
                    </Text>
                    <Text fw={700} size="sm">{confirmAction?.code}</Text>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setConfirmAction(null)}>
                            {t('common.cancel', 'Batal')}
                        </Button>
                        <Button
                            color={confirmAction?.type === 'cancel' ? 'red' : 'orange'}
                            loading={cancelMutation.isPending || returnMutation.isPending}
                            onClick={() => {
                                if (confirmAction?.type === 'cancel') {
                                    cancelMutation.mutate(confirmAction.id);
                                } else {
                                    returnMutation.mutate(confirmAction.id);
                                }
                            }}
                        >
                            {confirmAction?.type === 'cancel'
                                ? t('transactions.cancel', 'Batalkan Transaksi')
                                : t('transactions.return', 'Return Pelanggan')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Hidden Receipt for Printing */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <Receipt
                    ref={receiptRef}
                    transaction={receiptTx}
                    cartItems={receiptItems}
                    user={user}
                    storeSettings={storeSettings}
                />
            </div>
        </Container>
    );
}
