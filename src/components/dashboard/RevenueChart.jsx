import { Paper, Title, Text, Group } from '@mantine/core';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper p="xs" shadow="md" radius="md" bg="dark.7">
                <Text size="xs" c="white" fw={500}>{label}</Text>
                <Text size="sm" c="blue.3" fw={700}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payload[0].value)}
                </Text>
            </Paper>
        );
    }
    return null;
};

export default function RevenueChart({ data }) {
    const { t } = useTranslation();

    // Use dummy last 7 days if no data
    const chartData = data && data.length > 0 ? data.map(d => ({ name: d.date, revenue: d.revenue })) : [
        { name: 'Mon', revenue: 0 },
        { name: 'Tue', revenue: 0 },
        { name: 'Wed', revenue: 0 },
        { name: 'Thu', revenue: 0 },
        { name: 'Fri', revenue: 0 },
        { name: 'Sat', revenue: 0 },
        { name: 'Sun', revenue: 0 },
    ];

    return (
        <Paper withBorder p="md" radius="xl" h={400}>
            <Title order={4} mb="lg">{t('dashboard.revenue_analytics')}</Title>

            <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4361EE" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4361EE', strokeWidth: 1 }} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4361EE"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Paper>
    );
}
