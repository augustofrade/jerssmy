import { ComponentChildren, h } from 'preact';

export interface ModalProps {
  title: string;
  children?: ComponentChildren;
  isOpen: boolean;
  onCancel?: () => void;
  cancelText?: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
}

export function Modal(props: ModalProps) {
  if (!props.isOpen) {
    return null;
  }

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={props.onCancel}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{props.title}</p>
          {
            props.onCancel &&
            <button className="delete" aria-label="close" onClick={props.onCancel}></button>
          }
        </header>
        <section className="modal-card-body">
          {props.children}
        </section>
        <footer className="modal-card-foot">
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
        </footer>
      </div>
    </div>
  )
}