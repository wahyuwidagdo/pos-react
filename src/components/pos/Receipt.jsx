import React from 'react';
import { Box, Stack, Text, Group, Divider } from '@mantine/core';
import { formatCurrency, formatDateTime } from '../../lib/formatter';

export const Receipt = React.forwardRef(({ transaction, cartItems, user, storeSettings }, ref) => {
    const store = storeSettings || {};
    const storeName = store.store_name || 'My Store';
    const storeAddress = store.address || '';
    const storePhone = store.phone || '';
    const footerText = store.footer_text || 'Thank you for your purchase!';

    return (
        <Box ref={ref} p="md" style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', display: transaction ? 'block' : 'none' }}>
            {transaction && (
                <>
                    <Stack align="center" gap={0} mb="sm">
                        <Text fw={700} size="lg">{storeName}</Text>
                        {storeAddress && <Text size="xs">{storeAddress}</Text>}
                        {storePhone && <Text size="xs">Tel: {storePhone}</Text>}
                    </Stack>

                    <Divider my="xs" style={{ borderStyle: 'dashed' }} />

                    <Group justify="space-between">
                        <Text size="xs">Date:</Text>
                        <Text size="xs">{formatDateTime(transaction.created_at ? new Date(transaction.created_at) : new Date())}</Text>
                    </Group>
                    <Group justify="space-between">
                        <Text size="xs">Receipt No:</Text>
                        <Text size="xs">{transaction.transaction_code}</Text>
                    </Group>
                    <Group justify="space-between">
                        <Text size="xs">Cashier:</Text>
                        <Text size="xs">{user?.username || 'Staff'}</Text>
                    </Group>

                    <Divider my="xs" style={{ borderStyle: 'dashed' }} />

                    <Stack gap={5}>
                        {cartItems.map((item, index) => (
                            <div key={index}>
                                <Text size="xs" fw={500}>{item.name}</Text>
                                <Group justify="space-between">
                                    <Text size="xs">{item.quantity} x {formatCurrency(item.price)}</Text>
                                    <Text size="xs">{formatCurrency(item.quantity * item.price)}</Text>
                                </Group>
                            </div>
                        ))}
                    </Stack>

                    <Divider my="xs" style={{ borderStyle: 'dashed' }} />

                    <Group justify="space-between">
                        <Text size="xs" fw={700}>TOTAL:</Text>
                        <Text size="xs" fw={700}>{formatCurrency(transaction.grand_total)}</Text>
                    </Group>

                    {transaction.discount > 0 && (
                        <Group justify="space-between">
                            <Text size="xs">Discount:</Text>
                            <Text size="xs">-{formatCurrency(transaction.discount)}</Text>
                        </Group>
                    )}

                    <Group justify="space-between">
                        <Text size="xs">Cash:</Text>
                        <Text size="xs">{formatCurrency(transaction.cash_received || transaction.cash)}</Text>
                    </Group>
                    <Group justify="space-between">
                        <Text size="xs">Change:</Text>
                        <Text size="xs">{formatCurrency(transaction.change_amount || transaction.change)}</Text>
                    </Group>

                    <Divider my="xs" style={{ borderStyle: 'dashed' }} />

                    <Text ta="center" size="xs" mt="sm">{footerText}</Text>
                </>
            )}
        </Box>
    );
});
Receipt.displayName = 'Receipt';
