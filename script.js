document.addEventListener("DOMContentLoaded", init);

let pages = null;

function init() {
    document.getElementById("btnSend").addEventListener("click", function () {
        // we only have 2 pages
        pages[0].classList.toggle("active");
        pages[1].classList.toggle("active");
    });

    document.getElementById("btnBack").addEventListener("click", function () {
        // we only have 2 pages
        pages[0].classList.toggle("active");
        pages[1].classList.toggle("active");
    });

    pages = document.querySelectorAll(".page");
    console.log(pages);
}

document.getElementById('btnSend').addEventListener('click', lotto);

function lotto() {
    //pages

    let arrayNum = [];
    let url = 'https://griffis.edumedia.ca/mad9014/lotto/nums.php';

    // parameters (params)
    let myData = new FormData();
    myData.append('digits', document.getElementById('digits').value);
    myData.append('max', document.getElementById('max').value);

    // options
    let opts = {
        method: 'post',
        mode: 'cors',
        body: myData
    }

    fetch(url, opts)
        .then(function (response) {
            console.log("fetch succeeded");
            return response.json();
        })
        .then(function (dataJson) {
            console.log('Request successful');
            //putting numbers inside Array to avoid duplicates
            dataJson.numbers.forEach(function (item) {
                if (arrayNum.indexOf(item) == -1) {
                    arrayNum.push(item);
                };
            });
            //
            console.log(arrayNum.length + " - " + document.getElementById('digits').value);
            //testing your new Array, if it has enough numbers you just field the list in the html
            if (arrayNum.length < document.getElementById('digits').value) {
                lotto();
            } else {
                let ul = document.querySelector('.num_list');
                ul.innerHTML = '';
                arrayNum.forEach(function (item) {
                    let li = document.createElement("li");
                    let box = document.createElement('div');
                    box.className = "box";
                    li.appendChild(box);

                    //                li.textContent= item;
                    box.textContent = item;
                    ul.appendChild(li);
                });
            };
        })
        .catch(function (error) {
            console.log('Request failed', error)
                // will catch any error you need. 
        });

};
