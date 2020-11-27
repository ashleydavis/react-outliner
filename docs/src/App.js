import './App.css';
import { Outliner, makeNote } from 'react-outliner';

const DEFAULT_NOTES = [
    makeNote("Note 1"), 
    makeNote("Note 2", false, [
        makeNote("Child note 1", false, [
            makeNote("Grandchild note 1"), 
            makeNote("Grandchild note 2"), 
        ]),
        makeNote("Child note 2"), 
    ]), 
    makeNote("Note 3"),
];

function App() {
  return (
    <div className="App">
        <Outliner 
            notes={DEFAULT_NOTES}
            />
    </div>
  );
}

export default App;
