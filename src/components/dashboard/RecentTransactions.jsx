import { Paper, Text, Title, Group, Badge, Avatar, Table, ScrollArea, Button } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../lib/formatter';

export default function RecentTransactions({ transactions }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const data = transactions && transactions.length > 0 ? transactions : [];

    const getStatusConfig = (status) => {
        const s = (status || 'completed').toLowerCase();
        switch (s) {
            case 'returned': return { color: 'orange', label: t('transactions.returned', 'Diretur') };
            case 'cancelled': return { color: 'red', label: t('transactions.cancelled', 'Dibatalkan') };
            default: return { color: 'green', label: t('transactions.completed', 'Selesai') };
        }
    };

    const rows = data.map((tx) => (
        <Table.Tr key={tx.id}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar color="blue" radius="xl" size="sm">#</Avatar>
                    <Text fz="sm" fw={500}>{tx.transaction_code || tx.customer}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge
                    color={getStatusConfig(tx.status).color}
                    variant="light"
                    radius="sm"
                >
                    {getStatusConfig(tx.status).label}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text fz="sm">{tx.time}</Text>
            </Table.Td>
            <Table.Td>
                <Text fz="sm" fw={700}>{formatCurrency(tx.amount)}</Text>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Paper withBorder p="md" radius="xl" h="100%">
            <Group justify="space-between" mb="md">
                <Title order={4}>{t('dashboard.recent_transactions')}</Title>
                <Button
                    variant="light"
                    size="xs"
                    radius="md"
                    rightSection={<IconArrowRight size={14} />}
                    onClick={() => navigate('/transactions')}
                >
                    {t('dashboard.view_all')}
                </Button>
            </Group>

            <ScrollArea h={400}>
                <Table verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{t('dashboard.invoice', 'Invoice')}</Table.Th>
                            <Table.Th>{t('dashboard.status')}</Table.Th>
                            <Table.Th>{t('dashboard.time')}</Table.Th>
                            <Table.Th>{t('reports.total_amount')}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.length > 0 ? rows : (
                            <Table.Tr>
                                <Table.Td colSpan={4}>
                                    <Text c="dimmed" ta="center" py="lg">{t('common.no_data')}</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Paper>
    );
}
