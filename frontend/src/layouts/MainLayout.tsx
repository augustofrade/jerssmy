import { ComponentChildren, Fragment, FunctionComponent, h } from 'preact';
import { Link, Match } from 'preact-router/match';
import { useEffect, useState } from 'preact/hooks';
import { feed } from '../../wailsjs/go/models';
import { FeedCreateModal } from '../components/FeedCreateModal';
import { useModal } from '../hooks/useModal';
import { FeedService } from '../services/FeedService';

type MatchLinkProps = {
  href: string;
  className?: string;
  activeClassName?: string;
  children?: ComponentChildren;
};

const MatchLink = Link as unknown as FunctionComponent<MatchLinkProps>;

export function MainLayout(props: any) {
  const [feeds, setFeeds] = useState<feed.Feed[]>([]);

  useEffect(() => {
    let isCancelled = false;
    FeedService.ListFeeds().then(feeds => {
      if (!isCancelled) {
        setFeeds(feeds);
      }
    });
    return () => {
      isCancelled = true;
    }
  }, []);

  const modal = useModal({
    onCancel: () => {
      console.log("Add Feed cancelled");
    }
  });

  function handleCreateFeed(f: feed.Feed) {
    setFeeds(current => [...current, f]);
  }

  return (
    <>
    <FeedCreateModal
      isOpen={modal.isOpen}
      onCancel={modal.closeModal}
      onSubmit={handleCreateFeed}
    />

    <div className="columns is-gapless m-0" style={{ minHeight: '100vh' }}>
      <aside className="column is-one-quarter">
        <div className="menu p-5" style={{ backgroundColor: "#e1e1e1", height: "100%" }}>
          <p className="menu-label">General</p>
          <ul className="menu-list">
            <li>
              <Match>
                {({ url }: { url?: string }) => (
                  <MatchLink className={url === '/' ? 'is-active' : undefined} href="/">
                    Home
                  </MatchLink>
                )}
              </Match>
            </li>
          </ul>
          <div className="menu-label">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  Feeds
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button className="button is-primary is-light is-small" onClick={modal.openModal}>
                    Add Feed
                    </button>
                </div>
              </div>
            </div>
          </div>
          <ul className="menu-list">
            {feeds.map(f => (
              <li key={f.Id}>
                <MatchLink activeClassName="is-active" href={`/feeds/${f.Id}`}>
                  {f.Title}
                </MatchLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="column">
        {props.children}
      </main>
    </div>
    </>
  )
}