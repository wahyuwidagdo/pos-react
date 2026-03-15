import React from 'react';
import { Center, Stack, Text, Button, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Center h="100vh" bg="gray.0">
                    <Stack align="center" gap="lg">
                        <ThemeIcon size={80} radius="xl" color="red" variant="light">
                            <IconAlertTriangle size={40} />
                        </ThemeIcon>
                        <Text size="xl" fw={700}>Something went wrong</Text>
                        <Text c="dimmed" size="sm" maw={400} ta="center">
                            An unexpected error occurred. Please try refreshing the page.
                        </Text>
                        <Button onClick={this.handleReset} variant="light" color="blue" size="md">
                            Go to Home
                        </Button>
                    </Stack>
                </Center>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
