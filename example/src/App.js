import React from "react";
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

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            notes: DEFAULT_NOTES,
        };
    }
    render() {
        return (
          <div 
              className="App"
              style={{
                  display: "flex",
                  flexDirection: "row",
              }}
              >
              <div
                  style={{
                      flexGrow: 1,
                  }}
                  >
                  <Outliner 
                      notes={this.state.notes}
                      onNotesUpdated={notes => this.setState({ notes: notes })}
                      />
              </div>
              <div
                    style={{
                        fontSize: "0.7em",
                        width: "600px",
                    }}
                    >
                  <pre>{JSON.stringify(this.state.notes, null, 4)}</pre>
              </div>
          </div>
        );
    }
}

export default App;
