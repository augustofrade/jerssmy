import { Fragment, h } from 'preact';
import { useState } from "preact/hooks";
import { Greet } from "../wailsjs/go/main/App";
import './App.css';

export function App(props: any) {
    const [resultText, setResultText] = useState("Please enter your name below 👇");
    const [name, setName] = useState('');
    const updateName = (e: any) => setName(e.target.value);
    const updateResultText = (result: string) => setResultText(result);

    function greet() {
        Greet(name).then(updateResultText);
    }

    return (
        <>
            <div id="App">
                <div className="bulma-buttons">
                    <button class="bulma-button bulma-is-info">Info</button>
                </div>
                <div id="result" className="result">{resultText}</div>
                <div id="input" className="input-box">
                    <input id="name" className="input" onChange={updateName} autoComplete="off" name="input"
                           type="text"/>
                    <button className="btn" onClick={greet}>Greet</button>
                </div>
            </div>
        </>
    )
}
