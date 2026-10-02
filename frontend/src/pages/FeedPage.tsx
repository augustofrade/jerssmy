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

  useEffect(() => {
    const id = Number(props.id);
    if(isNaN(id) || id <= 0) {
        route('/');
        return;
      }
    
    FeedService.GetFeedById(id).then(f => setFeedInfo(f));
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
              <button class="button is-light">Refresh</button>
            </div>
          </div>
        </div>
      </nav>
      <section class="section is-medium">
        <p>This is the feed content area.</p>
      </section>
    </>
  )
}