import { h } from 'preact';
import { NotificationState } from '../hooks/useNotification';

type NotificationToastProps = {
	notification: NotificationState;
	onClose: () => void;
};

export function NotificationToast(props: NotificationToastProps) {
	if (!props.notification) {
		return null;
	}

	return (
		<div className="notification-toast-container">
			<div className={`notification ${props.notification.tone}`} role="alert">
				<button className="delete" aria-label="close" onClick={props.onClose}></button>
				{props.notification.message}
			</div>
		</div>
	);
}