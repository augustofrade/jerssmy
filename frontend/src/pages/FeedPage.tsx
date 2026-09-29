import { Fragment, h } from 'preact';

function FeedPage(props: any) {
  return (
    <>
      <nav class="navbar px-5 py-3" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <span class="navbar-item has-text-weight-semibold">Feed Title</span>
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