let links = JSON.parse(localStorage.getItem('savedLinks')) || [];
let editingIndex = -1; // Индекс редактируемой ссылки

// Загрузка ссылок на главной (ТОЛЬКО просмотр)
function loadLinks() {
    const container = document.getElementById('links-container');
    const emptyState = document.getElementById('empty-state');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (links.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    links.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        div.innerHTML = `
            <h3>${link.title}</h3>
            <a href="${link.url}" target="_blank">${link.url}</a>
            <div class="link-date">Добавлено: ${new Date(link.date).toLocaleDateString('ru-RU')}</div>
        `;
        container.appendChild(div);
    });
}

// Загрузка в админке (с кнопками редактирования/удаления)
function loadAdminLinks() {
    const container = document.getElementById('admin-links');
    if (!container) return;
    
    container.innerHTML = '';
    if (links.length === 0) {
        container.innerHTML = '<p class="empty-message">Ссылок пока нет. Добавьте первую!</p>';
        return;
    }
    
    links.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        div.innerHTML = `
            <h3>${link.title}</h3>
            <a href="${link.url}" target="_blank">${link.url}</a>
            <div class="link-date">Добавлено: ${new Date(link.date).toLocaleDateString('ru-RU')}</div>
            <div class="link-actions">
                <button class="edit-btn" onclick="editLink(${index})">Редактировать</button>
                <button class="delete-btn" onclick="deleteLink(${index})">Удалить</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// НАЧАЛО РЕДАКТИРОВАНИЯ
function editLink(index) {
    editingIndex = index;
    
    // Показываем форму редактирования, скрываем форму добавления
    const addForm = document.getElementById('add-form');
    const editForm = document.getElementById('edit-form');
    
    if (addForm) addForm.style.display = 'none';
    if (editForm) editForm.style.display = 'block';
    
    // Заполняем форму текущими данными
    document.getElementById('edit-title').value = links[index].title;
    document.getElementById('edit-url').value = links[index].url;
    
    // Прокручиваем к форме
    editForm.scrollIntoView({ behavior: 'smooth' });
}

// СОХРАНЕНИЕ ИЗМЕНЕНИЙ
function saveEdit() {
    const title = document.getElementById('edit-title').value.trim();
    const url = document.getElementById('edit-url').value.trim();
    
    if (!title || !url) {
        alert('Заполните все поля!');
        return;
    }
    
    if (!url.match(/^https?:\/\//)) {
        alert('Введите корректный URL (должен начинаться с http:// или https://)');
        return;
    }
    
    // Обновляем ссылку
    links[editingIndex] = {
        title, 
        url, 
        date: links[editingIndex].date // сохраняем старую дату
    };
    
    localStorage.setItem('savedLinks', JSON.stringify(links));
    
    // Сбрасываем форму редактирования
    cancelEdit();
    
    // Обновляем все страницы
    loadLinks();
    loadAdminLinks();
    
    alert('Ссылка обновлена!');
}

// ОТМЕНА РЕДАКТИРОВАНИЯ
function cancelEdit() {
    editingIndex = -1;
    const addForm = document.getElementById('add-form');
    const editForm = document.getElementById('edit-form');
    
    if (addForm) addForm.style.display = 'block';
    if (editForm) editForm.style.display = 'none';
    
    // Очищаем поля
    const editTitle = document.getElementById('edit-title');
    const editUrl = document.getElementById('edit-url');
    if (editTitle) editTitle.value = '';
    if (editUrl) editUrl.value = '';
}

// Добавление ссылки
function addLink() {
    const title = document.getElementById('link-title').value.trim();
    const url = document.getElementById('link-url').value.trim();
    
    if (!title || !url) {
        alert('Заполните все поля!');
        return;
    }
    
    if (!url.match(/^https?:\/\//)) {
        alert('Введите корректный URL (должен начинаться с http:// или https://)');
        return;
    }
    
    links.push({ title, url, date: new Date().toISOString() });
    localStorage.setItem('savedLinks', JSON.stringify(links));
    
    document.getElementById('link-title').value = '';
    document.getElementById('link-url').value = '';
    
    loadAdminLinks();
    loadLinks();
    alert('Ссылка добавлена!');
}

// Удаление ссылки
function deleteLink(index) {
    if (confirm('Удалить эту ссылку?')) {
        links.splice(index, 1);
        localStorage.setItem('savedLinks', JSON.stringify(links));
        loadLinks();
        loadAdminLinks();
    }
}

// Экспорт
function exportLinks() {
    const dataStr = JSON.stringify(links, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `links-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Импорт
function importLinks(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedLinks = JSON.parse(e.target.result);
            if (confirm(`Импортировать ${importedLinks.length} ссылок? Текущие будут заменены.`)) {
                links = importedLinks.map(link => ({
                    title: link.title || 'Без названия',
                    url: link.url || '#',
                    date: link.date || new Date().toISOString()
                }));
                localStorage.setItem('savedLinks', JSON.stringify(links));
                alert('Импорт завершен!');
                window.location.href = 'index.html';
            }
        } catch (err) {
            alert('Ошибка чтения файла! Убедитесь, что это JSON файл с ссылками.');
        }
    };
    reader.readAsText(file);
}

// Очистка всех ссылок
function clearAllLinks() {
    if (confirm('Очистить ВСЕ ссылки? Это действие нельзя отменить.')) {
        links = [];
        localStorage.removeItem('savedLinks');
        alert('Все ссылки удалены!');
        window.location.href = 'index.html';
    }
}
