import {
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Container,
    Group,
    Anchor,
    LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
        },
        validate: {
            username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
            password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
        },
    });

    const handleSubmit = async (values) => {
        const success = await login(values.username, values.password);
        if (success) {
            notifications.show({
                title: t('common.success'),
                message: t('auth.login_success'),
                color: 'green',
            });
            navigate('/');
        } else {
            notifications.show({
                title: t('common.error'),
                message: t('auth.login_failed'),
                color: 'red',
            });
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

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label={t('auth.username')}
                        placeholder="Your username"
                        required
                        {...form.getInputProps('username')}
                    />
                    <PasswordInput
                        label={t('auth.password')}
                        placeholder="Your password"
                        required
                        mt="md"
                        {...form.getInputProps('password')}
                    />

                    <Button fullWidth mt="xl" type="submit" loading={isLoading}>
                        {t('auth.sign_in')}
                    </Button>
                </form>

                <Text c="dimmed" size="sm" ta="center" mt="md">
                    {t('auth.no_account')}{' '}
                    <Anchor component={Link} to="/register" size="sm">
                        {t('auth.register')}
                    </Anchor>
                </Text>
            </Paper>
        </Container>
    );
}
