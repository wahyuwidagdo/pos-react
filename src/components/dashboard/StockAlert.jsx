import { Paper, Text, Title, Table, Badge, ScrollArea, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export default function StockAlert({ products }) {
    const { t } = useTranslation();

    const getStockBadge = (stock) => {
        if (stock <= 0) {
            return <Badge color="red.4" variant="light" radius="sm" size="xs">{t('dashboard.out_of_stock')}</Badge>;
        }
        if (stock < 5) {
            return <Badge color="orange.4" variant="light" radius="sm" size="xs">{t('dashboard.low_stock')}</Badge>;
        }
        return <Badge color="yellow.4" variant="light" radius="sm" size="xs">{t('dashboard.warning_stock')}</Badge>;
    };

    const getStockColor = (stock) => {
        if (stock <= 0) return 'red.4';
        if (stock < 5) return 'orange.4';
        return 'yellow.4';
    };

    return (
        <Paper withBorder p="md" radius="xl" h="100%">
            <Title order={4} mb="md">{t('dashboard.stock_alert')}</Title>
            <ScrollArea h={400} offsetScrollbars>
                {products && products.length > 0 ? (
                    <Table verticalSpacing="xs" horizontalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>{t('products.name')}</Table.Th>
                                <Table.Th style={{ whiteSpace: 'nowrap' }}>{t('dashboard.status')}</Table.Th>
                                <Table.Th ta="right" style={{ whiteSpace: 'nowrap' }}>{t('products.stock')}</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {products.map((p) => (
                                <Table.Tr key={p.id}>
                                    <Table.Td>
                                        <Text size="sm" fw={500} lineClamp={1}>{p.name}</Text>
                                        <Text size="xs" c="dimmed">{p.sku}</Text>
                                    </Table.Td>
                                    <Table.Td>{getStockBadge(p.stock)}</Table.Td>
                                    <Table.Td ta="right">
                                        <Badge color={getStockColor(p.stock)} variant="light" size="md" radius="sm">
                                            {p.stock}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                ) : (
                    <Group justify="center" h={200}>
                        <Text c="dimmed" size="sm">{t('dashboard.all_stock_ok')}</Text>
                    </Group>
                )}
            </ScrollArea>
        </Paper>
    );
}
