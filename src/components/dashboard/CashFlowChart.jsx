import { Paper, Text, Group, Stack, Box, Badge } from '@mantine/core';
import { IconChartPie } from '@tabler/icons-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = [
    '#228BE6', // blue.7
    '#FA5252', // red.7
    '#12B886', // teal.7
    '#FAB005', // yellow.7
    '#7950F2', // violet.7
    '#BE4BDB', // grape.7
    '#F76707', // orange.7
    '#40C057', // green.6
    '#e64980', // pink.7
    '#82c91e', // lime.7
];

export default function CashFlowChart({ data }) {
    const { t } = useTranslation();

    // Data expectation: array of { source: string, type: string, total_amount: number }
    const chartData = (data || [])
        .filter(item => item.total_amount > 0)
        .map((item, index) => ({
            name: t(`source_options.${item.source}`, item.source),
            value: item.total_amount,
            type: item.type,
            color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value); // Sort by value desc

    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <Paper p="xs" shadow="sm" radius="md" withBorder style={{ minWidth: 150 }}>
                    <Text fw={600} size="sm">{d.name}</Text>
                    <Badge size="xs" variant="light" color={d.type === 'income' ? 'teal' : 'red'} mb={4}>
                        {d.type === 'income' ? t('cash_flow.income') : t('cash_flow.expense')}
                    </Badge>
                    <Group justify="space-between" gap="xs">
                        <Text size="xs" c="dimmed">Total:</Text>
                        <Text size="xs" fw={500}>
                            Rp {Number(d.value).toLocaleString('id-ID')}
                        </Text>
                    </Group>
                </Paper>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (!data || data.length === 0) {
        return (
            <Paper p="lg" radius="md" withBorder h="100%">
                <Group gap="xs" mb="md">
                    <IconChartPie size={20} stroke={1.5} />
                    <Text fw={700} size="md">{t('dashboard.cash_flow_summary', 'Arus Kas')}</Text>
                </Group>
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 200,
                    }}
                >
                    <Text c="dimmed" size="sm">{t('common.no_data')}</Text>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper p="lg" radius="md" withBorder h="100%">
            <Group gap="xs" mb="md">
                <IconChartPie size={20} stroke={1.5} />
                <Text fw={700} size="md">{t('dashboard.cash_flow_summary', 'Arus Kas')}</Text>
            </Group>

            <Text size="xs" c="dimmed" mb="sm">
                Total Jumlah Pergerakan Alur Kas
            </Text>

            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend (Limit to top 6 items to save space) */}
            <Stack gap={6} mt="sm">
                {chartData.slice(0, 6).map((item, index) => (
                    <Group key={item.name} justify="space-between" px="xs">
                        <Group gap="xs">
                            <Box
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: item.color,
                                }}
                            />
                            <Text size="sm" lineClamp={1} title={item.name}>{item.name}</Text>
                        </Group>
                        <Text size="sm" fw={500}>
                            Rp {Number(item.value).toLocaleString('id-ID')}
                        </Text>
                    </Group>
                ))}
                {chartData.length > 6 && (
                    <Text size="xs" c="dimmed" ta="center">... +{chartData.length - 6} more</Text>
                )}
            </Stack>
        </Paper>
    );
}
