import { useRef, useState } from 'react';
import {
    SimpleGrid,
    Card,
    Text,
    Badge,
    Group,
    Button,
    Loader,
    Center,
    Input
} from '@mantine/core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useIntersection, useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconShoppingCartPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatCurrency } from '../../lib/formatter';
import useCartStore from '../../store/useCartStore';
import { notifications } from '@mantine/notifications';

const fetchProducts = async ({ pageParam = 1, searchQuery = '' }) => {
    const params = {
        page: pageParam,
        pageSize: 12,
    };
    if (searchQuery) {
        params.search = searchQuery;
    }
    const { data } = await api.get('/products', { params });
    return data;
};

export default function ProductGrid() {
    const { t } = useTranslation();
    const { addToCart } = useCartStore();
    const lastElementRef = useRef(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 500);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteQuery({
        queryKey: ['products', debouncedSearch],
        queryFn: ({ pageParam = 1 }) => fetchProducts({ pageParam, searchQuery: debouncedSearch }),
        getNextPageParam: (lastPage, allPages) => {
            // If we have less items than requested, we are done
            if (lastPage.data.length < 12) return undefined;
            return allPages.length + 1;
        },
    });

    const { ref, entry } = useIntersection({
        root: null,
        threshold: 1,
    });

    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
    }

    const handleAddToCart = (product) => {
        addToCart(product);
        notifications.show({
            title: t('pos.add_to_cart'),
            message: `${product.name}`,
            color: 'teal',
            icon: <IconShoppingCartPlus size="1rem" />,
            autoClose: 2000,
        });
    };

    return (
        <div>
            <Input
                placeholder={t('pos.search_products')}
                leftSection={<IconSearch size={16} />}
                mb="md"
                size="md"
                radius="xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {isLoading ? (
                <Center h={200}>
                    <Loader size="lg" />
                </Center>
            ) : isError ? (
                <Center h={200}>
                    <Text c="red">{t('common.error')}</Text>
                </Center>
            ) : (
                <>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 3, lg: 4 }} spacing="md">
                        {data.pages.map((page, i) => (
                            page.data.map((product) => (
                                <Card
                                    key={product.id}
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                    withBorder
                                >

                                    <Group justify="space-between" mt="md" mb="xs">
                                        <Text fw={600} truncate w="100%">{product.name}</Text>
                                    </Group>

                                    <Group justify="space-between" align="center">
                                        <Text fw={700} c="kala-lilac" size="lg">
                                            {formatCurrency(product.price)}
                                        </Text>
                                        {product.stock <= 5 && (
                                            <Badge color="red" variant="light" size="sm">
                                                {product.stock} left
                                            </Badge>
                                        )}
                                    </Group>

                                    <Text size="sm" c="dimmed" mt="xs" lineClamp={1}>
                                        SKU: {product.sku}
                                    </Text>

                                    <Button
                                        variant="light"
                                        color="kala-lilac"
                                        fullWidth
                                        mt="md"
                                        radius="md"
                                        leftSection={<IconShoppingCartPlus size={16} />}
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock === 0 ? t('pos.out_of_stock') : t('pos.add_to_cart')}
                                    </Button>
                                </Card>
                            ))
                        ))}
                    </SimpleGrid>

                    <div ref={ref} style={{ height: '20px', marginTop: '20px' }}>
                        {isFetchingNextPage && <Center><Loader size="sm" /></Center>}
                    </div>
                </>
            )}
        </div>
    );
}
