import { ComponentChildren, h } from 'preact';

export interface ModalProps {
  title: string;
  children?: ComponentChildren;
  isOpen: boolean;
  onCancel?: () => void;
  cancelText?: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  showFooter?: boolean;
  cardClassName?: string;
  bodyClassName?: string;
}

export function Modal(props: ModalProps) {
  if (!props.isOpen) {
    return null;
  }

	const shouldRenderFooter = props.showFooter !== false && (props.onPrimaryAction || props.onCancel);

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={props.onCancel}></div>
      <div className={`modal-card ${props.cardClassName ?? ''}`.trim()}>
        <header className="modal-card-head is-justify-content-space-between">
          <p className="modal-card-title" style={{ maxWidth: "90%" }}>{props.title}</p>
          {
            props.onCancel &&
            <button className="delete" aria-label="close" onClick={props.onCancel}></button>
          }
        </header>
        <section className={`modal-card-body ${props.bodyClassName ?? ''}`.trim()}>
          {props.children}
        </section>
        {shouldRenderFooter && <footer className="modal-card-foot">
          <div className="buttons">
            {
              props.onPrimaryAction &&
              <button className="button is-primary" onClick={props.onPrimaryAction}>
                {props.primaryActionText ?? "Save"}
                </button>
            }
            {
              props.onCancel &&
              <button className="button" onClick={props.onCancel}>
                {props.cancelText ?? "Cancel"}
                </button>
            }
          </div>
        </footer>}
      </div>
    </div>
  )
}