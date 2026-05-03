import {
    SimpleGrid,
    Paper,
    Text,
    Group,
    ThemeIcon,
    rem,
    Skeleton,
    Box,
    Tooltip
} from '@mantine/core';
import {
    IconReceipt2,
    IconCoin,
    IconArrowUpRight,
    IconAlertTriangle,
    IconShoppingBag
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../lib/formatter';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

// Tiny sparkline chart using real revenue trend data
function MiniSparkline({ color = '#228be6', data }) {
    // If we have real trend data, sample it down to ~8 points for the sparkline
    const sparkData = (() => {
        if (!data || data.length === 0) {
            return [{ v: 0 }, { v: 0 }];
        }
        if (data.length <= 8) {
            return data.map(d => ({ v: d.revenue || 0 }));
        }
        // Sample evenly across the data
        const step = Math.floor(data.length / 8);
        const sampled = [];
        for (let i = 0; i < data.length; i += step) {
            sampled.push({ v: data[i].revenue || 0 });
        }
        // Always include the last point
        if (sampled.length > 0) {
            sampled[sampled.length - 1] = { v: data[data.length - 1].revenue || 0 };
        }
        return sampled.slice(0, 8);
    })();

    return (
        <Box h={30} w={80}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Area
                        type="monotone"
                        dataKey="v"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.15}
                        strokeWidth={1.5}
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
}

// Helper to get comparison label based on the date range
function getComparisonLabel(t, dateRange) {
    switch (dateRange) {
        case 'this_week': return t('dashboard.vs_last_week', 'vs minggu lalu');
        case 'this_month': return t('dashboard.vs_last_month', 'vs bulan lalu');
        case 'this_year': return t('dashboard.vs_last_year', 'vs tahun lalu');
        default: return t('common.vs_yesterday', 'vs kemarin');
    }
}

export default function StatsGrid({ data, loading, dateRange }) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={140} radius="xl" />)}
            </SimpleGrid>
        );
    }

    const salesDiff = data?.sales_diff != null ? Math.round(data.sales_diff) : null;
    const transactionsDiff = data?.transactions_diff != null ? Math.round(data.transactions_diff) : null;
    const itemsSoldDiff = data?.items_sold_diff != null ? Math.round(data.items_sold_diff) : null;
    const comparisonLabel = getComparisonLabel(t, dateRange);

    const stats = [
        {
            title: t('dashboard.total_revenue'),
            icon: IconCoin,
            value: formatCurrency(data?.today_sales || 0),
            diff: salesDiff,
            color: 'blue',
            chartColor: '#228be6',
        },
        {
            title: t('dashboard.transactions'),
            icon: IconReceipt2,
            value: data?.today_transactions || 0,
            diff: transactionsDiff,
            color: 'cyan',
            chartColor: '#15aabf',
        },
        {
            title: t('dashboard.items_sold'),
            icon: IconShoppingBag,
            value: data?.today_items_sold || 0,
            diff: itemsSoldDiff,
            color: 'teal',
            chartColor: '#12b886',
        },
        {
            title: t('dashboard.low_stock_alerts'),
            icon: IconAlertTriangle,
            value: data?.low_stock_count || 0,
            color: 'red',
            chartColor: '#fa5252',
        },
    ];

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {stats.map((stat) => (
                <Paper withBorder p="md" radius="xl" key={stat.title}>
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                                {stat.title}
                            </Text>
                            <Text fw={700} fz="xl" mt="xs">
                                {stat.value}
                            </Text>
                        </div>

                        <div style={{ 
                            width: rem(38), 
                            height: rem(38), 
                            borderRadius: rem(38),
                            background: `var(--mantine-color-${stat.color}-light)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <stat.icon style={{ width: rem(20), height: rem(20), color: `var(--mantine-color-${stat.color}-4)` }} stroke={2} />
                        </div>
                    </Group>

                    <Group align="flex-end" gap="xs" mt="xs" justify="space-between">
                        <Group gap="xs">
                            {stat.diff != null ? (
                                <Tooltip label={`${stat.diff > 0 ? '+' : ''}${stat.diff}% ${comparisonLabel}`}>
                                    <Text c={stat.diff > 0 ? 'teal' : stat.diff < 0 ? 'red' : 'dimmed'} fz="sm" fw={500} display="flex" style={{ alignItems: 'center' }}>
                                        <span>{stat.diff > 0 ? '+' : ''}{stat.diff}%</span>
                                        {stat.diff !== 0 && (
                                            <IconArrowUpRight size="1rem" stroke={1.5} style={{ transform: stat.diff < 0 ? 'rotate(90deg)' : 'none' }} />
                                        )}
                                    </Text>
                                </Tooltip>
                            ) : (
                                <Text c="dimmed" fz="sm" fw={500}>{t('common.action_required')}</Text>
                            )}
                            <Text c="dimmed" fz="xs">{stat.diff != null ? comparisonLabel : ''}</Text>
                        </Group>
                        <MiniSparkline color={stat.chartColor} data={data?.revenue_trend} />
                    </Group>
                </Paper>
            ))}
        </SimpleGrid>
    );
}
