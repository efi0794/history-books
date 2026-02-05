// メイン一覧表示機能
// すべてのユーザーの投稿を表示

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
    console.error('❌ エラー:', error);
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

// 一覧画面表示
function showListScreen() {
  console.log('📄 Showing main list screen');
  isInMyPage = false;
  switchScreen(listScreen);
  loadNovels();
}
