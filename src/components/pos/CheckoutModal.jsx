import { useState, useRef, useEffect } from 'react';
import {
    Modal,
    NumberInput,
    Button,
    Group,
    Text,
    Stack,
    SegmentedControl,
    Divider,
    Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconPrinter, IconCheck } from '@tabler/icons-react';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { settingsService, transactionService } from '../../api/services';import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import { formatCurrency } from '../../lib/formatter';
import { Receipt } from './Receipt';
import useNotificationStore from '../../store/useNotificationStore';

export default function CheckoutModal({ opened, onClose, total }) {
    const { t } = useTranslation();
    const { items, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [transaction, setTransaction] = useState(null);
    const receiptRef = useRef(null);
    const { addNotification } = useNotificationStore();

    // Fetch store settings for receipts
    const { data: storeSettingsData } = useQuery({
        queryKey: ['store-settings'],
        queryFn: async () => {
            const res = await settingsService.getStoreSettings();
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // cache for 5 min
    });

    const { data: paymentMethodsRaw = [] } = useQuery({
        queryKey: ['payment-methods'],
        queryFn: async () => {
            const res = await settingsService.getPaymentMethods();
            return res.data || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const paymentMethods = paymentMethodsRaw.filter(pm => pm.is_active).sort((a, b) => a.sort_order - b.sort_order);

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: 'Receipt',
    });

    const form = useForm({
        initialValues: {
            paymentMethod: '',
            cashReceived: '',
        },
        validate: {
            paymentMethod: (value) => (value ? null : 'Payment method is required'),
        }
    });

    useEffect(() => {
        if (opened && paymentMethods.length > 0) {
            if (!paymentMethods.some(pm => pm.name === form.values.paymentMethod)) {
                const defaultPm = paymentMethods.find(pm => pm.is_cash)?.name || paymentMethods[0].name;
                form.setFieldValue('paymentMethod', defaultPm);
            }
        }
    }, [opened, paymentMethods]);

    const selectedPm = paymentMethods.find(pm => pm.name === form.values.paymentMethod);
    const isCash = selectedPm ? selectedPm.is_cash : form.values.paymentMethod?.toLowerCase().includes('cash');
    const cashReceived = Number(form.values.cashReceived) || 0;
    const change = Math.max(0, cashReceived - total);

    const mutation = useMutation({
        mutationFn: async (values) => {
            const currentSelectedPm = paymentMethods.find(pm => pm.name === values.paymentMethod);
            const currentIsCash = currentSelectedPm ? currentSelectedPm.is_cash : values.paymentMethod?.toLowerCase().includes('cash');

            const payload = {
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                payment_method: values.paymentMethod,
                cash: currentIsCash ? values.cashReceived : total,
            };
            const response = await transactionService.create(payload);
            return response;
        },
        onSuccess: (data) => {
            setTransaction(data.data);
            notifications.show({
                title: t('common.success'),
                message: t('pos.transaction_complete'),
                color: 'green',
                icon: <IconCheck />,
            });
            queryClient.invalidateQueries(['dashboard']);
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['stock-alerts']);

            // Add in-app notification
            addNotification({
                type: 'transaction',
                title: t('pos.transaction_complete', 'Transaction Complete'),
                message: `${t('pos.transaction_id', 'Transaction')}: ${data.data?.transaction_code || 'N/A'} — ${formatCurrency(total)}`,
            });
        },
        onError: (error) => {
            notifications.show({
                title: t('common.error'),
                message: error.response?.data?.error || 'Something went wrong',
                color: 'red',
            });
        }
    });

    const handleSubmit = (values) => {
        if (isCash && values.cashReceived < total) {
            form.setFieldError('cashReceived', t('pos.insufficient_amount'));
            return;
        }
        mutation.mutate(values);
    };

    const handleClose = () => {
        if (transaction) {
            clearCart();
            setTransaction(null);
            form.reset();
        }
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={<Text fw={700} size="lg">{t('pos.checkout')}</Text>}
            centered
            size="md"
            fullScreen={window.innerWidth < 500}
        >
            {/* Hidden Receipt Component for Printing */}
            <div style={{ position: 'absolute', opacity: 0, zIndex: -1000, top: 0, left: 0, height: 0, overflow: 'hidden' }}>
                <Receipt
                    ref={receiptRef}
                    transaction={transaction}
                    cartItems={items}
                    user={user}
                    storeSettings={storeSettingsData}
                />
            </div>

            {!transaction ? (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <Group justify="space-between">
                            <Text c="dimmed">{t('pos.total_amount')}</Text>
                            <Text fw={800} size="xl" c="kala-lilac">{formatCurrency(total)}</Text>
                        </Group>

                        <Divider />

                        <Text fw={500} size="sm">{t('pos.payment_method')}</Text>
                        <SegmentedControl
                            fullWidth
                            data={
                                paymentMethods.length > 0
                                    ? paymentMethods.map(pm => ({ label: pm.name, value: pm.name }))
                                    : [{ label: 'Cash', value: 'Cash' }, { label: 'QRIS', value: 'QRIS' }]
                            }
                            {...form.getInputProps('paymentMethod')}
                        />

                        {isCash && (
                            <>
                                <NumberInput
                                    label={t('pos.cash_received')}
                                    placeholder="0"
                                    leftSection="Rp"
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    allowNegative={false}
                                    allowLeadingZeros={false}
                                    min={0}
                                    hideControls
                                    size="lg"
                                    {...form.getInputProps('cashReceived')}
                                />

                                <Paper withBorder p="sm" radius="md">
                                    <Group justify="space-between">
                                        <Text fw={500}>{t('pos.change')}</Text>
                                        <Text fw={700} c={(cashReceived || 0) >= total ? 'green' : 'red'}>
                                            {formatCurrency(change)}
                                        </Text>
                                    </Group>
                                </Paper>
                            </>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            mt="md"
                            color="kala-lilac"
                            loading={mutation.isPending}
                        >
                            {t('pos.process_payment')}
                        </Button>
                    </Stack>
                </form>
            ) : (
                <Stack align="center" gap="md" py="lg">
                    <IconCheck size={50} color="green" />
                    <Text size="xl" fw={700}>{t('pos.payment_success')}</Text>
                    <Text c="dimmed">{t('pos.transaction_id')}: {transaction.transaction_code}</Text>

                    <Stack mt="lg" w="100%" gap="sm">
                        <Button
                            variant="outline"
                            fullWidth
                            leftSection={<IconPrinter />}
                            onClick={handlePrint}
                        >
                            {t('pos.print_receipt')}
                        </Button>
                        <Button fullWidth onClick={handleClose}>
                            {t('pos.new_transaction')}
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Modal>
    );
}
