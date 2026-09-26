import { render } from 'preact';
import { App } from './app';
import "./assets/lib/bulma/css/bulma-prefixed.min.css";
import './style.css';

render(<App/>, document.getElementById('app')!);
