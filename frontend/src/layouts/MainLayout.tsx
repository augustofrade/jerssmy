import { Bolt, MoonStar, Plus, Sun } from 'lucide-preact';
import { ComponentChildren, Fragment, FunctionComponent, h } from 'preact';
import { Link, Match } from 'preact-router/match';
import { useEffect, useState } from 'preact/hooks';
import { feed } from '../../wailsjs/go/models';
import { FeedCreateModal } from '../components/FeedCreateModal';
import { Theme, useTheme } from '../contexts/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();

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

    <div className="columns is-gapless m-0 app-shell">
      <aside className="column is-one-quarter has-background" style={{ height: "100%" }}>
        <div className="columns px-2 py-3">
          <div className="column is-align-content-center is-narrow">
            <NavButton theme={theme}>
              <Bolt className="icon-small" />
            </NavButton>
          </div>
          <div className="column is-align-content-center p-0">
            <NavButton
              className="is-primary is-fullwidth"
              lightClassName="is-light"
              theme={theme}
              onClick={modal.openModal}
            >
              <Plus className="icon-small" />
              Add Feed
            </NavButton>
          </div>
          <div className="column is-align-content-center is-narrow">
            <NavButton theme={theme} onClick={toggleTheme}>
              {
                theme === "light"
                ? <Sun className="icon-small" />
                : <MoonStar className="icon-small" />
              }
            </NavButton>
          </div>
        </div>
        <div className="menu px-2">
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
            Feeds
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
      <main className="column is-flex app-main-column">
        {props.children}
      </main>
    </div>
    </>
  )
}

interface NavButtonProps {
  theme: Theme;
  children: preact.ComponentChildren;
  className?: string;
  lightClassName?: string;
  onClick?: () => void;
}

function NavButton({ theme, children, onClick, className, lightClassName }: NavButtonProps) {

  return (
    <button
      className={`button is-small ${theme === 'light' ? lightClassName ?? 'is-white' : 'is-dark'} ${className ?? ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}