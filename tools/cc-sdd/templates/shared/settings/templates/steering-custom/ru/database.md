# Стандарты баз данных

[Назначение: паттерны для схем, миграций, запросов и управления данными]

## Философия
- Схема как код; версионируемые миграции
- Оптимизировать для типичных запросов; индексы осознанно
- Целостность данных на уровне БД; invariants через constraints

## Проектирование схемы

### Именование
- Таблицы: snake_case, множественное число (`users`, `orders`)
- Колонки: snake_case, понятные (`created_at`, `user_id`)
- Индексы: `idx_{table}_{columns}`
- Foreign keys: `fk_{table}_{ref_table}`

### Обязательные поля
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
```

### Soft Delete (если применимо)
```sql
deleted_at TIMESTAMP WITH TIME ZONE
```
Фильтровать `WHERE deleted_at IS NULL` по умолчанию.

## Миграции

### Принципы
- Одна миграция = одна логическая изменение
- Up и Down должны быть обратимыми
- Никогда не редактировать применённые миграции
- Тестировать миграции на копии production данных

### Паттерн именования
```
YYYYMMDDHHMMSS_description.sql
20250108120000_create_users_table.sql
```

## Индексы

### Когда создавать
- Primary keys (автоматически)
- Foreign keys
- Часто используемые в WHERE/ORDER BY
- Уникальные ограничения

### Паттерн
```sql
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_orders_user_status ON orders (user_id, status) WHERE deleted_at IS NULL;
```

## Запросы

### Правила
- Параметризованные запросы ВСЕГДА (предотвращение SQL injection)
- Явное указание колонок (не `SELECT *`)
- LIMIT для списков; пагинация для больших наборов
- Explain plan для сложных запросов

### Паттерн транзакций
```typescript
await db.transaction(async (tx) => {
  await tx.insert(users).values(userData);
  await tx.insert(profiles).values(profileData);
});
```

## Связи

### Типы
- One-to-Many: FK в child таблице
- Many-to-Many: junction таблица
- One-to-One: FK с UNIQUE constraint

### Каскадные операции
```sql
ON DELETE CASCADE  -- для зависимых данных
ON DELETE SET NULL -- для опциональных связей
ON DELETE RESTRICT -- для критичных связей
```

---
_Фокус на паттернах. Конкретные ORM/библиотеки в tech.md._
