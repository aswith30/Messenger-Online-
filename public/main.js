const api = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  posts: '/api/posts'
};

const tokenKey = 'ql_token';
const userKey = 'ql_user';

function $(sel){return document.querySelector(sel)}
function qs(sel){return document.querySelectorAll(sel)}

const loginForm = $('#login-form');
const registerForm = $('#register-form');
const postForm = $('#post-form');
const createPostSection = $('#create-post');
const authSection = $('#auth-section');
const postsList = $('#posts');
const userArea = $('#user-area');

function saveAuth(token, user){
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
  updateUI();
}

function clearAuth(){
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  updateUI();
}

function getAuthHeader(){
  const token = localStorage.getItem(tokenKey);
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function updateUI(){
  const user = JSON.parse(localStorage.getItem(userKey) || 'null');
  if (user) {
    userArea.innerHTML = `<span>Hi, ${escapeHtml(user.name)}</span> <button id="logout">Logout</button>`;
    createPostSection.classList.remove('hidden');
    authSection.classList.add('hidden');
    $('#logout').addEventListener('click', clearAuth);
  } else {
    userArea.innerHTML = '';
    createPostSection.classList.add('hidden');
    authSection.classList.remove('hidden');
  }
}

// Forms
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(registerForm).entries());
  const res = await fetch(api.register, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) return alert(body.error || 'Registration failed');
  saveAuth(body.token, body.user);
  registerForm.reset();
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(loginForm).entries());
  const res = await fetch(api.login, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) return alert(body.error || 'Login failed');
  saveAuth(body.token, body.user);
  loginForm.reset();
});

postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = $('#post-text').value.trim();
  if (!text) return;
  const res = await fetch(api.posts, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ text })
  });
  const body = await res.json();
  if (!res.ok) return alert(body.error || 'Post failed');
  $('#post-text').value = '';
  fetchPosts();
});

// fetch & render posts
async function fetchPosts(){
  const res = await fetch(api.posts);
  const posts = await res.json();
  postsList.innerHTML = '';
  posts.forEach(p => {
    const li = document.createElement('li');
    li.className = 'post';
    li.innerHTML = `<h4>${escapeHtml(p.author?.name || 'Unknown')}</h4>
                    <p>${escapeHtml(p.text)}</p>
                    <small>${new Date(p.createdAt).toLocaleString()}</small>`;
    postsList.appendChild(li);
  });
}

// simple escape
function escapeHtml(str){
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

updateUI();
fetchPosts();
