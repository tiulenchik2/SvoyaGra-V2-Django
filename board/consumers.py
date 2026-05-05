import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Team, GameState

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'svoya_gra'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        team_id = data.get('team_id')
        print(f'Data received: {data}')
        if action == 'team_online':
            await self.set_team_status(team_id, online=True)
            await self.broadcast_status()

        elif action == 'press_buzzer':
            locked_team = await self.try_lock_buzzer(team_id)
            if locked_team:
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'game_message',
                    'data': {'action': 'buzzer_locked', 'team_name': locked_team.name, 'team_id': locked_team.id}
                })

        elif action == 'cheat_detected':
            await self.set_team_status(team_id, banned=True)
            await self.broadcast_status()
    @database_sync_to_async
    def set_team_status(self, team_id, online=None, banned=None):
        team = Team.objects.get(id=team_id)
        if online is not None: team.is_online = online
        if banned is not None: team.is_banned = banned
        team.save()

    @database_sync_to_async
    def try_lock_buzzer(self, team_id):
        state = GameState.get_state()
        team = Team.objects.get(id=team_id)
        if not state.buzzer_locked_by and not team.is_banned:
            state.buzzer_locked_by = team
            state.save()
            return team
        return None

    async def broadcast_status(self):
        """Розсилка оновлених статусів команд для адмінки"""
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'game_message',
            'data': {'action': 'refresh_admin_list'}
        })

    async def game_message(self, event):
        await self.send(text_data=json.dumps(event['data']))