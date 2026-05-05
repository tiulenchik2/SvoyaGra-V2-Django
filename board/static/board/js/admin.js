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