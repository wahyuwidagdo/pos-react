import React, { useRef } from 'react';
import { Modal, Table, Text, Group, Stack, Badge, Divider, LoadingOverlay, Button } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { transactionService } from '../../api/transactionService';
import { Receipt } from '../pos/Receipt';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/axios';

export default function TransactionDetailModal({ opened, onClose, transactionId }) {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const receiptRef = useRef(null);

    const { data: transaction, isLoading } = useQuery({
        queryKey: ['transaction', transactionId],
        queryFn: () => transactionService.getTransactionById(transactionId),
        enabled: !!transactionId && opened,
    });

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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const details = transaction?.data || {};
    const items = details.transaction_details || [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'returned':
                return <Badge size="lg" color="orange">{t('transactions.returned', 'Diretur')}</Badge>;
            case 'cancelled':
                return <Badge size="lg" color="red">{t('transactions.cancelled', 'Dibatalkan')}</Badge>;
            default:
                return <Badge size="lg" color="green">{t('transactions.completed', 'Selesai')}</Badge>;
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

    const receiptItems = items.map(d => ({
        name: d.product_name,
        price: d.price_at_sale,
        quantity: d.quantity,
    }));

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t('transactions.detail_title', 'Detail Transaksi')}
            size="lg"
            centered
        >
            <div style={{ position: 'relative', minHeight: 200 }}>
                <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                {details && (
                    <Stack gap="md">
                        {/* Header Info */}
                        <Group justify="space-between">
                            <div>
                                <Text fw={700} size="lg">{details.transaction_code}</Text>
                                <Text size="sm" c="dimmed">
                                    {details.created_at && new Date(details.created_at).toLocaleString('id-ID', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </Text>
                            </div>
                            <Group>
                                {getStatusBadge(details.status || 'completed')}
                                <Badge size="lg" color={getPaymentMethodColor(details.payment_method)}>
                                    {details.payment_method}
                                </Badge>
                            </Group>
                        </Group>

                        <Divider />

                        {/* Items Table */}
                        <Table striped highlightOnHover withTableBorder withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('common.product', 'Produk')}</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>{t('common.price', 'Harga')}</Table.Th>
                                    <Table.Th style={{ textAlign: 'center' }}>{t('common.qty', 'Qty')}</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>{t('common.subtotal', 'Subtotal')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {items.map((item, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>
                                            <Text size="sm" fw={500}>{item.product_name}</Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Text size="sm">{formatCurrency(item.price_at_sale)}</Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'center' }}>
                                            <Text size="sm">{item.quantity}</Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Text size="sm" fw={500}>{formatCurrency(item.sub_total || (item.price_at_sale * item.quantity))}</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>

                        <Divider />

                        {/* Totals */}
                        <Stack gap="xs" align="flex-end">
                            <Group w="100%" justify="space-between">
                                <Text c="dimmed">Total Amount:</Text>
                                <Text fw={500}>{formatCurrency(details.total_amount)}</Text>
                            </Group>
                            {details.discount > 0 && (
                                <Group w="100%" justify="space-between">
                                    <Text c="red">Discount:</Text>
                                    <Text c="red">- {formatCurrency(details.discount)}</Text>
                                </Group>
                            )}
                            <Group w="100%" justify="space-between">
                                <Text size="lg" fw={700}>Grand Total:</Text>
                                <Text size="lg" fw={700} c="blue">{formatCurrency(details.grand_total)}</Text>
                            </Group>

                            <Divider my="xs" w="100%" />

                            <Group w="100%" justify="space-between">
                                <Text>Cash:</Text>
                                <Text>{formatCurrency(details.cash)}</Text>
                            </Group>
                            <Group w="100%" justify="space-between">
                                <Text fw={700}>Change:</Text>
                                <Text fw={700}>{formatCurrency(details.change)}</Text>
                            </Group>
                        </Stack>

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={onClose}>
                                {t('common.close', 'Tutup')}
                            </Button>
                            <Button
                                leftSection={<IconPrinter size={16} />}
                                onClick={() => window.print()}
                            >
                                {t('common.print', 'Cetak Invoice')}
                            </Button>
                            <Button
                                leftSection={<IconPrinter size={16} />}
                                variant="light"
                                onClick={handlePrint}
                            >
                                {t('transactions.print_receipt', 'Cetak Struk')}
                            </Button>
                        </Group>
                    </Stack>
                )}
            </div>

            {/* Hidden Receipt for Printing */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <Receipt
                    ref={receiptRef}
                    transaction={details}
                    cartItems={receiptItems}
                    user={user}
                    storeSettings={storeSettings}
                />
            </div>
        </Modal>
    );
}
