import { Paper, Text, Group, SimpleGrid, UnstyledButton } from '@mantine/core';
import {
    IconShoppingCart,
    IconBox,
    IconReportMoney,
    IconCategory,
    IconArrowRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const actions = [
    {
        titleKey: 'dashboard.quick_new_transaction',
        descKey: 'dashboard.quick_new_transaction_desc',
        icon: IconShoppingCart,
        path: '/pos',
        gradient: 'linear-gradient(135deg, #9775FA 0%, #7C5CE7 100%)',
        iconBg: 'rgba(147, 117, 250, 0.12)',
    },
    {
        titleKey: 'dashboard.quick_add_product',
        descKey: 'dashboard.quick_add_product_desc',
        icon: IconBox,
        path: '/products',
        gradient: 'linear-gradient(135deg, #20C997 0%, #12B886 100%)',
        iconBg: 'rgba(32, 201, 151, 0.12)',
    },
    {
        titleKey: 'dashboard.quick_view_reports',
        descKey: 'dashboard.quick_view_reports_desc',
        icon: IconReportMoney,
        path: '/reports',
        gradient: 'linear-gradient(135deg, #339AF0 0%, #228BE6 100%)',
        iconBg: 'rgba(51, 154, 240, 0.12)',
    },
    {
        titleKey: 'dashboard.quick_manage_categories',
        descKey: 'dashboard.quick_manage_categories_desc',
        icon: IconCategory,
        path: '/categories',
        gradient: 'linear-gradient(135deg, #FF922B 0%, #FD7E14 100%)',
        iconBg: 'rgba(255, 146, 43, 0.12)',
    },
];

export default function QuickActions() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            {actions.map((action) => (
                <UnstyledButton
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    style={{ width: '100%' }}
                >
                    <Paper
                        p="md"
                        radius="lg"
                        withBorder
                        style={{
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(147, 117, 250, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Gradient accent line at top */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: action.gradient,
                                borderRadius: '3px 3px 0 0',
                            }}
                        />

                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Icon */}
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        background: action.iconBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '0.75rem',
                                    }}
                                >
                                    <action.icon
                                        size={20}
                                        stroke={1.5}
                                        style={{
                                            color: action.gradient.includes('#9775FA') ? '#9775FA' :
                                                action.gradient.includes('#20C997') ? '#20C997' :
                                                    action.gradient.includes('#339AF0') ? '#339AF0' : '#FF922B'
                                        }}
                                    />
                                </div>

                                <Text size="sm" fw={600} mb={4} lineClamp={1}>
                                    {t(action.titleKey)}
                                </Text>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                    {t(action.descKey)}
                                </Text>
                            </div>

                            <IconArrowRight
                                size={16}
                                stroke={1.5}
                                style={{
                                    color: 'var(--mantine-color-dimmed)',
                                    opacity: 0.5,
                                    flexShrink: 0,
                                    marginTop: 4,
                                }}
                            />
                        </Group>
                    </Paper>
                </UnstyledButton>
            ))}
        </SimpleGrid>
    );
}
