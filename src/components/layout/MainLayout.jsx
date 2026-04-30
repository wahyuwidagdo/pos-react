import {
    AppShell,
    Burger,
    Group,
    Title,
    Avatar,
    Menu,
    UnstyledButton,
    Text,
    rem,
    Tooltip,
    useMantineColorScheme,
    Modal,
    Button
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
    IconLayoutDashboard,
    IconShoppingCart,
    IconBox,
    IconCategory,
    IconReportMoney,
    IconSettings,
    IconLogout,
    IconSun,
    IconMoon,
    IconLanguage,
    IconSearch,
    IconPackages,
    IconCashBanknote,
    IconHistory
} from '@tabler/icons-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { productService, categoryService } from '../../api/services';import { useTranslation } from 'react-i18next';
import classes from './MainLayout.module.css';
import NotificationCenter from './NotificationCenter';
import useStockAlerts from '../../hooks/useStockAlerts';

export default function MainLayout() {
    const [opened, { toggle }] = useDisclosure();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAdminOrManager } = useAuthStore();
    const isMobile = useMediaQuery('(max-width: 48em)');

    // Logout Modal
    const [logoutOpened, { open: openLogout, close: closeLogout }] = useDisclosure(false);

    // Stock alert notifications
    useStockAlerts();

    const handleLogoutClick = () => {
        openLogout();
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'id' : 'en';
        i18n.changeLanguage(newLang);
    };

    const userRole = user?.role?.toLowerCase() || '';

    // Fetch counts for sidebar badges
    const { data: productData } = useQuery({
        queryKey: ['products-count'],
        queryFn: async () => {
            const res = await productService.getAll({ page: 1, pageSize: 1 });
            return res;
        },
        enabled: ['admin', 'manager'].includes(userRole),
        staleTime: 30000,
    });

    const { data: categoryData } = useQuery({
        queryKey: ['categories-count'],
        queryFn: async () => {
            const res = await categoryService.getAll();
            const data = res.data || res;
            return Array.isArray(data) ? data.length : 0;
        },
        enabled: ['admin', 'manager'].includes(userRole),
        staleTime: 30000,
    });

    const productCount = productData?.total_items || 0;
    const categoryCount = typeof categoryData === 'number' ? categoryData : (Array.isArray(categoryData) ? categoryData.length : 0);

    // Nav sections with grouped items
    const navSections = [
        {
            label: t('nav.menu', 'Menu'),
            items: [
                { label: t('nav.dashboard'), icon: IconLayoutDashboard, path: '/', roles: ['admin', 'manager'] },
                { label: t('nav.pos'), icon: IconShoppingCart, path: '/pos', roles: ['admin', 'manager', 'cashier', 'kasir'] },
            ]
        },
        {
            label: t('nav.management_product', 'Manajemen Produk'),
            items: [
                { label: t('nav.products'), icon: IconBox, path: '/products', roles: ['admin', 'manager'], badge: productCount },
                { label: t('nav.categories'), icon: IconCategory, path: '/categories', roles: ['admin', 'manager'], badge: categoryCount },
                { label: t('nav.management_inventory', 'Manajemen Inventaris'), icon: IconPackages, path: '/inventory', roles: ['admin', 'manager'] },
            ]
        },
        {
            label: t('nav.financial_management', 'Manajemen Keuangan'),
            items: [
                { label: t('nav.transactions', 'Riwayat Transaksi'), icon: IconHistory, path: '/transactions', roles: ['admin', 'manager'] },
                { label: t('nav.cash_flow'), icon: IconCashBanknote, path: '/cash-flow', roles: ['admin', 'manager'] },
                { label: t('nav.reports'), icon: IconReportMoney, path: '/reports', roles: ['admin', 'manager'] },
            ]
        },
        {
            label: t('nav.preferences', 'Pengaturan'),
            items: [
                { label: t('nav.settings'), icon: IconSettings, path: '/settings', roles: ['admin', 'manager', 'cashier', 'kasir'] },
            ]
        }
    ];

    // Filter sections based on role
    const filteredSections = navSections
        .map(section => ({
            ...section,
            items: section.items.filter(item => item.roles.some(r => r === userRole))
        }))
        .filter(section => section.items.length > 0);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 260,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            {/* Header — minimal with search and burger only */}
            <AppShell.Header className={classes.header}>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

                        {/* Logo moved to Header */}
                        <Group gap="xs" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => navigate('/')}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                background: 'var(--mantine-color-kala-lilac-6)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 900
                            }}>
                                K
                            </div>
                            <div>
                                <Title order={4} lh={1.1} c="kala-lilac.6" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    KALA
                                </Title>
                                <Text size={10} c="dimmed" lh={1.1} fw={500}>
                                    POS v1.0
                                </Text>
                            </div>
                        </Group>
                    </Group>

                    <Group gap="xs">
                        {/* Notification Bell */}
                        <NotificationCenter />
                    </Group>
                </Group>
            </AppShell.Header>

            {/* Premium Dark Sidebar */}
            <AppShell.Navbar className={classes.sidebar}>
                {/* Logo Section Removed (Moved to Header) */}
                <div style={{ height: 20 }} />

                {/* Navigation Sections */}
                <div className={classes.navArea}>
                    {filteredSections.map((section, sIdx) => (
                        <div key={section.label}>
                            {sIdx > 0 && <div className={classes.sectionDivider} />}
                            <div className={classes.sectionHeader}>{section.label}</div>
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Tooltip
                                        key={item.path}
                                        label={item.label}
                                        position="right"
                                        disabled={true}
                                        withArrow
                                    >
                                        <div
                                            className={`${classes.navItem} ${isActive ? classes.navItemActive : ''}`}
                                            onClick={() => {
                                                navigate(item.path);
                                                if (opened) toggle();
                                            }}
                                        >
                                            <item.icon className={classes.navIcon} stroke={1.5} />
                                            <span className={classes.navLabel}>{item.label}</span>
                                            {item.badge ? (
                                                <span className={classes.navBadge}>{item.badge}</span>
                                            ) : null}
                                        </div>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className={classes.bottomSection}>
                    {/* Theme & Language Controls */}
                    <div className={classes.controls}>
                        <div className={classes.controlBtn} onClick={() => toggleColorScheme()}>
                            {colorScheme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
                            <span>{colorScheme === 'dark' ? 'Light' : 'Dark'}</span>
                        </div>
                        <div className={classes.controlBtn} onClick={toggleLanguage}>
                            <IconLanguage size={14} />
                            <span>{i18n.language === 'en' ? 'ID' : 'EN'}</span>
                        </div>
                    </div>

                    {/* User Profile Card */}
                    <Menu shadow="md" width={200} position="top-start">
                        <Menu.Target>
                            <div className={classes.userCard}>
                                <Avatar
                                    className={classes.userAvatar}
                                    radius="xl"
                                    size="sm"
                                    color="kala-lilac"
                                    name={user?.username}
                                    style={{
                                        border: '2px solid rgba(147, 117, 250, 0.3)',
                                    }}
                                />
                                <div className={classes.userInfo}>
                                    <div className={classes.userName}>
                                        {user?.full_name || user?.username || 'User'}
                                    </div>
                                    <div className={classes.userRole}>
                                        {user?.role || 'Staff'}
                                    </div>
                                </div>
                                <div className={classes.logoutBtn} onClick={(e) => { e.stopPropagation(); handleLogoutClick(); }}>
                                    <IconLogout size={16} stroke={1.5} />
                                </div>
                            </div>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>{t('nav.application', 'Application')}</Menu.Label>
                            <Menu.Item
                                leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                                onClick={() => navigate('/settings')}
                            >
                                {t('nav.settings')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                                onClick={handleLogoutClick}
                            >
                                {t('nav.logout')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </AppShell.Navbar>

            <AppShell.Main bg={colorScheme === 'dark' ? 'dark.8' : 'kala-lilac.0'}>
                <Outlet />
            </AppShell.Main>

            <Modal
                opened={logoutOpened}
                onClose={closeLogout}
                title={t('nav.logout_confirm_title', 'Konfirmasi Keluar')}
                centered
            >
                <Text size="sm" mb="xl">
                    {t('nav.logout_confirm_message', 'Apakah Anda yakin ingin keluar dari aplikasi?')}
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeLogout}>
                        {t('common.cancel', 'Batal')}
                    </Button>
                    <Button color="red" onClick={confirmLogout}>
                        {t('nav.logout', 'Keluar')}
                    </Button>
                </Group>
            </Modal>
        </AppShell>
    );
}
