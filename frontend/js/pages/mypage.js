// マイページ表示機能
// ログインユーザーの投稿のみ表示

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
            <button class="btn btn-secondary" onclick="event.stopPropagation(); showEditForm('${novel._id}')">編集</button>
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteNovel('${novel._id}')">削除</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// マイページ表示
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
