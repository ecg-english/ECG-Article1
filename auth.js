// 認証モーダルの管理
(function() {
    'use strict';
    
    // GASのウェブアプリURL
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzcftQ57r_aAONU13BUfwgBpfgolCxZHteoZzrLQRU0CIstTCp9UJWJczGrUAX7IccN-A/exec";
    
    // ローカルストレージのキー
    const AUTH_KEY = 'ecg_auth_success';
    
    // 認証状態をチェック
    function isAuthenticated() {
        return localStorage.getItem(AUTH_KEY) === 'true';
    }
    
    // 認証成功を保存
    function saveAuthSuccess() {
        localStorage.setItem(AUTH_KEY, 'true');
    }
    
    // 認証モーダルを初期化
    function initAuthModal() {
        // 既に認証済みの場合はモーダルを表示しない
        if (isAuthenticated()) {
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'none';
            }
            return;
        }
        
        // モーダルが存在しない場合は作成
        if (!document.getElementById('authModal')) {
            createAuthModal();
        }
        
        // イベントリスナーを設定
        setupEventListeners();
    }
    
    // 認証モーダルを作成
    function createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>登録メールアドレスを入力</h2>
                <p>ご利用には登録済みのメールアドレスが必要です。<br>入力後、認証が行われます。</p>
                
                <div class="input-group">
                    <input type="email" id="emailInput" placeholder="example@email.com" required>
                </div>
                
                <button id="submitBtn" onclick="window.checkEmail()">学習を始める</button>
                <div id="errorMsg"></div>
            </div>
        `;
        
        // bodyの最初に追加
        document.body.insertBefore(modal, document.body.firstChild);
    }
    
    // イベントリスナーを設定
    function setupEventListeners() {
        const emailInput = document.getElementById('emailInput');
        
        if (emailInput) {
            // Enterキーで送信
            emailInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    checkEmail();
                }
            });
        }
    }
    
    // メールアドレスをチェック
    window.checkEmail = function() {
        const input = document.getElementById('emailInput');
        const errorMsg = document.getElementById('errorMsg');
        const submitBtn = document.getElementById('submitBtn');
        const modal = document.getElementById('authModal');
        
        const email = input.value.trim(); // 空白除去
        
        // 簡易的なメール形式チェック
        if (!email || !email.includes('@')) {
            errorMsg.textContent = "正しいメールアドレスを入力してください。";
            return;
        }
        
        // 送信中表示
        submitBtn.disabled = true;
        submitBtn.textContent = "認証中...";
        errorMsg.textContent = "";
        
        const formData = new FormData();
        formData.append('email', email); // パラメータ名を 'email' に変更
        
        fetch(GAS_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 成功時：ローカルストレージに保存
                saveAuthSuccess();
                // モーダルを非表示にする
                modal.style.display = "none";
            } else {
                // 失敗時（未登録など）
                errorMsg.textContent = data.message || "認証に失敗しました。";
                submitBtn.disabled = false;
                submitBtn.textContent = "学習を始める";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMsg.textContent = "通信エラーが発生しました。もう一度お試しください。";
            submitBtn.disabled = false;
            submitBtn.textContent = "学習を始める";
        });
    };
    
    // ページ読み込み時に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthModal);
    } else {
        initAuthModal();
    }
})();

