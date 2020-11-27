import * as React from "react";
import { shallow } from "enzyme";
import { Outliner } from "..";

import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

describe("outliner", () => {

    it("an empty outliner has by default 1 note", () => {
        
        const element = shallow(
            <Outliner 
                notes={[]}
                />
        );

        expect(element.html()).toEqual(`<div><div class="note" contenteditable="true"></div></div>`);
    });

    it("can add note", () => {
        
        const element = shallow(
            <Outliner 
                notes={[ { id: "1", text: "Hello computer!", children: [] } ]}
                />
        );

        console.log(element.debug());

        const notes = element.find(".note");
        console.log(notes.debug());  
        console.log(notes.length);  

        // expect(element.find(".note"))

        //expect(element.html()).toEqual(`<div><div class="note" contenteditable="true">Hello computer!</div></div>`);
    });

    it("can add notes", () => {
        
        const element = shallow(
            <Outliner 
                notes={[ { id: "1", text: "Note1", children: [] }, { id: "2", text: "Note2", children: [] } ]}
                />
        );

        expect(element.html()).toEqual(`<div><div class="note" contenteditable="true">Note1</div><div class="note" contenteditable="true">Note2</div></div>`);
    });

    it("pressing enter creates a new note", ()  => {

        const element = shallow(<Outliner />);

        const firstNote = element.find(".note").at(0);

        const mockEvent = {
            key: "Enter",
        };

        firstNote.simulate("keyDown", mockEvent);

        expect(element.html()).toEqual(`<div><div class="note" contenteditable="true"></div><div class="note" contenteditable="true"></div></div>`);
    });

    it("pressing ctrl+delete deletes a note", () => {

        const element = shallow(<Outliner />);

        const firstNote = element.find(".note").at(0);

        const mockEvent = {
            key: "Delete",
            ctrlKey: true,
        };

        firstNote.simulate("keyDown", mockEvent);

        expect(element.html()).toEqual(`<div></div>`);
    });

});
