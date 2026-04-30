import { useState } from 'react';
import {
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Container,
    Anchor,
    LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/services';

export default function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        initialValues: {
            username: '',
            full_name: '',
            password: '',
            confirmPassword: '',
        },
        validate: {
            username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
            full_name: (value) => (value.length < 2 ? 'Full name is required' : null),
            password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
            confirmPassword: (value, values) =>
                value !== values.password ? 'Passwords do not match' : null,
        },
    });

    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            await authService.register({
                username: values.username,
                password: values.password,
                full_name: values.full_name,
            });
            notifications.show({
                title: t('common.success'),
                message: t('auth.register_success'),
                color: 'green',
            });
            navigate('/login');
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: error.response?.data?.error || t('auth.register_failed'),
                color: 'red',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container size={420} my={40} px="md">
            <Title ta="center" fw={900}>
                KALA
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Timeless & Simple POS System
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
                <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                <Title order={3} ta="center" mb="md">
                    {t('auth.register')}
                </Title>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label={t('auth.username')}
                        placeholder="Your username"
                        required
                        {...form.getInputProps('username')}
                    />
                    <TextInput
                        label={t('auth.full_name')}
                        placeholder="Your full name"
                        required
                        mt="md"
                        {...form.getInputProps('full_name')}
                    />
                    <PasswordInput
                        label={t('auth.password')}
                        placeholder="Your password"
                        required
                        mt="md"
                        {...form.getInputProps('password')}
                    />
                    <PasswordInput
                        label={t('auth.confirm_password')}
                        placeholder="Confirm password"
                        required
                        mt="md"
                        {...form.getInputProps('confirmPassword')}
                    />

                    <Button fullWidth mt="xl" type="submit" loading={isLoading}>
                        {t('auth.sign_up')}
                    </Button>
                </form>

                <Text c="dimmed" size="sm" ta="center" mt="md">
                    {t('auth.have_account')}{' '}
                    <Anchor component={Link} to="/login" size="sm">
                        {t('auth.login')}
                    </Anchor>
                </Text>
            </Paper>
        </Container>
    );
}
