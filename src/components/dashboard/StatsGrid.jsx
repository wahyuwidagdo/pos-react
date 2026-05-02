import {
    SimpleGrid,
    Paper,
    Text,
    Group,
    ThemeIcon,
    rem,
    Skeleton,
    Box
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

// Tiny sparkline chart component
function MiniSparkline({ color = '#228be6' }) {
    // Simple generated trend data for visual effect
    const trendData = [
        { v: 30 }, { v: 45 }, { v: 38 }, { v: 52 }, { v: 41 },
        { v: 60 }, { v: 55 }, { v: 70 }
    ];

    return (
        <Box h={30} w={80}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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

export default function StatsGrid({ data, loading }) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={140} radius="xl" />)}
            </SimpleGrid>
        );
    }

    const stats = [
        {
            title: t('dashboard.total_revenue'),
            icon: IconCoin,
            value: formatCurrency(data?.today_sales || 0),
            diff: 12,
            color: 'blue',
            chartColor: '#228be6',
        },
        {
            title: t('dashboard.transactions'),
            icon: IconReceipt2,
            value: data?.today_transactions || 0,
            diff: -5,
            color: 'cyan',
            chartColor: '#15aabf',
        },
        {
            title: t('dashboard.items_sold'),
            icon: IconShoppingBag,
            value: data?.today_items_sold || 0,
            diff: 18,
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
                            {stat.diff !== undefined ? (
                                <Text c={stat.diff > 0 ? 'teal' : 'red'} fz="sm" fw={500} display="flex" style={{ alignItems: 'center' }}>
                                    <span>{stat.diff}%</span>
                                    <IconArrowUpRight size="1rem" stroke={1.5} style={{ transform: stat.diff < 0 ? 'rotate(90deg)' : 'none' }} />
                                </Text>
                            ) : (
                                <Text c="dimmed" fz="sm" fw={500}>{t('common.action_required')}</Text>
                            )}
                            <Text c="dimmed" fz="xs">{t('common.vs_yesterday')}</Text>
                        </Group>
                        <MiniSparkline color={stat.chartColor} />
                    </Group>
                </Paper>
            ))}
        </SimpleGrid>
    );
}
