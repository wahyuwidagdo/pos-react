import { Paper, Text, Group, Badge, Stack, Box, rem } from '@mantine/core';
import { IconCreditCard } from '@tabler/icons-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = [
    '#4C6EF5', // Indigo
    '#12B886', // Teal
    '#FA5252', // Red
    '#FD7E14', // Orange
    '#7950F2', // Violet
    '#20C997', // Cyan
    '#E64980', // Pink
];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <Paper p="xs" shadow="sm" radius="md" withBorder style={{ minWidth: 120 }}>
                <Text fw={600} size="sm">{data.method}</Text>
                <Group justify="space-between" gap="xs">
                    <Text size="xs" c="dimmed">Transactions:</Text>
                    <Text size="xs" fw={500}>{data.count}</Text>
                </Group>
                <Group justify="space-between" gap="xs">
                    <Text size="xs" c="dimmed">Total:</Text>
                    <Text size="xs" fw={500}>
                        Rp {Number(data.total).toLocaleString('id-ID')}
                    </Text>
                </Group>
            </Paper>
        );
    }
    return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Skip labels for slices < 5%
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

export default function PaymentMethodChart({ data = [] }) {
    const { t } = useTranslation();

    if (!data || data.length === 0) {
        return (
            <Paper p="lg" radius="md" withBorder h="100%">
                <Group gap="xs" mb="md">
                    <IconCreditCard size={20} stroke={1.5} />
                    <Text fw={700} size="md">{t('dashboard.payment_methods')}</Text>
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

    const total = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <Paper p="lg" radius="md" withBorder h="100%">
            <Group gap="xs" mb="md">
                <IconCreditCard size={20} stroke={1.5} />
                <Text fw={700} size="md">{t('dashboard.payment_methods')}</Text>
            </Group>

            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="total"
                        nameKey="method"
                        labelLine={false}
                        label={renderCustomLabel}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <Stack gap={6} mt="sm">
                {data.map((item, index) => (
                    <Group key={item.method} justify="space-between" px="xs">
                        <Group gap="xs">
                            <Box
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: COLORS[index % COLORS.length],
                                }}
                            />
                            <Text size="sm">{item.method}</Text>
                        </Group>
                        <Group gap="xs">
                            <Badge size="xs" variant="light" color="gray">{item.count}x</Badge>
                            <Text size="sm" fw={500} style={{ minWidth: 80, textAlign: 'right' }}>
                                Rp {Number(item.total).toLocaleString('id-ID')}
                            </Text>
                        </Group>
                    </Group>
                ))}
                <Group justify="space-between" px="xs" mt={4} pt={4} style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                    <Text size="sm" fw={700}>{t('common.total')}</Text>
                    <Text size="sm" fw={700}>Rp {total.toLocaleString('id-ID')}</Text>
                </Group>
            </Stack>
        </Paper>
    );
}
