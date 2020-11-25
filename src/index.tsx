import { eventNames } from "process";
import * as React from "react";

//
// Represents a note in the outliner.
//
export interface INote {
    //
    // The text for the note.
    //
    text: string;
}

export interface IOutlinerProps {
    //
    // Initial notes to be displayed in the outliner.
    //
    notes?: INote[];
}

export interface IOutlinerState {
    //
    // Notes that are currently displayed in the outliner.
    //
    notes: INote[];
}

const DEFAULT_NOTE = {
    text: "",
};

export class Outliner extends React.Component<IOutlinerProps, IOutlinerState> {

    constructor(props: IOutlinerProps) {
        super(props);

        let notes = this.props.notes;
        if (notes === undefined) {
            notes = [ DEFAULT_NOTE, ];
        }
        else if (notes.length === 0) {
            notes = [ DEFAULT_NOTE, ];
        }

        this.state = {
            notes: notes,
        };
    }

    render() {
        return (
            <div>
                {this.state.notes.map((note, index) => 
                    <div
                        key={index}
                        className="note"
                        contentEditable
                        suppressContentEditableWarning
                        onKeyDown={evt => {
                            if (evt.key === "Enter") {
                                this.setState({
                                    notes: this.state.notes.concat([DEFAULT_NOTE]),
                                });
                            }

                            if (evt.key === "Delete" && evt.ctrlKey) {
                                const notes = this.state.notes.slice();
                                notes.splice(index, 1);
                                this.setState({
                                    notes: notes,
                                });
                            }
                        }}
                        >
                        {note.text}
                    </div>
                )}
            </div>
        );
    }

}