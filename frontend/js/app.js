// APIは同一オリジンで提供するため相対パスを使用
const API_URL = '/api';

// DOM要素
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const listScreen = document.getElementById('listScreen');
const formScreen = document.getElementById('formScreen');
const detailScreen = document.getElementById('detailScreen');
const myPageScreen = document.getElementById('myPageScreen');
const novelList = document.getElementById('novelList');
const myPageList = document.getElementById('myPageList');
const novelForm = document.getElementById('novelForm');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const newPostBtn = document.getElementById('newPostBtn');
const myPageBackBtn = document.getElementById('myPageBackBtn');
const myPageNewPostBtn = document.getElementById('myPageNewPostBtn');
const backBtn = document.getElementById('backBtn');
const cancelBtn = document.getElementById('cancelBtn');
const detailBackBtn = document.getElementById('detailBackBtn');
const detailContent = document.getElementById('detailContent');
const formTitle = document.getElementById('formTitle');
const userInfo = document.getElementById('userInfo');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const myPageBtn = document.getElementById('myPageBtn');

let currentToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let currentEditingId = null;
let previousScreen = null; // 前の画面を記憶
let isInMyPage = false; // マイページにいるかどうかを記憶

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// 認証確認
function checkAuth() {
  if (currentToken && currentUser) {
    showListScreen();
    updateUserInfo();
  } else {
    switchScreen(loginScreen);
  }
}

// ユーザー情報更新
function updateUserInfo() {
  if (currentUser) {
    usernameDisplay.textContent = `${currentUser.username} さん`;
    userInfo.style.display = 'flex';
  }
}

// イベントリスナー設定
function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  newPostBtn.addEventListener('click', () => { isInMyPage = false; showFormScreen(); });
  myPageNewPostBtn.addEventListener('click', () => { isInMyPage = true; showFormScreen(); });
  backBtn.addEventListener('click', goBack);
  cancelBtn.addEventListener('click', goBack);
  detailBackBtn.addEventListener('click', goBack);
  myPageBackBtn.addEventListener('click', showListScreen);
  novelForm.addEventListener('submit', handleFormSubmit);
  logoutBtn.addEventListener('click', handleLogout);
  if (myPageBtn) myPageBtn.addEventListener('click', showMyPage);
}

// 一つ前の画面に戻る
function goBack() {
  if (isInMyPage) {
    showMyPage();
  } else {
    showListScreen();
  }
}

// ログイン処理
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    currentToken = data.token;
    currentUser = data.user;

    localStorage.setItem('token', currentToken);
    localStorage.setItem('user', JSON.stringify(currentUser));

    alert('ログインしました！');
    updateUserInfo();
    loadNovels();
    switchScreen(listScreen);
    loginForm.reset();
  } catch (error) {
    alert('ログインエラー: ' + error.message);
  }
}

// 登録処理
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirm').value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    currentToken = data.token;
    currentUser = data.user;

    localStorage.setItem('token', currentToken);
    localStorage.setItem('user', JSON.stringify(currentUser));

    alert('登録しました！');
    updateUserInfo();
    loadNovels();
    switchScreen(listScreen);
    registerForm.reset();
  } catch (error) {
    alert('登録エラー: ' + error.message);
  }
}

// ログアウト処理
function handleLogout() {
  if (!confirm('ログアウトしますか？')) return;
  
  currentToken = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  userInfo.style.display = 'none';
  switchScreen(loginScreen);
  loginForm.reset();
}

// ログイン/登録画面表示
function showLoginScreen() {
  switchScreen(loginScreen);
}

function showRegisterScreen() {
  switchScreen(registerScreen);
}

// 一覧読み込み
async function loadNovels() {
  try {
    const response = await fetch(`${API_URL}/novels`, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) throw new Error('データ取得失敗');

    const novels = await response.json();
    displayNovels(novels);
  } catch (error) {
    console.error('エラー:', error);
    novelList.innerHTML = '<p class="loading">データの読み込みに失敗しました</p>';
  }
}

// 小説表示
function displayNovels(novels) {
  if (novels.length === 0) {
    novelList.innerHTML = '<p class="loading">まだ投稿がありません。最初の投稿をしてみましょう！</p>';
    return;
  }

  novelList.innerHTML = novels.map(novel => {
    const isOwner = currentUser && currentUser.id === novel.userId;
    return `
      <div class="novel-card" onclick="showDetailScreen('${novel._id}')">
        <h3>${escapeHtml(novel.title)}</h3>
        <p class="author">著者: ${escapeHtml(novel.author)}</p>
        <p class="posted-by">投稿者: ${escapeHtml(novel.username)}</p>
        ${novel.genre ? `<span class="genre">${escapeHtml(novel.genre)}</span>` : ''}
        <p class="rating">${getStarRating(novel.rating)}</p>
        <p class="description">${escapeHtml(novel.description)}</p>
        <p class="date">${formatDate(novel.postedAt)}</p>
        <div class="card-actions">
          ${isOwner ? `
            <button class="btn btn-secondary" onclick="event.stopPropagation(); showEditForm('${novel._id}')">編集</button>
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteNovel('${novel._id}')">削除</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// 詳細画面表示
async function showDetailScreen(id) {
  try {
    const response = await fetch(`${API_URL}/novels/${id}`, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) throw new Error('データ取得失敗');

    const novel = await response.json();
    const isOwner = currentUser && currentUser.id === novel.userId;

    detailContent.innerHTML = `
      <h2>${escapeHtml(novel.title)}</h2>
      <p class="author">著者: ${escapeHtml(novel.author)}</p>
      <p class="posted-by">投稿者: ${escapeHtml(novel.username)}</p>
      <div class="meta">
        ${novel.genre ? `<span class="genre-tag">${escapeHtml(novel.genre)}</span>` : ''}
        <span class="rating">${getStarRating(novel.rating)}</span>
      </div>
      <p class="date">投稿日: ${formatDate(novel.postedAt)}</p>
      <p class="description">${escapeHtml(novel.description).replace(/\n/g, '<br>')}</p>
      <div class="detail-actions">
        ${isOwner ? `
          <button class="btn btn-secondary" onclick="showEditForm('${novel._id}')">編集</button>
          <button class="btn btn-danger" onclick="deleteNovel('${novel._id}')">削除</button>
        ` : ''}
      </div>
    `;

    switchScreen(detailScreen);
  } catch (error) {
    console.error('エラー:', error);
    alert('データの取得に失敗しました');
  }
}

// フォーム表示（新規作成）
function showFormScreen() {
  currentEditingId = null;
  formTitle.textContent = '新しい小説を追加';
  resetForm();
  switchScreen(formScreen);
}

// フォーム表示（編集）
async function showEditForm(id) {
  try {
    const response = await fetch(`${API_URL}/novels/${id}`, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) throw new Error('データ取得失敗');

    const novel = await response.json();

    // 所有者確認
    if (currentUser.id !== novel.userId) {
      alert('編集権限がありません');
      return;
    }

    currentEditingId = id;
    formTitle.textContent = '小説を編集';

    document.getElementById('title').value = novel.title;
    document.getElementById('author').value = novel.author;
    document.getElementById('genre').value = novel.genre || '';
    document.getElementById('description').value = novel.description;
    document.getElementById(`star${novel.rating}`).checked = true;

    switchScreen(formScreen);
  } catch (error) {
    console.error('エラー:', error);
    alert('データの取得に失敗しました');
  }
}

// 一覧画面表示
function showListScreen() {
  isInMyPage = false;
  switchScreen(listScreen);
  loadNovels();
}

// マイページ（自分の投稿のみ表示）
function showMyPage() {
  console.log('🔍 showMyPage called, currentUser:', currentUser);
  console.log('📄 myPageList element:', myPageList);
  
  if (!currentUser) {
    alert('ログインしてください');
    switchScreen(loginScreen);
    return;
  }
  isInMyPage = true;
  loadMyNovels();
  switchScreen(myPageScreen);
  console.log('✅ switched to myPageScreen');
}

async function loadMyNovels() {
  try {
    console.log('📥 loadMyNovels starting...');
    const response = await fetch(`${API_URL}/novels`, {
      headers: { 'Authorization': `Bearer ${currentToken}` },
    });

    if (!response.ok) throw new Error('データ取得失敗');

    const novels = await response.json();
    console.log('📚 fetched novels:', novels);
    const myNovels = novels.filter(n => currentUser && (currentUser.id === n.userId || currentUser.id === n.user));
    console.log('🎯 filtered myNovels:', myNovels);
    displayMyNovels(myNovels);
  } catch (error) {
    console.error('❌ エラー:', error);
    myPageList.innerHTML = '<p class="loading">データの読み込みに失敗しました</p>';
  }
}

// マイページ用の小説表示
function displayMyNovels(novels) {
  if (novels.length === 0) {
    myPageList.innerHTML = '<p class="loading">まだ投稿がありません。新しい投稿をしてみましょう！</p>';
    return;
  }

  myPageList.innerHTML = novels.map(novel => {
    const isOwner = currentUser && currentUser.id === novel.userId;
    return `
      <div class="novel-card" onclick="showDetailScreen('${novel._id}')">
        <h3>${escapeHtml(novel.title)}</h3>
        <p class="author">著者: ${escapeHtml(novel.author)}</p>
        <p class="posted-by">投稿者: ${escapeHtml(novel.username)}</p>
        ${novel.genre ? `<span class="genre">${escapeHtml(novel.genre)}</span>` : ''}
        <p class="rating">${getStarRating(novel.rating)}</p>
        <p class="description">${escapeHtml(novel.description)}</p>
        <p class="date">${formatDate(novel.postedAt)}</p>
        <div class="card-actions">
          ${isOwner ? `
            <button class="btn btn-secondary" onclick="event.stopPropagation(); showEditForm('${novel._id}')"\>編集</button>
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteNovel('${novel._id}')"\>削除</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// 画面切り替え
function switchScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// フォーム送信
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    title: document.getElementById('title').value,
    author: document.getElementById('author').value,
    genre: document.getElementById('genre').value,
    description: document.getElementById('description').value,
    rating: parseInt(document.querySelector('input[name="rating"]:checked').value),
  };

  try {
    let response;
    if (currentEditingId) {
      // 更新
      response = await fetch(`${API_URL}/novels/${currentEditingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify(formData),
      });
    } else {
      // 作成
      response = await fetch(`${API_URL}/novels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify(formData),
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '保存失敗');
    }

    alert(currentEditingId ? '更新しました！' : '投稿しました！');
    showListScreen();
  } catch (error) {
    console.error('エラー:', error);
    alert('エラー: ' + error.message);
  }
}

// 削除
async function deleteNovel(id) {
  if (!confirm('本当に削除しますか？')) return;

  try {
    const response = await fetch(`${API_URL}/novels/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) throw new Error('削除失敗');

    alert('削除しました！');
    showListScreen();
  } catch (error) {
    console.error('エラー:', error);
    alert('エラー: ' + error.message);
  }
}

// フォームリセット
function resetForm() {
  novelForm.reset();
  document.getElementById('star5').checked = true;
}

// ユーティリティ関数
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStarRating(rating) {
  const fullStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return fullStars + emptyStars;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
