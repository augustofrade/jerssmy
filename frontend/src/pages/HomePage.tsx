import { Fragment, h } from 'preact';

type HomePageProps = {
	path?: string;
};

export function HomePage(props: HomePageProps) {
	return (
		<div class="content">
			<h1 class="title is-3">Home</h1>
			<p>Select a feed from the sidebar menu to get started.</p>
		</div>
	)
}
