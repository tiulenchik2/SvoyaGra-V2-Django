document.addEventListener('DOMContentLoaded', () => {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socket = new WebSocket(`${protocol}${window.location.host}/ws/game/`);

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.action === 'refresh_admin_list' || data.action === 'refresh_data') {
            window.location.reload();
        }

        if (data.action === 'buzz') {
            document.querySelectorAll('.team-action-area').forEach(div => div.innerHTML = '');

            const container = document.getElementById(`action-for-${data.team_id}`);
            if (container) {
                container.innerHTML = `
                <button class="btn-admin btn-correct" onclick="updateScore(${data.team_id}, 'correct')">ВІРНО</button>
                <button class="btn-admin btn-wrong" onclick="updateScore(${data.team_id}, 'wrong')">НЕВІРНО</button>
                `;
            }
            document.getElementById('current-status').innerText = `ВІДПОВІДАЄ: ${data.team_name}`;
        }

        if (data.action === 'price_updated') {
            const priceDisplay = document.getElementById('display-price');
            if (priceDisplay) priceDisplay.innerText = data.price;
        }

        if (data.action === 'reset_round') {
            const statusEl = document.getElementById('current-status');
            if (statusEl) {
                statusEl.innerText = "Очікування натискання...";
                statusEl.style.color = "#ffffff";
            }
            document.querySelectorAll('.team-action-area').forEach(div => div.innerHTML = '');
        }
        if (data.action === 'final_answer_received') {
            const list = document.getElementById('final-answers-list');
            const li = document.createElement('li');
            li.style.cssText = "padding: 15px; border-bottom: 1px solid #444; margin-bottom: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 5px;";
            li.innerHTML = `<strong style="color: #00ff00;">${data.team_name}:</strong> <span style="color: #fff; font-size: 1.5rem; margin-left: 10px;">${data.answer}</span>`;
            list.appendChild(li);
        }
    };

    window.resetBuzzer = () => {
        socket.send(JSON.stringify({ 'action': 'reset_round' }));
    };

    window.updateScore = (teamId, status) => {
        socket.send(JSON.stringify({
            'action': 'admin_update_score',
            'team_id': teamId,
            'status': status
        }));
    };
});