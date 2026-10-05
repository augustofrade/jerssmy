import { h } from 'preact';
import { feed } from '../../wailsjs/go/models';
import { BrowserOpenURL } from '../../wailsjs/runtime/runtime';
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

  function handleContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const link = target?.closest('a');

    if (!link) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href) {
      return;
    }

    const url = new URL(href, window.location.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    BrowserOpenURL(url.toString());
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
			<div className="content feed-article-modal-content">
				<p className="is-size-6 has-text-weight-semibold has-text-grey">{formatArticleMeta(props.article)}</p>
				{props.article.Thumbnail && (
					<figure className="feed-article-modal-thumbnail image">
						<img src={props.article.Thumbnail} alt={props.article.Title} />
					</figure>
				)}
				<div
          className="feed-article-modal-rich-content"
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: props.article.Content }}
        />
			</div>
		</Modal>
	);
}