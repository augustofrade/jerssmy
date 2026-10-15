import { Fragment, h } from 'preact';
import Router from 'preact-router';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from "./layouts/MainLayout";
import { FeedPage } from "./pages/FeedPage";
import { HomePage } from "./pages/HomePage";

export function App(props: any) {
	return (
		<ThemeProvider>
			<MainLayout>
				<Router>
					<HomePage path="/" />
					<FeedPage path="/feeds/:id" />
				</Router>
			</MainLayout>
		</ThemeProvider>
	)
}
