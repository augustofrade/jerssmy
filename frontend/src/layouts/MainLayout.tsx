import { h } from 'preact';
import { Link } from 'preact-router/match';

export function MainLayout(props: any) {
  return (
    <div class="columns is-gapless m-0" style={{ minHeight: '100vh' }}>
      <aside class="column is-one-quarter">
        <div class="menu p-5" style={{ backgroundColor: "#e1e1e1", height: "100%" }}>
          <p className="menu-label">General</p>
          <ul class="menu-list">
            <li><Link activeClassName="is-active" path="/">Home</Link></li>
          </ul>
          <p className="menu-label">Feeds</p>
        </div>
      </aside>
      <main class="column">
        {props.children}
      </main>
    </div>
  )
}