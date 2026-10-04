import { Fragment, h } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { feed } from '../../wailsjs/go/models';
import { FeedService } from '../services/FeedService';

type FeedPageProps = {
  path?: string;
  id?: string;
};

export function FeedPage(props: FeedPageProps) {
  const [feedInfo, setFeedInfo] = useState<feed.Feed | null>(null);
  const [articles, setArticles] = useState<feed.FeedArticleListItemDto[]>([]);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);

  async function fetchRemoteArticles(id: number) {
    setIsFetchingRemote(true);
    const articles = await FeedService.FetchRemoteArticlesOfFeed(id);
    setNewArticles(articles);
    setIsFetchingRemote(false);
  }

  async function getAllArticles(id: number) {
    const f = await FeedService.GetFeedById(id);
    setFeedInfo(f);

    const storedArticles = await FeedService.GetStoredArticlesOfFeed(f.Id);
    setNewArticles(storedArticles);

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

  function setNewArticles(articles: feed.FeedArticleListItemDto[]) {
    setArticles(curr => [...curr, ...articles]);//.sort((a, b) => b.PublicationDate - a.PublicationDate));
  }

  useEffect(() => {
    handlePageInit();
  }, []);

  return (
    <>
      <nav class="navbar px-5 py-3" role="navigation" aria-label="main navigation">
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
      <section class="panel">
        {articles.map(article => (
          <a class="panel-block" key={article.Url}>
            <div>
              <p class="has-text-weight-semibold">{article.Title}</p>
              <p class="is-size-7">{new Date(article.PublicationDate * 1000).toLocaleString()}</p>
            </div>
          </a>
        ))}
      </section>
    </>
  )
}