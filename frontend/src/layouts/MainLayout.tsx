import { Fragment, h } from 'preact';
import { Link } from 'preact-router/match';
import { FeedCreateModal } from '../components/FeedCreateModal';
import { useModal } from '../hooks/useModal';

export function MainLayout(props: any) {
  const modal = useModal({
    onCancel: () => {
      console.log("Add Feed cancelled");
    }
  });

  return (
    <>
    <FeedCreateModal
      isOpen={modal.isOpen}
      onCancel={modal.closeModal}
      onSubmit={(values) => {
        console.log("Create feed", values);
      }}
    />

    <div className="columns is-gapless m-0" style={{ minHeight: '100vh' }}>
      <aside className="column is-one-quarter">
        <div className="menu p-5" style={{ backgroundColor: "#e1e1e1", height: "100%" }}>
          <p className="menu-label">General</p>
          <ul className="menu-list">
            <li><Link activeClassName="is-active" path="/">Home</Link></li>
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
        </div>
      </aside>
      <main className="column">
        {props.children}
      </main>
    </div>
    </>
  )
}