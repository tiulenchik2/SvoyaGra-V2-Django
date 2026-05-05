import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Team, GameState

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'svoya_gra'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        team_id = data.get('team_id')

        if action == 'team_online':
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'game_message', 'data': {'action': 'refresh_admin_list'}}
            )

        elif action == 'set_price':
            await self.update_game_price(data.get('price'))
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'game_message', 'data': {'action': 'price_updated', 'price': data.get('price')}}
            )

        elif action == 'buzz':
            success = await self.lock_buzzer_global(team_id) # Блокуємо глобально!
            if success:
                team_name = data.get('team_name') or await self.get_team_name(team_id)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {'type': 'game_message', 'data': {'action': 'buzz', 'team_name': team_name, 'team_id': team_id}}
                )

        elif action == 'reset_round':
            await self.reset_all_buzzers()
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'game_message', 'data': {'action': 'reset_round'}}
            )

        elif action == 'admin_update_score':
            new_score = await self.apply_score(team_id, data.get('status'))
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'game_message', 'data': {'action': 'update_score', 'team_id': str(team_id), 'new_score': new_score}}
            )
            await self.reset_all_buzzers()
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'game_message', 'data': {'action': 'refresh_data'}}
            )

    async def game_message(self, event):
        await self.send(text_data=json.dumps(event['data']))

    # --- Робота з БД ---
    @database_sync_to_async
    def get_team_name(self, team_id):
        return Team.objects.get(id=team_id).name

    @database_sync_to_async
    def lock_buzzer_global(self, team_id):
        state = GameState.get_state()
        team = Team.objects.get(id=team_id)
        # Перевіряємо, чи баззер ЩЕ ВІЛЬНИЙ
        if not state.buzzer_locked_by and not team.is_banned:
            state.buzzer_locked_by = team
            state.save()
            return True
        return False

    @database_sync_to_async
    def reset_all_buzzers(self):
        state = GameState.get_state()
        state.buzzer_locked_by = None
        state.save()

    @database_sync_to_async
    def apply_score(self, team_id, status):
        state = GameState.get_state()
        team = Team.objects.get(id=team_id)
        if status == 'correct':
            team.score += state.current_price
        elif status == 'wrong':
            team.score -= state.current_price
        team.save()
        return team.score

    @database_sync_to_async
    def update_game_price(self, price):
        state = GameState.get_state()
        state.current_price = int(price)
        state.buzzer_locked_by = None # Знімаємо блок на новому питанні
        state.save()