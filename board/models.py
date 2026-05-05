from django.db import models

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='Назва команди')
    score = models.IntegerField(default=0, verbose_name='Бали')
    is_online = models.BooleanField(default=False, verbose_name='Статус')
    is_banned = models.BooleanField(default=False, verbose_name='Блок')
    has_buzzed = models.BooleanField(default=False, verbose_name="Натиснута кнопка")

    def __str__(self):
        return f"{self.name} ({self.score} балів)"
class GameState(models.Model):
    current_price = models.IntegerField(default=0, verbose_name='Ціна поточного питання')
    buzzer_locked_by = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Хто відповідає')
    is_buzzer_active = models.BooleanField(default=False, verbose_name='Активність кнопки')

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
    @classmethod
    def get_state(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
    def __str__(self):
        active_team = self.buzzer_locked_by.name if self.buzzer_locked_by else 'None'
        return f"Ціна: {self.current_price} | Відповідає: {active_team}"