document.addEventListener('DOMContentLoaded', () => {
    const teamId = document.body.dataset.teamId;
    if (!teamId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socket = new WebSocket(`${protocol}${window.location.host}/ws/game/`);
    const btn = document.getElementById('buzzer-btn');

    socket.onopen = () => {
        console.log('Connected to game');
        socket.send(JSON.stringify({
            'action': 'team_online',
            'team_id': teamId
        }));
    };

    function pressBuzzer() {
        if (!btn.disabled) {
            btn.disabled = true;
            btn.innerText = "ГОТОВО!";
            socket.send(JSON.stringify({
                'action': 'buzz',
                'team_id': teamId,
                'team_name': document.querySelector('h2').innerText
            }));
        }
    }

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        pressBuzzer();
    });
    btn.addEventListener('click', pressBuzzer);

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.action === 'refresh_data') {
            window.location.reload();
        }
        if (data.action === 'buzz') {
            if (data.team_id != teamId) {
                btn.disabled = true;
                btn.innerText = 'ХТОСЬ ПЕРШИЙ!';
                btn.style.background = "#444";
            }
        }
        if (data.action === 'reset_round' || data.action === 'price_updated') {
            btn.disabled = false;
            btn.innerText = "КЛІК";
            btn.style.background = "#ff66cc";
        }
        if (data.action === 'update_score') {
            if (data.team_id == teamId) {
                const scoreElement = document.getElementById('score');
                if (scoreElement) {
                    scoreElement.innerText = data.new_score;
                    scoreElement.style.color = "#ffffff";
                    setTimeout(() => scoreElement.style.color = "#ffff00", 300);
                }
            }
        }
        if (data.action === 'final_round_start') {
            document.getElementById('buzzer-btn').style.display = 'none';
            document.getElementById('final-section').style.display = 'block';
        }
    };
    const sendFinalBtn = document.getElementById('send-final-btn');
    if (sendFinalBtn) {
        sendFinalBtn.addEventListener('click', () => {
            const answerInput = document.getElementById('final-answer-input');
            const val = answerInput.value.trim();

            if (val !== "") {
                socket.send(JSON.stringify({
                    'action': 'final_answer',
                    'team_name': document.querySelector('h2').innerText,
                    'answer': val
                }));

                sendFinalBtn.disabled = true;
                answerInput.disabled = true;
                sendFinalBtn.innerText = "ВІДПРАВЛЕНО";
                sendFinalBtn.style.background = "#555";
            }
        });
    }
});