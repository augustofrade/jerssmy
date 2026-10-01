import { h } from 'preact';
import { useField, UseField } from '../hooks/useField';
import { FeedService } from '../services/FeedService';
import { isUrl } from '../validators/is-url';
import { Modal } from './Modal';

type FeedCreateModalProps = {
  isOpen: boolean;
  onCancel?: () => void;
  onSubmit?: (values: { name: string; url: string }) => void;
};


export function FeedCreateModal(props: FeedCreateModalProps) {
  const nameField = useField<string>({
    initialValue: '',
    required: true
  });

  const urlField = useField<string>({
    initialValue: '',
    required: true,
    validations: [
      ['url', (value) => isUrl(value)]
    ]
  });

  function handleInput(field: UseField<string>, event: Event) {
    field.setValue((event.target as HTMLInputElement).value);
  }

  function resetForm() {
    nameField.reset();
    urlField.reset();
  }

  function handleCancel() {
    resetForm();
    props.onCancel?.();
  }

  async function handleSubmit() {
    const isNameValid = nameField.validate();
    const isUrlValid = urlField.validate();

    if (!isNameValid || !isUrlValid) {
      return;
    }

    nameField.disable();
    urlField.disable();
    
    const feed = await FeedService.CreateFeed({ title: nameField.value!, url: urlField.value! });
    console.log(feed);
    props.onSubmit?.({ name: nameField.value!, url: urlField.value! });
    resetForm();
    props.onCancel?.();
  }

  function getNameFieldError() {
    if(nameField.valid) {
      return null;
    }
    if(nameField.hasError('required')) {
      return 'Name is required';
    }
    return null;
  }

  function getUrlFieldError() {
    if(urlField.valid) {
      return null;
    }
    if(urlField.hasError('required')) {
      return 'Feed URL is required';
    }
    if(urlField.hasError('url')) {
      return 'Feed URL is invalid';
    }
    return null;
  }


  return (
    <Modal
      title="Add Feed"
      isOpen={props.isOpen}
      onCancel={handleCancel}
      primaryActionText="Add"
      onPrimaryAction={handleSubmit}
    >
      <div className="content">
        <div className="field">
          <label className="label" for="feed-name">Name</label>
          <div className="control">
            <input
              id="feed-name"
              className={`input ${nameField.shouldDisplayError ? 'is-danger' : ''} ${nameField.disabled ? 'is-disabled' : ''}`}
              type="text"
              ref={nameField.ref}
              value={nameField.value}
              onInput={(event) => handleInput(nameField, event)}
              placeholder="My Feed"
            />
          </div>
          {nameField.shouldDisplayError && <p className="help is-danger">{getNameFieldError()}</p>}
        </div>

        <div className="field">
          <label className="label" for="feed-url">Feed URL</label>
          <div className="control">
            <input
              id="feed-url"
              className={`input ${urlField.shouldDisplayError ? 'is-danger' : ''} ${urlField.disabled ? 'is-disabled' : ''}`}
              type="url"
              ref={urlField.ref}
              value={urlField.value}
              onInput={(event) => handleInput(urlField, event)}
              placeholder="https://example.com/feed.xml"
            />
            {urlField.shouldDisplayError && <p className="help is-danger">{getUrlFieldError()}</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
}