import { Newspaper } from 'lucide-preact';
import { Fragment, h } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { feed } from '../../wailsjs/go/models';
import { FeedArticleDetailsModal } from '../components/FeedArticleDetailsModal';
import { NotificationToast } from '../components/NotificationToast';
import { useModal } from '../hooks/useModal';
import { useNotification } from '../hooks/useNotification';
import { FeedService } from '../services/FeedService';

type FeedPageProps = {
  path?: string;
  id?: string;
};

export function FeedPage(props: FeedPageProps) {
  const [feedInfo, setFeedInfo] = useState<feed.Feed | null>(null);
  const [articles, setArticles] = useState<feed.FeedArticleListItemDto[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<feed.FeedArticleListItemDto | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const notifications = useNotification();
  const articleModal = useModal({
    onCancel: () => setSelectedArticle(null)
  });

  function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  async function fetchRemoteArticles(id: number) {
    setIsFetchingRemote(true);

    try {
      const articles = await FeedService.FetchRemoteArticlesOfFeed(id);
      setArticleList(articles);
      notifications.close();
    } catch (error) {
      notifications.danger(`Failed to fetch remote articles: ${getErrorMessage(error)}`);
    } finally {
      setIsFetchingRemote(false);
    }
  }

  async function getAllArticles(id: number) {
    const f = await FeedService.GetFeedById(id);
    setFeedInfo(f);

    const storedArticles = await FeedService.GetStoredArticlesOfFeed(f.Id);
    setArticleList(storedArticles);

    await fetchRemoteArticles(f.Id);
  }

  async function handlePageInit() {
    const id = Number(props.id);
    if(isNaN(id) || id <= 0) {
      route('/');
      return;
    }
    await getAllArticles(id);
  }

  async function handleArticleClick(article: feed.FeedArticleListItemDto) {
    setSelectedArticle(article);
    articleModal.openModal();

    if(article.Read) return;

    article.Read = true;
    article.IsNew = false;

    await FeedService.MarkArticleAsRead(article.Url);

    setArticles(curr => [...curr]);
  }

  function setArticleList(articles: feed.FeedArticleListItemDto[]) {
    setArticles(curr =>
      [...curr, ...articles].sort((a, b) => 
        new Date(b.PublicationDate).getTime() - new Date(a.PublicationDate).getTime())
    );
  }

  function closeArticleModal() {
    setSelectedArticle(null);
    articleModal.closeModal();
  }

  useEffect(() => {
    setFeedInfo(null);
    setArticles([]);
    setSelectedArticle(null);

    handlePageInit();

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeArticleModal();
      }
    };
    document.body.addEventListener('keyup', handleKeyUp);

    return () => {
      document.body.removeEventListener('keyup', handleKeyUp);
    };

  }, [props.id]);

  return (
    <div class="feed-page is-flex is-flex-direction-column">
      <FeedArticleDetailsModal
		article={selectedArticle}
		isOpen={articleModal.isOpen}
		onCancel={closeArticleModal}
	  />
      <NotificationToast
        notification={notifications.notification}
        onClose={notifications.close}
      />
      <nav class="navbar px-5 py-3 is-flex-direction-row is-align-items-center" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <span class={`navbar-item has-text-weight-semibold ${feedInfo ? '' : 'is-skeleton'}`}>
            {feedInfo?.Title ?? 'Feed Title'}
          </span>
        </div>
        <div class="navbar-menu is-active">
          <div class="navbar-end">
            <div class="navbar-item">
              <button class="button is-light"
                onClick={() => feedInfo && fetchRemoteArticles(feedInfo.Id)}
                disabled={isFetchingRemote}
              >
                {isFetchingRemote ? 'Fetching...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section class="panel feed-page__articles is-flex-grow-1">
        {articles.map(article => (
          <a class="panel-block" key={article.Url} onClick={() => handleArticleClick(article)}>
            <span className="panel-icon">
              {!article.Read && <span className="button is-primary" style={{ padding: 0, width: "12px", height: "12px"  }} />}
            </span>
            <div class="feed-page__article-content">
              <span class="feed-page__article-content-label">
                <p class={`text-ellipsis-95 ${article.Read ? '' : 'has-text-weight-semibold'}`}>
                  {article.Title}
                </p>
              </span>
              <p class="is-size-7">{new Date(article.PublicationDate).toLocaleString()}</p>
            </div>
            { article.IsNew && <span class="tag is-link is-light">New</span> }
          </a>
        ))}
      </section>
    </div>
  )
}