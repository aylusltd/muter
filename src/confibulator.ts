type StateType = {
    [key:string]: any
}
type Phrase = {
    str : string;
    regex: boolean;
    hidden: boolean;
    highlighted: boolean;
}

const state:StateType = {};

function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}
function q(r:Element, s:string){
    return r.querySelector(s);
}
function qa(r:Element, s:string){
    return Array.from(r.querySelectorAll(s));
}

(async function main(){
   

    const muterStorage = await chrome.storage.sync.get('muter');
    const conf = muterStorage['conf'];
    state.conf = conf;
    
    const phrases:Phrase[] = muterStorage['linkedin'];
    state.phrases = phrases;
    state.newPhrases = phrases;
    
    for(let i=0; i<phrases.length; i++){
        const p = phrases[i]
        insertRow(p,i);

    }
    const saveButton = q(document.body, "button#save");
    if(saveButton instanceof HTMLButtonElement){
        saveButton.onclick=savePhrases;
    }
    const addButton = q(document.body, "button#add");
    if(saveButton instanceof HTMLButtonElement){
        saveButton.onclick=addRow;
    }


})()

async function savePhrases(){
    state.phrases = state.newPhrases;
    await chrome.storage.sync.set({"muter":{
        conf:state.conf,
        linkedin:state.phrases
    }});
}

async function addRow() {
    const newPhrase:Phrase = {
        str:"",
        hidden: false,
        highlighted: false,
        regex:false
    } 
    state.newPhrases.append(newPhrase);
    insertRow();
}

async function insertRow(p?:Phrase, i?:number){
    const rowTemplate = document.querySelector('#confibulatorRow');
    const tbody = document.querySelector("#confibulatorPhrases tbody");
    assert(!!tbody, "No table found");
    assert(rowTemplate instanceof HTMLMetaElement, "Must be a template");
    assert(!!(rowTemplate && rowTemplate.firstElementChild), "Invalid template");
    const row = rowTemplate.firstElementChild.cloneNode(true) as Element;
    assert(!!row,"Javascript has failed. Go home");
    if(p && i){
        const cells = qa(row, "td");
        const phraseInput = q(cells[0],"input") as HTMLInputElement;
        phraseInput.value = p.str;
        phraseInput.addEventListener("change", function(e){
            state.newPhrases[i].str=phraseInput.value;
        });
        const selector = q(cells[1], "select") as HTMLSelectElement;
        selector.value=p.hidden?"Hide":"Highlight";
        selector.onchange = (e)=>{
            state.newPhrases[i].hidden = selector.value == "Hide";
            state.newPhrases[i].highlighted = selector.value == "Highlight";
        }
        const regex = q(cells[2], "input") as HTMLInputElement;
        regex.value = p.regex?"true":"false";
        regex.onchange = ()=>{state.newPhrases[i].regex = regex.value == "true"}
        const deleteButton = q(cells[3], "button") as HTMLButtonElement;
        deleteButton.onclick = ()=>{
            state.newPhrases.splice(i,1);
            if(row.parentElement) 
                row.parentElement.removeChild(row)
        }
    } 
    tbody.appendChild(row);
}
