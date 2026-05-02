import { useState } from 'react';
import {
    Title,
    Text,
    Group,
    Paper,
    ThemeIcon,
    Stack,
    SimpleGrid,
    Table,
    Tabs,
    Loader,
    Center,
    rem,
    Badge,
    Button
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
    IconCalendar,
    IconCurrencyDollar,
    IconReceipt,
    IconShoppingCart,
    IconTrendingUp,
    IconChartBar,
    IconPackage,
    IconDownload
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import { reportService } from '../api/services';
import { formatCurrency } from '../lib/formatter';
import { downloadFile } from '../lib/export';
import { notifications } from '@mantine/notifications';

export default function Reports() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('sales');

    const [dateRange, setDateRange] = useState([
        dayjs().subtract(30, 'day').toDate(),
        dayjs().toDate()
    ]);

    const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
    const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');

    const { data: salesData, isLoading: salesLoading } = useQuery({
        queryKey: ['report-sales', startDate, endDate],
        queryFn: async () => {
            const res = await reportService.getSalesReport({ start_date: startDate, end_date: endDate });
            return res.data;
        },
        enabled: activeTab === 'sales' || activeTab === 'hours'
    });

    const { data: productData, isLoading: productLoading } = useQuery({
        queryKey: ['report-products', startDate, endDate],
        queryFn: async () => {
            const res = await reportService.getProductReport({ start_date: startDate, end_date: endDate, limit: 20 });
            return res.data;
        },
        enabled: activeTab === 'products'
    });

    const { data: stockValueData, isLoading: stockLoading } = useQuery({
        queryKey: ['report-stock-value'],
        queryFn: async () => {
            const res = await reportService.getStockValue();
            return res.data;
        },
        enabled: activeTab === 'stock'
    });

    const StatsCard = ({ title, value, icon: Icon, color }) => (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
                <div>
                    <Text c="dimmed" tt="uppercase" fw={700} fz="xs">{title}</Text>
                    <Text fw={700} fz="xl">{value}</Text>
                </div>
                <div style={{ 
                    width: rem(42), 
                    height: rem(42), 
                    borderRadius: rem(10),
                    background: `var(--mantine-color-${color}-light)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon style={{ width: rem(24), height: rem(24), color: `var(--mantine-color-${color}-4)` }} stroke={2} />
                </div>
            </Group>
        </Paper>
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack gap="xs" mb="lg">
                <Group justify="space-between" wrap="wrap" gap="sm">
                    <div>
                        <Title order={2} fw={800} c="kala-lilac.9">{t('reports.title')}</Title>
                        <Text c="dimmed" size="sm">{t('reports.subtitle')}</Text>
                    </div>

                    <DatePickerInput
                        type="range"
                        leftSection={<IconCalendar size={16} />}
                        placeholder={t('reports.pick_dates')}
                        value={dateRange}
                        onChange={setDateRange}
                        style={{ width: '100%', maxWidth: 300 }}
                        clearable={false}
                    />
                    <Button
                        variant="light"
                        leftSection={<IconDownload size={16} />}
                        onClick={() => {
                            downloadFile(
                                '/export/transactions/csv',
                                `transactions_${new Date().toISOString().slice(0, 10)}.csv`
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
                </Group>
            </Stack>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md" keepMounted={false} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Tabs.List>
                    <Tabs.Tab value="sales" leftSection={<IconTrendingUp size={16} />}>{t('reports.sales_report')}</Tabs.Tab>
                    <Tabs.Tab value="products" leftSection={<IconShoppingCart size={16} />}>{t('reports.product_performance')}</Tabs.Tab>
                    <Tabs.Tab value="hours" leftSection={<IconChartBar size={16} />}>{t('reports.best_selling_hours')}</Tabs.Tab>
                    <Tabs.Tab value="stock" leftSection={<IconPackage size={16} />}>{t('reports.stock_value')}</Tabs.Tab>
                </Tabs.List>

                <div style={{ flex: 1, overflow: 'auto', paddingTop: '1rem' }}>
                    {/* SALES TAB */}
                    <Tabs.Panel value="sales">
                        {salesLoading ? (
                            <Center h={200}><Loader /></Center>
                        ) : !salesData?.summary ? (
                            <Center h={200}><Text c="dimmed">{t('reports.no_data')}</Text></Center>
                        ) : (
                            <Stack>
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                                    <StatsCard
                                        title={t('reports.total_revenue')}
                                        value={formatCurrency(salesData.summary.total_sales || 0)}
                                        icon={IconCurrencyDollar}
                                        color="green"
                                    />
                                    <StatsCard
                                        title={t('reports.gross_profit')}
                                        value={formatCurrency(salesData.summary.gross_profit || 0)}
                                        icon={IconTrendingUp}
                                        color="teal"
                                    />
                                    <StatsCard
                                        title={t('reports.total_transactions')}
                                        value={salesData.summary.total_transactions || 0}
                                        icon={IconReceipt}
                                        color="blue"
                                    />
                                    <StatsCard
                                        title={t('reports.items_sold')}
                                        value={salesData.summary.total_items_sold || 0}
                                        icon={IconShoppingCart}
                                        color="violet"
                                    />
                                </SimpleGrid>

                                {salesData.summary.profit_margin > 0 && (
                                    <Paper withBorder p="sm" radius="md">
                                        <Group gap="xs">
                                            <Text size="sm" c="dimmed">{t('reports.profit_margin')}:</Text>
                                            <Badge color="teal.4" variant="light" size="lg">
                                                {salesData.summary.profit_margin.toFixed(1)}%
                                            </Badge>
                                        </Group>
                                    </Paper>
                                )}

                                {salesData.daily_data?.length > 0 && (
                                    <Paper withBorder p="md" radius="md">
                                        <Title order={4} mb="md">{t('reports.revenue_trend')}</Title>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={salesData.daily_data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format('MMM DD')} />
                                                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(d) => dayjs(d).format('DD MMM YYYY')} />
                                                <Area type="monotone" dataKey="total_sales" stroke="#228be6" fill="#228be6" fillOpacity={0.15} strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                )}
                            </Stack>
                        )}
                    </Tabs.Panel>

                    {/* PRODUCTS TAB */}
                    <Tabs.Panel value="products">
                        {productLoading ? (
                            <Center h={200}><Loader /></Center>
                        ) : !productData?.products?.length ? (
                            <Center h={200}><Text c="dimmed">{t('reports.no_data')}</Text></Center>
                        ) : (
                            <Paper withBorder p="md" radius="md">
                                <Title order={4} mb="md">{t('reports.top_selling')}</Title>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>#</Table.Th>
                                            <Table.Th>{t('reports.product_name')}</Table.Th>
                                            <Table.Th>{t('common.category')}</Table.Th>
                                            <Table.Th ta="right">{t('reports.quantity_sold')}</Table.Th>
                                            <Table.Th ta="right">{t('reports.revenue')}</Table.Th>
                                            <Table.Th ta="right">{t('reports.stock')}</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {productData.products.map((product, idx) => (
                                            <Table.Tr key={product.product_id}>
                                                <Table.Td>{idx + 1}</Table.Td>
                                                <Table.Td fw={500}>{product.product_name}</Table.Td>
                                                <Table.Td>
                                                    <Badge variant="light" color="gray.4" size="sm">{product.category_name}</Badge>
                                                </Table.Td>
                                                <Table.Td ta="right">{product.total_sold}</Table.Td>
                                                <Table.Td ta="right">{formatCurrency(product.total_revenue)}</Table.Td>
                                                <Table.Td ta="right">
                                                    <Badge color={product.current_stock > 10 ? 'green.4' : product.current_stock > 0 ? 'orange.4' : 'red.4'} variant="light">
                                                        {product.current_stock}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Paper>
                        )}
                    </Tabs.Panel>

                    {/* BEST SELLING HOURS TAB */}
                    <Tabs.Panel value="hours">
                        {salesLoading ? (
                            <Center h={200}><Loader /></Center>
                        ) : !salesData?.hourly_data?.length ? (
                            <Center h={200}><Text c="dimmed">{t('reports.no_data')}</Text></Center>
                        ) : (
                            <Paper withBorder p="md" radius="md">
                                <Title order={4} mb="md">{t('reports.best_selling_hours')}</Title>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={salesData.hourly_data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`} />
                                        <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                if (name === 'total_sales') return [formatCurrency(value), t('reports.total_revenue')];
                                                return [value, t('reports.sales_count')];
                                            }}
                                            labelFormatter={(h) => `${String(h).padStart(2, '0')}:00 - ${String(h).padStart(2, '0')}:59`}
                                        />
                                        <Bar yAxisId="left" dataKey="total_sales" fill="#228be6" radius={[4, 4, 0, 0]} name="total_sales" />
                                        <Bar yAxisId="right" dataKey="total_transactions" fill="#40c057" radius={[4, 4, 0, 0]} name="total_transactions" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        )}
                    </Tabs.Panel>

                    {/* STOCK VALUE TAB */}
                    <Tabs.Panel value="stock">
                        {stockLoading ? (
                            <Center h={200}><Loader /></Center>
                        ) : !stockValueData ? (
                            <Center h={200}><Text c="dimmed">{t('reports.no_data')}</Text></Center>
                        ) : (
                            <Stack>
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                                    <StatsCard
                                        title={t('reports.total_stock_value')}
                                        value={formatCurrency(stockValueData.total_value || 0)}
                                        icon={IconCurrencyDollar}
                                        color="orange"
                                    />
                                    <Paper withBorder p="md" radius="md">
                                        <Group justify="space-between">
                                            <div>
                                                <Text c="dimmed" tt="uppercase" fw={700} fz="xs">Retail Value</Text>
                                                <Text fw={700} fz="xl">{formatCurrency(stockValueData.total_retail || 0)}</Text>
                                            </div>
                                            <div style={{ 
                                                width: rem(42), height: rem(42), borderRadius: rem(10),
                                                background: `var(--mantine-color-green-light)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <IconTrendingUp style={{ width: rem(24), height: rem(24), color: `var(--mantine-color-green-4)` }} stroke={2} />
                                            </div>
                                        </Group>
                                    </Paper>
                                    <Paper withBorder p="md" radius="md">
                                        <Group justify="space-between">
                                            <div>
                                                <Text c="dimmed" tt="uppercase" fw={700} fz="xs">Total Products</Text>
                                                <Text fw={700} fz="xl">{stockValueData.total_products || 0}</Text>
                                            </div>
                                            <div style={{ 
                                                width: rem(42), height: rem(42), borderRadius: rem(10),
                                                background: `var(--mantine-color-blue-light)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <IconPackage style={{ width: rem(24), height: rem(24), color: `var(--mantine-color-blue-4)` }} stroke={2} />
                                            </div>
                                        </Group>
                                    </Paper>
                                    <Paper withBorder p="md" radius="md">
                                        <Group justify="space-between">
                                            <div>
                                                <Text c="dimmed" tt="uppercase" fw={700} fz="xs">Total Units</Text>
                                                <Text fw={700} fz="xl">{stockValueData.total_units || 0}</Text>
                                            </div>
                                            <div style={{ 
                                                width: rem(42), height: rem(42), borderRadius: rem(10),
                                                background: `var(--mantine-color-violet-light)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <IconShoppingCart style={{ width: rem(24), height: rem(24), color: `var(--mantine-color-violet-4)` }} stroke={2} />
                                            </div>
                                        </Group>
                                    </Paper>
                                </SimpleGrid>

                                {stockValueData.total_value > 0 && stockValueData.total_retail > 0 && (
                                    <Paper withBorder p="md" radius="md">
                                        <Title order={5} mb="xs">{t('reports.profit_margin')}</Title>
                                        <Text c="dimmed" size="sm">
                                            Potential margin on current inventory:
                                            <Badge ml="xs" color="teal.4" variant="light" size="lg">
                                                {(((stockValueData.total_retail - stockValueData.total_value) / stockValueData.total_retail) * 100).toFixed(1)}%
                                            </Badge>
                                        </Text>
                                    </Paper>
                                )}
                            </Stack>
                        )}
                    </Tabs.Panel>
                </div>
            </Tabs>
        </div>
    );
}
