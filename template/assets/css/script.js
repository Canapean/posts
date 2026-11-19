const baseUrl = "http://kino.vippo.ru/api"


function openPage(page) {
  const pageToHide = [
    "indexPage",
    "registerPage",
    "loginPage",
    "postPage",
    "createPostPage",
    "profilePage",
  ];

  pageToHide.forEach((pageId) => {
    if (pageId !== page) {
      document.querySelector(`#${pageId}`).style.display = "none";
    } else {
      document.querySelector(`#${pageId}`).style.display = "";
    }
  });

  if (page =='indexPage') {
    loadPosts()
  }
  if (page =='profilePage') {
    profile()
  }
}

async function loadPosts(){
    const url = baseUrl + "/post"
    const options = {method: "GET"}

    try{
        const response = await fetch(url, options)
        const data = await response.json()

        const row = document.querySelector('#indexPage div.row')
        row.innerHTML = ''

        data.forEach(post => {
          const postElem = document.createElement('div')
          postElem.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3', 'mb-4')
          postElem.innerHTML = `
          <div class="card">
              <img src="${post.image}" class="card-img-top" alt="${post.name}">
              <div class="card-body">
                  <div class="badge bg-success mb-3">${post.user}</div>
                  <h5 class="card-title">${post.name}</h5>
                  <p class="card-text">${post.text}</p>
                  <a href="#" class="btn btn-primary" onClick="loadPost(${post.id})">Читать пост</a>
              </div>
          </div>
          `;
          row.appendChild(postElem)
        })

        console.log(data);
        
    }catch(error)
    {console.error(error);
    }
}

async function loadPost(postId) {
  console.log(postId);
  
  const url = baseUrl + '/post/' + postId
  const options = {method: "GET"}

  try{
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data);
    const postSelector = document.querySelector('#postPage')
    postSelector.innerHTML = `
            <h2 class="mb-4">${data.name}</h2>
            <img src="${data.image}" alt="${data.name}">
            <p>${data.text}</p>
            <h4 class="mt-3">Комментарии</h4>
            <form class="mb-4" onSubmit="addComment(event, ${postId})">
                <textarea rows="3" class="form-control" placeholder="Введите комментарий" id="commText"></textarea>
                <button class="btn btn-success mt-2">Отправить</button>
            </form>
            <div class="comments"></div>
    `
    const comments = document.querySelector('.comments')
    data.comments.forEach(comm => {
              const commElem = document.createElement('div')
              commElem.classList.add('card', 'mb-3')
              commElem.innerHTML = `
              <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title">${comm.user}</h5>
                            <small class="card-text text-muted">${comm.created_at}</small>
                        </div>
                        <p class="card-text">${comm.text}</p>
                    </div>
              `;
              comments.appendChild(commElem)
            }
          )
        

  }catch(error)
  {console.error(error);
  }
  openPage('postPage')
}

async function addComment(event, postId) {
  event.preventDefault()
  const text = document.querySelector("#commText").value
  const token = localStorage.getItem("token")
  const url = baseUrl + `/post/${postId}/comment`;
  const options = {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({text: text})
  };

    const response = await fetch(url, options);
    const data = await response.json();
    loadPost(postId)
    console.log(data);
}

async function register(event) {
    event.preventDefault();
    const name = document.querySelector('#registerName').value;
    const login = document.querySelector('#registerLogin').value;
    const password = document.querySelector('#registerPassword').value;

    const url = baseUrl + '/register';
    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, login, password })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(data);
        

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка регистрации');
        }

        await auth(login, password);
        openPage("indexPage");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function login(event) {
    event.preventDefault();
    const login = document.querySelector('#loginLogin').value;
    const password = document.querySelector('#loginPassword').value;

    try {
        await auth(login, password);
        await profile();
        openPage("profilePage");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function auth(login, password) {
    const url = baseUrl + "/login";
    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password })
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    

    if (!response.ok || !data.token) {
        throw new Error(data.message || 'Неверный логин или пароль');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
}

async function profile() {
  const url = baseUrl + "/my-post"
  const token = localStorage.getItem("token")
  const options = {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data);

    const title = document.querySelector('#profilePage h2')
    const table = document.querySelector('.table')

    table.innerHTML = `
                <tr>
                    <th>ID</th>
                    <th>Название поста</th>
                    <th>Дата создания</th>
                    <th>Действия</th>
                </tr>
    `

    title.innerHTML = `Добро пожаловать, ${localStorage.getItem('username')}`

    data.forEach(post => {
      const postElement = document.createElement('tr')
      postElement.innerHTML = `
                <tr>
                    <td>${post.id}</td>
                    <td>${post.name}</td>
                    <td>${post.created_at}</td>
                    <td>
                        <button class="btn btn-primary" onClick="loadPost(${post.id})">Перейти к посту</button>
                        <button class="btn btn-danger" onClick="deletePost(${post.id})">Удалить пост</button>
                    </td>
                </tr>
      `

      table.appendChild(postElement)
    })
  } catch (error) {
    console.error(error)
  }
}

async function deletePost(postId) {
  const url = baseUrl + `/post/${postId}`
  const token = localStorage.getItem("token")
  const options = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  const request = await fetch(url, options)
  const data = request.json()
  console.log(data);
  profile()
}

async function create(event) {
  event.preventDefault()
  const title = document.querySelector('#postTitle').value
  const text = document.querySelector('#postText').value
  const img = document.querySelector('#postImg')
  const token = localStorage.getItem("token")
  const url = baseUrl + '/post'
  const formData = new FormData()

  formData.append('name', title);
  formData.append('text', text);  
  if (img.files.length > 0) {
    formData.append('image', img.files[0]);
  }

  console.log(formData);
  

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data);
    profile()
    openPage("profilePage")
  } catch (error) {
    console.error(error)
  }
}

function logout() {
  localStorage.clear()
}

openPage("indexPage");
