chrome.action.onClicked.addListener(async ()=>{
    let url = chrome.runtime.getURL("confibulator.html");
    let tab = await chrome.tabs.create({ url });
})

async function hideMutedPhrases(){
    const muterStorage = await chrome.storage.sync.get('muter');
    const phrases:Phrase[] = muterStorage['linkedin'];

    function hideElement(el:HTMLElement){
        // el.style.display='none';
        el.classList.add('muter--hidden');
    }
    function highlightElement(el:HTMLElement){
        // console.log('highlighting', el)
        if(!el.classList.contains('muter--highlighted')){
            el.classList.add('muter--highlighted');
        }
    }
    Array.from(document.querySelectorAll('.feed-shared-update-v2'))
        .filter((p)=>{
            const el = p as HTMLElement;
            // console.log(el);
            for(const phrase of phrases.filter((p)=>p.hidden)){
                if(phrase.str){
                    if(phrase.regex){
                        const r = new RegExp(phrase.str);
                        if(r.test(el.innerText)){
                            return true
                        }
                    } else {
                        if(el.innerText.indexOf(phrase.str)!=-1){
                            return true
                        }
                    }
                }
            }
        })
        .forEach((p)=>{highlightElement(p as HTMLElement)})
        console.log('Phrases Hidden');
    window.setTimeout(hideMutedPhrases,2000);
}
chrome.webNavigation.onDOMContentLoaded.addListener(async function(details){
    const {tabId} = details;
    await chrome.scripting.insertCSS({
        target:{tabId},
        files:['styles/style.css']
    }, ()=>{console.log('CSS Injected')});
    chrome.scripting.executeScript(
        {
          target: {tabId},
          func: hideMutedPhrases,
        },
        () => { console.log('content loaded') }
    );
    
}, {url:[
        {hostSuffix:"linkedin.com"}
    ]}
)
console.log('Goodbye world')