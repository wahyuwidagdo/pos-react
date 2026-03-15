import { useState, useEffect } from 'react';
import {
    Modal,
    Group,
    Stack,
    Text,
    Button,
    Paper,
    Select,
    NumberInput,
    SimpleGrid,
    ActionIcon,
    Tooltip,
    Divider,
    Center,
    Skeleton,
} from '@mantine/core';
import { IconPrinter, IconDownload, IconCopy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../lib/formatter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

function useBarcodeImage(productId, barcodeType) {
    const [dataUrl, setDataUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        setDataUrl(null);

        const token = localStorage.getItem('token');
        const url = `${API_BASE}/barcode/${productId}?type=${barcodeType}&width=400&height=120`;

        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (!res.ok) throw new Error('Failed');
                return res.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setDataUrl(reader.result);
                    setLoading(false);
                };
                reader.readAsDataURL(blob);
            })
            .catch(() => {
                setDataUrl(null);
                setLoading(false);
            });
    }, [productId, barcodeType]);

    return { dataUrl, loading };
}

export default function BarcodeModal({ opened, onClose, product }) {
    const { t } = useTranslation();
    const [barcodeType, setBarcodeType] = useState('code128');
    const [copies, setCopies] = useState(1);
    const [printing, setPrinting] = useState(false);

    const { dataUrl, loading: barcodeLoading } = useBarcodeImage(
        opened ? (product?.barcode || product?.sku) : null,
        barcodeType
    );

    if (!product) return null;

    const token = localStorage.getItem('token');
    const identifier = product.barcode || product.sku;
    const barcodeUrl = `${API_BASE}/barcode/${identifier}?type=${barcodeType}&width=400&height=120`;

    const handlePrint = () => {
        if (!dataUrl) return;
        setPrinting(true);

        const labels = Array(copies).fill(null).map(() => `
            <div style="
                display: inline-block;
                text-align: center;
                padding: 8px 12px;
                margin: 4px;
                border: 1px dashed #ccc;
                border-radius: 8px;
                width: 280px;
                page-break-inside: avoid;
            ">
                <div style="font-size: 11px; font-weight: 700; margin-bottom: 4px; color: #333;">
                    ${product.name}
                </div>
                <img src="${dataUrl}" style="width: 240px; height: 70px; display: block; margin: 0 auto;" />
                <div style="font-size: 10px; color: #666; margin-top: 4px;">
                    SKU: ${product.sku}
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #000; margin-top: 2px;">
                    Rp ${new Intl.NumberFormat('id-ID').format(product.price)}
                </div>
            </div>
        `).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Barcode - ${product.name}</title>
                <style>
                    body {
                        font-family: 'Inter', 'Segoe UI', sans-serif;
                        margin: 20px;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: flex-start;
                    }
                    @media print {
                        body { margin: 10px; }
                    }
                </style>
            </head>
            <body>${labels}</body>
            </html>
        `);
        printWindow.document.close();

        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                setPrinting(false);
            }, 300);
        };
    };

    const handleDownload = () => {
        fetch(barcodeUrl, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `barcode_${product.sku}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
    };

    const handleCopySKU = () => {
        navigator.clipboard.writeText(product.sku);
        notifications.show({
            message: t('barcode.sku_copied', 'SKU copied to clipboard'),
            color: 'green',
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Text fw={700} size="lg">
                    {t('barcode.title', 'Barcode Generator')}
                </Text>
            }
            size="md"
            radius="lg"
            centered
        >
            <Stack gap="md">
                {/* Product Info */}
                <Paper
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                        background: 'var(--mantine-color-kala-lilac-0)',
                    }}
                >
                    <Group justify="space-between" wrap="wrap">
                        <div>
                            <Text fw={600} size="sm">{product.name}</Text>
                            <Group gap={6} mt={2}>
                                <Text size="xs" c="dimmed">SKU:</Text>
                                <Text size="xs" fw={600} ff="monospace">{product.sku || '—'}</Text>
                                {product.sku && (
                                    <Tooltip label={t('barcode.copy_sku', 'Copy SKU')}>
                                        <ActionIcon size="xs" variant="subtle" onClick={handleCopySKU}>
                                            <IconCopy size={12} />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </Group>
                        </div>
                        <Text fw={700} size="md" c="kala-lilac.7">
                            {formatCurrency(product.price)}
                        </Text>
                    </Group>
                </Paper>

                {/* Barcode Preview */}
                <Center>
                    <Paper
                        p="lg"
                        radius="md"
                        withBorder
                        style={{
                            background: '#fff',
                            textAlign: 'center',
                            minWidth: 280,
                            minHeight: 120,
                        }}
                    >
                        {!product.barcode && !product.sku ? (
                            <Text c="dimmed" size="sm">
                                {t('barcode.no_code', 'Product has no Barcode or SKU')}
                            </Text>
                        ) : barcodeLoading ? (
                            <Skeleton height={100} width={280} />
                        ) : dataUrl ? (
                            <>
                                <img
                                    src={dataUrl}
                                    alt={`Barcode for ${product.barcode || product.sku}`}
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                                <Text size="xs" c="dimmed" mt="xs" ff="monospace">
                                    {product.barcode || product.sku}
                                </Text>
                            </>
                        ) : (
                            <Text c="red" size="sm">
                                {t('barcode.generation_failed', 'Failed to generate barcode')}
                            </Text>
                        )}
                    </Paper>
                </Center>

                <Divider />

                {/* Settings */}
                <SimpleGrid cols={2} spacing="sm">
                    <Select
                        label={t('barcode.type', 'Barcode Type')}
                        value={barcodeType}
                        onChange={setBarcodeType}
                        data={[
                            { value: 'code128', label: 'Code 128' },
                            { value: 'ean13', label: 'EAN-13' },
                        ]}
                        size="sm"
                    />
                    <NumberInput
                        label={t('barcode.copies', 'Copies')}
                        value={copies}
                        onChange={setCopies}
                        min={1}
                        max={100}
                        size="sm"
                    />
                </SimpleGrid>

                {/* Actions */}
                <Group grow>
                    <Button
                        variant="light"
                        leftSection={<IconDownload size={16} />}
                        onClick={handleDownload}
                        disabled={!product.sku}
                    >
                        {t('barcode.download', 'Download')}
                    </Button>
                    <Button
                        leftSection={<IconPrinter size={16} />}
                        onClick={handlePrint}
                        loading={printing}
                        disabled={!product.sku || !dataUrl}
                    >
                        {t('barcode.print', 'Print Labels')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
