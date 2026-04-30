import { useState } from 'react';
import { Title, Grid, Skeleton, Box, Text, Paper, Select, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import StatsGrid from '../components/dashboard/StatsGrid';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import StockAlert from '../components/dashboard/StockAlert';
import PaymentMethodChart from '../components/dashboard/PaymentMethodChart';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import QuickActions from '../components/dashboard/QuickActions';
import { dashboardService } from '../api/services';
import { formatDate } from '../lib/formatter';

// Top Products Component
const TopProducts = ({ products, t }) => {
  return (
    <Paper withBorder p="md" radius="xl" h="100%">
      <Title order={4} mb="md">{t('dashboard.top_products')}</Title>
      {products && products.length > 0 ? (
        products.map((p, i) => (
          <Paper key={p.product_id || i} mb="sm" p="xs" radius="md" withBorder>
            <Text fw={500} size="sm">{p.product_name}</Text>
            <Text size="xs" c="dimmed">{p.quantity} {t('dashboard.sold')} | {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.revenue)}</Text>
          </Paper>
        ))
      ) : (
        <Text c="dimmed" size="sm">{t('common.no_data')}</Text>
      )}
    </Paper>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('today');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', dateRange],
    queryFn: async () => {
      const res = await dashboardService.getDashboard({ range: dateRange });
      return res.data;
    },
  });

  const rangeOptions = [
    { value: 'today', label: t('dashboard.today') },
    { value: 'this_week', label: t('dashboard.this_week') },
    { value: 'this_month', label: t('dashboard.this_month') },
    { value: 'this_year', label: t('dashboard.this_year') },
  ];

  return (
    <div>
      <Group justify="space-between" align="flex-end" mb="lg">
        <Box>
          <Title order={2} fw={800} c="kala-lilac.9">{t('dashboard.title')}</Title>
          <Text c="dimmed">{t('dashboard.greeting')}, {t('dashboard.report_for')} {formatDate(new Date())}</Text>
        </Box>
        <Select
          label={t('dashboard.date_range')}
          data={rangeOptions}
          value={dateRange}
          onChange={setDateRange}
          w={200}
          size="sm"
        />
      </Group>

      <Box mb="lg">
        <QuickActions />
      </Box>

      <StatsGrid data={data} loading={isLoading} />

      <Grid mt="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <RevenueChart data={data?.revenue_trend || []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <TopProducts products={data?.top_products} t={t} />
        </Grid.Col>
      </Grid>

      <Grid mt="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <RecentTransactions transactions={data?.recent_transactions || []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StockAlert products={data?.low_stock_products || []} />
        </Grid.Col>
      </Grid>

      <Grid mt="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <PaymentMethodChart data={data?.payment_method_breakdown || []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <CashFlowChart data={data?.cash_flow_breakdown} />
        </Grid.Col>
      </Grid>
    </div>
  );
}