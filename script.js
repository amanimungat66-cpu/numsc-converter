

const names = {
    2:"Binary",
    8:"Octal",
    10:"Decimal",
    16:"Hexadecimal"
};

const allowed = {
    2:"0–1",
    8:"0–7",
    10:"0–9",
    16:"0–9 and A–F"
};


const from = document.getElementById("from");
const to = document.getElementById("to");
const input = document.getElementById("inputNumber");
const result = document.getElementById("result");
const hint = document.getElementById("hint");
const resultTitle = document.getElementById("resultTitle");
const steps = document.getElementById("steps");
const stepsContent = document.getElementById("stepsContent");

let history =
    JSON.parse(localStorage.getItem("numxHistory")) || [];


/* UPDATE UI */

function updateUI(){

    hint.innerText =
        "Allowed for " +
        names[from.value] +
        ": " +
        allowed[from.value];

    resultTitle.innerText =
        "Result · " +
        names[to.value];
}


from.addEventListener("change",function(){

    updateUI();
    clearResult();

});


to.addEventListener("change",function(){

    updateUI();
    clearResult();

});


/* VALIDATION */

function validNumber(value,base){

    if(base === 2)
        return /^[01]+$/.test(value);

    if(base === 8)
        return /^[0-7]+$/.test(value);

    if(base === 10)
        return /^[0-9]+$/.test(value);

    if(base === 16)
        return /^[0-9A-F]+$/i.test(value);

    return false;
}


/* CONVERSION */

function convertNumber(){

    let value =
        input.value.trim().toUpperCase();

    const baseFrom =
        Number(from.value);

    const baseTo =
        Number(to.value);


    if(!value){

        clearResult();

        return;

    }


    if(!validNumber(value,baseFrom)){

        result.innerText =
            "Invalid input";

        steps.classList.remove("show");

        return;

    }


    const decimal =
        parseInt(value,baseFrom);


    if(!Number.isSafeInteger(decimal)){

        result.innerText =
            "Number too large";

        return;

    }


    const converted =
        decimal
        .toString(baseTo)
        .toUpperCase();


    result.innerText =
        converted;


    createSteps(
        value,
        decimal,
        converted,
        baseFrom,
        baseTo
    );


    addHistory(
        value,
        converted,
        baseFrom,
        baseTo
    );

}


/* STEP BY STEP */

function createSteps(
    original,
    decimal,
    converted,
    baseFrom,
    baseTo
){

    steps.classList.add("show");

    let html = "";


    html += `
        <div class="step">

            <div class="step-number">
                STEP 1
            </div>

            <div class="step-text">

                Convert
                <b>${original}</b>
                from
                <b>base ${baseFrom}</b>
                to decimal.

            </div>

        </div>
    `;


    if(baseFrom !== 10){

        let digits =
            original
            .split("")
            .reverse();

        let calculation = [];

        digits.forEach((digit,index)=>{

            let value;

            if(
                digit >= "A" &&
                digit <= "F"
            ){

                value =
                    parseInt(digit,16);

            }else{

                value =
                    Number(digit);

            }

            calculation.push(
                `${value}×${baseFrom}^${index}`
            );

        });


        html += `
            <div class="step">

                <div class="step-number">
                    CALCULATION
                </div>

                <div class="step-text">

                    ${calculation.reverse().join(" + ")}

                    <br><br>

                    =
                    <b>${decimal}</b>

                </div>

            </div>
        `;

    }else{

        html += `
            <div class="step">

                <div class="step-number">
                    DECIMAL VALUE
                </div>

                <div class="step-text">

                    <b>${decimal}</b>

                </div>

            </div>
        `;

    }


    if(baseTo !== 10){

        html += `
            <div class="step">

                <div class="step-number">
                    FINAL RESULT
                </div>

                <div class="step-text">

                    ${decimal}
                    converted to base
                    ${baseTo}

                    =

                    <b>${converted}</b>

                </div>

            </div>
        `;

    }


    stepsContent.innerHTML = html;

}


/* SWAP */

function swapSystems(){

    const temp =
        from.value;

    from.value =
        to.value;

    to.value =
        temp;

    updateUI();

    if(input.value.trim())
        convertNumber();

}


/* QUICK VALUES */

function setValue(value){

    input.value =
        value;

    convertNumber();

}


/* CLEAR */

function clearInput(){

    input.value = "";

    clearResult();

    input.focus();

}


function clearResult(){

    result.innerText = "—";

    steps.classList.remove("show");

}


function clearAll(){

    input.value = "";

    clearResult();

    input.focus();

}


/* COPY */

async function copyResult(){

    const value =
        result.innerText;

    if(
        value === "—" ||
        value === "Invalid input"
    ){

        return;

    }


    try{

        await navigator.clipboard.writeText(value);

        showToast("Result copied!");

    }catch{

        showToast("Copy failed");

    }

}


/* HISTORY */

function addHistory(
    inputValue,
    outputValue,
    baseFrom,
    baseTo
){

    const item = {

        input:inputValue,

        output:outputValue,

        from:baseFrom,

        to:baseTo,

        time:new Date().toLocaleTimeString()

    };


    const first =
        history[0];

    if(
        first &&
        first.input === item.input &&
        first.output === item.output &&
        first.from === item.from &&
        first.to === item.to
    ){

        return;

    }


    history.unshift(item);

    history =
        history.slice(0,30);

    localStorage.setItem(
        "numxHistory",
        JSON.stringify(history)
    );

    renderHistory();

}


function renderHistory(){

    const list =
        document.getElementById("historyList");

    const count =
        document.getElementById("historyCount");


    count.innerText =
        history.length;


    if(history.length === 0){

        list.innerHTML =
            `<div class="empty">
                No conversions yet.
            </div>`;

        return;

    }


    list.innerHTML =
        history.map((item,index)=>`

            <div
                class="history-item"
                onclick="loadHistory(${index})">

                <strong>
                    ${item.input}
                    <span>→</span>
                    ${item.output}
                </strong>

                <span>
                    ${names[item.from]}
                    → ${names[item.to]}
                    · ${item.time}
                </span>

            </div>

        `).join("");

}


function loadHistory(index){

    const item =
        history[index];

    from.value =
        item.from;

    to.value =
        item.to;

    input.value =
        item.input;

    updateUI();

    convertNumber();

}


function clearHistory(){

    history = [];

    localStorage.removeItem(
        "numxHistory"
    );

    renderHistory();

    showToast("History cleared");

}


function downloadHistory(){

    if(history.length === 0){

        showToast("History is empty");

        return;

    }


    let text =
        "NumX Conversion History\n\n";


    history.forEach(item=>{

        text +=
            `${item.input} (${names[item.from]}) ` +
            `→ ${item.output} (${names[item.to]}) ` +
            `[${item.time}]\n`;

    });


    const blob =
        new Blob(
            [text],
            {type:"text/plain"}
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "numx-history.txt";

    a.click();

    URL.revokeObjectURL(url);

}


/* THEME */

function toggleTheme(){

    document.body.classList.toggle("light");

    localStorage.setItem(
        "numxTheme",
        document.body.classList.contains("light")
            ? "light"
            : "dark"
    );

}


if(
    localStorage.getItem("numxTheme")
    === "light"
){

    document.body.classList.add("light");

}


/* GUIDE */

function toggleGuide(){

    document
        .getElementById("guide")
        .classList.toggle("open");

}


/* TOAST */

function showToast(message){

    const toast =
        document.getElementById("toast");

    toast.innerText =
        message;

    toast.classList.add("show");


    setTimeout(()=>{

        toast.classList.remove("show");

    },1800);

}


/* KEYBOARD */

input.addEventListener(
    "keydown",
    function(event){

        if(event.key === "Enter"){

            convertNumber();

        }

    }
);


document.addEventListener(
    "keydown",
    function(event){

        if(
            event.ctrlKey &&
            event.key.toLowerCase() === "enter"
        ){

            convertNumber();

        }

        if(
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ){

            event.preventDefault();

            input.focus();

        }

    }
);

function scrollToTop(){
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* START */

updateUI();

renderHistory();

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => {
                console.log("NumSC service worker registered.");
            })
            .catch(error => {
                console.error(
                    "Service worker registration failed:",
                    error
                );
            });

    });

}
