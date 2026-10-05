import { h } from 'preact';
import { feed } from '../../wailsjs/go/models';
import { Modal } from './Modal';

type FeedArticleDetailsModalProps = {
	article: feed.FeedArticleListItemDto | null;
	isOpen: boolean;
	onCancel: () => void;
};

function formatArticleMeta(article: feed.FeedArticleListItemDto) {
	const formattedDate = new Date(article.PublicationDate).toLocaleString();
	if (!article.Author) {
		return formattedDate;
	}

	return `By ${article.Author} on ${formattedDate}`;
}

export function FeedArticleDetailsModal(props: FeedArticleDetailsModalProps) {
	if (!props.article) {
		return null;
	}

	return (
		<Modal
			title={props.article.Title}
			isOpen={props.isOpen}
			onCancel={props.onCancel}
			showFooter={false}
			cardClassName="feed-article-modal-card"
			bodyClassName="feed-article-modal-body"
		>
			<div className="content">
				<h2 className="title is-4">{props.article.Title}</h2>
				<p className="is-size-7 has-text-grey">{formatArticleMeta(props.article)}</p>
				{props.article.Thumbnail && (
					<figure className="feed-article-modal-thumbnail image">
						<img src={props.article.Thumbnail} alt={props.article.Title} />
					</figure>
				)}
				<div dangerouslySetInnerHTML={{ __html: props.article.Content }} />
			</div>
		</Modal>
	);
}