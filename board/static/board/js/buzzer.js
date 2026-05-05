document.addEventListener('DOMContentLoaded', () => {
    const teamId = document.body.dataset.teamId;
    if (!teamId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socket = new WebSocket(`${protocol}${window.location.host}/ws/game/`);
    const button = document.getElementById('buzzer-btn');

    socket.onopen = () => {
        console.log('Connected to game');
        socket.send(JSON.stringify({
            'action': 'team_online',
            'team_id': teamId
        }));
    };
    function pressBuzzer() {
        if (!button.disabled) {
            button.disabled = true;
            socket.send(JSON.stringify({
                'action': 'press_buzzer',
                'team_id': teamId,
            }));
        }
    }
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        pressBuzzer();
    });
    button.addEventListener('click', pressBuzzer);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            button.disabled = true;
            socket.send(JSON.stringify({
                'action': 'detected',
                'team_id': teamId,
            }));
            alert('Кнопку заблоковано. Якщо вважаєте це за помилку - зверніться до організаторів.');
        }
    });
    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
    };
});