import { useEffect, useRef, useState } from 'preact/hooks';

export type NotificationTone = 'is-info' | 'is-danger' | 'is-warning' | 'is-success';

export type NotificationState = {
	message: string;
	tone: NotificationTone;
} | null;

const NOTIFICATION_TIMEOUT_MS = 5000;

export function useNotification() {
	const [notification, setNotification] = useState<NotificationState>(null);
	const timeoutRef = useRef<number | null>(null);

	function clearCloseTimeout() {
		if (timeoutRef.current != null) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}

	function show(message: string, tone: NotificationTone) {
		clearCloseTimeout();
		setNotification({ message, tone });
		timeoutRef.current = window.setTimeout(() => {
			setNotification(null);
			timeoutRef.current = null;
		}, NOTIFICATION_TIMEOUT_MS);
	}

	function close() {
		clearCloseTimeout();
		setNotification(null);
	}

	useEffect(() => close, []);

	return {
		notification,
		close,
		info: (message: string) => show(message, 'is-info'),
		danger: (message: string) => show(message, 'is-danger'),
		warning: (message: string) => show(message, 'is-warning'),
		success: (message: string) => show(message, 'is-success'),
	};
}