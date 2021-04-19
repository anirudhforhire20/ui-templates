//component classes
function bandImageProject(projectid, inputid)
{
    let input = document.getElementById(inputid);
    let projector = document.getElementById(projectid);
    input.onchange = () => {
        if(input.files && input.files[0])
        {
            let reader = new FileReader();
            reader.onload = e => {
                projector.src = e.target.result;
                document.getElementById('pfp-url').value = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
}

function bandFormConstructor()
{
    let renderHTML = '<div class="form-page band-creator">\
    <img id="band-img-project" class="band-img">\
\
    <fieldset id="band-pfp">\
        <input id="band-pfp-file" type="file" accept="image/*">\
        <input id="pfp-url" type="hidden">\
    </fieldset>\
\
\
\
    <fieldset id="band-name">\
        <input type="text" placeholder=" ">\
        <label>Band name</label>\
        <span>Enter a band\'s name</span>\
    </fieldset>\
\
    <fieldset id="band-members">\
        <div class="suggestions">\
        </div>\
        <input type="text" placeholder=" ">\
        <label>Band members</label>\
        <span>Invite users to your band</span>\
    </fieldset>\
\
    <div id="users" class="user-collection">\
    </div>\
\
    <fieldset id="genre" style="margin-top: 100px;">\
        <div class="suggestions">\
        </div>\
        <input type="text" placeholder=" ">\
        <label>Genre</label>\
        <span>Select upto 5 genres</span>\
    </fieldset>\
    <div class="genre-collection" style="margin-bottom: 100px;">\
    </div>\
\
    <textarea class="band-about" id="band-about" cols="30" rows="10" maxlength="200">\
Enter a band\'s description\
    </textarea>\
\
    <button id="band-create" class="btn primary" style="width: 85px; height: 36px; margin-top: 50px;">Form</button>\
</div>';
console.log(document.querySelector('.container'))
document.querySelector('.container').classList.add('band');
document.querySelector('.container').insertAdjacentHTML('beforeend', renderHTML);

//band pfp function
bandImageProject('band-img-project', 'band-pfp-file');

//member suggestions
let memin = document.querySelector('#band-members').querySelector('input');
let memsug = document.querySelector('#band-members').querySelector('.suggestions');
let meminv = document.querySelector('#users.user-collection');
console.log(memin);
memin.onkeydown = (event) => {
    memsug.innerHTML = ''; 
    fetch('/query?param=users&key=' + memin.value).then(res => {
        res.json().then(data => {
            let usrcol = document.createElement('div');
            usrcol.classList.add('user-collection');
            usrcol.style.margin = '5px';
            memsug.append(usrcol);
            data.forEach(user => {
                let renderHTML = '<div id="' + data.uid + '" class="user">\
                <div class="info">\
                    <img src="' + data.pfpURL + '">\
                    <span style="border: 0px;">' + data.uname +'</span>\
                </div>\
                <button type="button" class="invited">Invite</button>\
            </div>';
            usrcol.insertAdjacentHTML('beforeend', renderHTML);
            let inserted = document.querySelector('#' + data.uid);
            let btn = document.querySelector('#' + data.uid).querySelector('button');
            btn.onclick = () => {
                let xhr = new XMLHttpRequest();
                xhr.open('POST', '/invite?uid=' + uid + '&gid=' + data.uid);
                xhr.send();
                btn.innerHTML = 'Invited';
                btn.disabled = true;
                let insertedClone = inserted.cloneNode(true);
                inserted.remove();
                meminv.append(insertedClone);
            }
            });
        });
    });
}
document.body.addEventListener('click', () => {
    memsug.innerHTML = '';
});


let gensug = document.querySelector('#genre').querySelector('.suggestions');
let genin = document.querySelector('#genre').querySelector('input');
let gencol = document.querySelector('.genre-collection');
genin.onkeydown = () => {
    gensug.innerHTML = '';
    fetch('/query?param=genre&key=' + genin.value).then(res => {
        res.json().then(data => {
            data.forEach(sug => {
                let g = document.createElement('div');
                g.classList.add('genre-suggestion');
                g.innerHTML = sug;
                gensug.append(g);
                g.onclick = () => {
                    let renderHTML = '<div id="' + sug + '" class="genre">\
                    <span>' + sug + '</span>\
                    <span class="rm">&cross;</span>\
                </div>';
                gencol.insertAdjacentHTML('beforeend', renderHTML);
                document.querySelector('#' + sug + '.genre').querySelector('.rm').onclick = function() {
                    this.parentElement.remove();
                }
                }
            });
        });
    });
}

genin.onkeypress = event => {
    if(event.key == 'Enter')
    {
        let renderHTML = '<div id="' + genin.value + '" class="genre">\
            <span>' + genin.value + '</span>\
            <span class="rm">&cross;</span>\
        </div>';
        console.log()
        gencol.insertAdjacentHTML('beforeend', renderHTML);
        document.querySelector('#' + genin.value + '.genre').querySelector('.rm').onclick = function() {
            this.parentElement.remove();
        }
        genin.value = '';
    }
}

document.body.addEventListener('click', () => {
    gensug.innerHTML = '';
});


document.getElementById('band-create').onclick = () => {
    let bandJSON = {
        "band-name" : document.querySelector('#band-name').querySelector('input').value,
        "band-about" : document.querySelector('#band-about').innerHTML,
        "band-pfp" : document.getElementById('band-img-project').src
    };

    let usrs = [];
    new Array.from(document.querySelector('#users.user-collection').children).forEach(child => {
        usrs.push(child.id);
    });

    let genres = [];
    new Array.from(document.querySelector('.genre-collection').children).forEach(child => {
        genres.push(child.id);
    });

    bandJSON["users"] = usrs;
    bandJSON["genres"] = genres;

    let xhr = new XMLHttpRequest();
    xhr.onload = () => {
        let res = JSON.parse(xhr.responseText);
        if(res.status == 'successful')
        {
            //do stuff
        }
    }
    xhr.open('POST', '/create-band');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(bandJSON));
}

}

bandFormConstructor();