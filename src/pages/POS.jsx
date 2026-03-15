import { useState, useCallback } from 'react';
import { Title, Grid, Drawer, Button, ScrollArea, Text, Transition, Paper, Group } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import ProductGrid from '../components/pos/ProductGrid';
import CartSidebar from '../components/pos/CartSidebar';
import CheckoutModal from '../components/pos/CheckoutModal';
import { IconShoppingCart, IconBarcode } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import useCartStore from '../store/useCartStore';
import useBarcodeScanner from '../hooks/useBarcodeScanner';
import api from '../api/axios';

export default function POS() {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const [checkoutOpened, { open: openCheckout, close: closeCheckout }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { addToCart, getItemCount, getTotal } = useCartStore();
    const cartCount = getItemCount();
    const [scannerActive, setScannerActive] = useState(true);
    const [lastScanned, setLastScanned] = useState(null);

    const handleBarcodeScan = useCallback(async (sku) => {
        try {
            // Search for the product by SKU
            const { data } = await api.get('/products', { params: { search: sku, pageSize: 5 } });
            const products = data?.data || [];

            // Find exact SKU match
            const product = products.find(p =>
                p.sku?.toLowerCase() === sku.toLowerCase()
            );

            if (product) {
                if (product.stock <= 0) {
                    notifications.show({
                        title: t('pos.out_of_stock', 'Out of Stock'),
                        message: `${product.name}`,
                        color: 'orange',
                    });
                    return;
                }
                addToCart(product);
                setLastScanned(product.name);
                setTimeout(() => setLastScanned(null), 2500);

                notifications.show({
                    title: t('barcode.scanned', 'Barcode Scanned'),
                    message: `${product.name} → ${t('pos.add_to_cart', 'Added to cart')}`,
                    color: 'teal',
                    icon: <IconBarcode size={16} />,
                    autoClose: 2000,
                });
            } else {
                notifications.show({
                    title: t('barcode.not_found', 'Product Not Found'),
                    message: `${t('barcode.sku_not_found', 'No product with SKU')}: ${sku}`,
                    color: 'red',
                });
            }
        } catch {
            notifications.show({
                title: t('common.error', 'Error'),
                message: t('barcode.scan_error', 'Failed to look up barcode'),
                color: 'red',
            });
        }
    }, [addToCart, t]);

    useBarcodeScanner({
        onScan: handleBarcodeScan,
        enabled: scannerActive && !checkoutOpened,
    });

    const handleCheckout = () => {
        openCheckout();
        close();
    };

    return (
        <div style={{ minHeight: 'calc(100dvh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <Title order={2} fw={800} c="kala-lilac.9">{t('pos.title')}</Title>
                    {/* Scanner status indicator */}
                    <Group gap={6} mt={2}>
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: scannerActive ? '#20C997' : '#868E96',
                                boxShadow: scannerActive ? '0 0 6px rgba(32, 201, 151, 0.5)' : 'none',
                                transition: 'all 0.3s ease',
                            }}
                        />
                        <Text size="xs" c="dimmed">
                            {scannerActive
                                ? t('barcode.scanner_active', 'Scanner Active')
                                : t('barcode.scanner_inactive', 'Scanner Paused')
                            }
                        </Text>
                    </Group>
                </div>

                <Group gap="sm">
                    {isMobile && (
                        <Button
                            onClick={open}
                            leftSection={<IconShoppingCart size={18} />}
                            color="kala-lilac"
                        >
                            {t('pos.cart')} ({cartCount})
                        </Button>
                    )}
                </Group>
            </div>

            {/* Last scanned product notification bar */}
            <Transition mounted={!!lastScanned} transition="slide-down" duration={300}>
                {(styles) => (
                    <Paper
                        style={{
                            ...styles,
                            marginBottom: '0.75rem',
                            background: 'linear-gradient(135deg, rgba(147, 117, 250, 0.08), rgba(32, 201, 151, 0.08))',
                            border: '1px solid rgba(147, 117, 250, 0.15)',
                        }}
                        p="xs"
                        radius="md"
                    >
                        <Group gap="xs" justify="center">
                            <IconBarcode size={16} style={{ color: '#9775FA' }} />
                            <Text size="sm" fw={500}>
                                <Text span c="dimmed">{t('barcode.scanned', 'Scanned')}:</Text>{' '}
                                <Text span fw={700}>{lastScanned}</Text>
                            </Text>
                        </Group>
                    </Paper>
                )}
            </Transition>

            <Grid gutter="lg" style={{ flex: 1, overflow: 'hidden' }}>
                <Grid.Col span={{ base: 12, md: 8 }} style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <ScrollArea style={{ flex: 1 }}>
                        <ProductGrid />
                    </ScrollArea>
                </Grid.Col>

                {!isMobile && (
                    <Grid.Col span={{ md: 4 }} style={{ height: '100%' }}>
                        <CartSidebar onCheckout={handleCheckout} />
                    </Grid.Col>
                )}
            </Grid>

            <Drawer
                opened={opened}
                onClose={close}
                title={t('pos.cart')}
                position="right"
                size="90%"
            >
                <CartSidebar onCheckout={handleCheckout} />
            </Drawer>

            <CheckoutModal
                opened={checkoutOpened}
                onClose={closeCheckout}
                total={getTotal()}
            />
        </div>
    );
}
