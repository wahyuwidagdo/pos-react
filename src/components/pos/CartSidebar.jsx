import {
    Paper,
    Title,
    Text,
    Group,
    Button,
    ScrollArea,
    ActionIcon,
    Divider,
    Stack,
    Box
} from '@mantine/core';
import { IconTrash, IconMinus, IconPlus, IconShoppingCart } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import useCartStore from '../../store/useCartStore';
import { formatCurrency } from '../../lib/formatter';

export default function CartSidebar({ onCheckout }) {
    const { t } = useTranslation();
    const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore();
    const total = getTotal();

    const CartItem = ({ item }) => (
        <Paper withBorder p="sm" mb="sm" radius="md">
            <Group justify="space-between" align="flex-start" mb={5}>
                <div style={{ flex: 1 }}>
                    <Text fw={500} size="sm" lineClamp={1}>{item.name}</Text>
                    <Text c="dimmed" size="xs">{item.sku}</Text>
                </div>
                <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                >
                    <IconTrash size="1rem" />
                </ActionIcon>
            </Group>

            <Group justify="space-between" align="center">
                <Text fw={600} size="sm">{formatCurrency(item.price * item.quantity)}</Text>

                <Group gap={5}>
                    <ActionIcon
                        size="sm"
                        variant="default"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                        <IconMinus size="0.8rem" />
                    </ActionIcon>
                    <Text size="sm" w={20} ta="center">{item.quantity}</Text>
                    <ActionIcon
                        size="sm"
                        variant="default"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                        <IconPlus size="0.8rem" />
                    </ActionIcon>
                </Group>
            </Group>
        </Paper>
    );

    return (
        <Stack h="100%" justify="space-between">
            <Box style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Group justify="space-between" mb="md">
                    <Group gap="xs">
                        <IconShoppingCart size="1.2rem" />
                        <Title order={4}>{t('pos.current_order')}</Title>
                    </Group>
                    {items.length > 0 && (
                        <Button variant="subtle" color="red" size="xs" onClick={clearCart}>
                            {t('pos.clear')}
                        </Button>
                    )}
                </Group>

                <ScrollArea style={{ flex: 1 }} type="auto">
                    {items.length === 0 ? (
                        <Text c="dimmed" ta="center" mt="xl">{t('pos.cart_empty')}</Text>
                    ) : (
                        items.map((item) => <CartItem key={item.id} item={item} />)
                    )}
                </ScrollArea>
            </Box>

            <Paper withBorder p="md" radius="md" mt="md">
                <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">{t('pos.subtotal')}</Text>
                    <Text fw={600}>{formatCurrency(total)}</Text>
                </Group>
                <Group justify="space-between" mb="md">
                    <Text size="sm" c="dimmed">{t('pos.tax')} (0%)</Text>
                    <Text fw={600}>{formatCurrency(0)}</Text>
                </Group>
                <Divider mb="md" />
                <Group justify="space-between" mb="lg">
                    <Text size="lg" fw={700}>{t('pos.total')}</Text>
                    <Text size="xl" fw={800} c="kala-lilac">{formatCurrency(total)}</Text>
                </Group>

                <Button
                    fullWidth
                    size="lg"
                    color="kala-lilac"
                    radius="md"
                    disabled={items.length === 0}
                    onClick={onCheckout}
                >
                    {t('pos.checkout')}
                </Button>
            </Paper>
        </Stack>
    );
}
