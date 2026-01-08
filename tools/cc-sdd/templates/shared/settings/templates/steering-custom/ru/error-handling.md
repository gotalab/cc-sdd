# Стандарты обработки ошибок

[Назначение: согласованные паттерны для типов ошибок, логирования, сообщений и восстановления]

## Философия
- Ошибки — первоклассные граждане; обрабатывать явно
- Fail fast на невосстановимых; retry на transient
- Информативно для разработчика; безопасно для пользователя

## Типы ошибок

### Классификация
```typescript
// Бизнес-ошибки (ожидаемые)
class ValidationError extends AppError { status = 400 }
class NotFoundError extends AppError { status = 404 }
class ForbiddenError extends AppError { status = 403 }
class ConflictError extends AppError { status = 409 }

// Инфраструктурные (неожиданные)
class DatabaseError extends AppError { status = 500 }
class ExternalServiceError extends AppError { status = 502 }
```

### Схема ошибки
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Человеко-читаемое описание",
    "field": "email",
    "details": { ... }
  }
}
```

## Коды ошибок

### Паттерн именования
```
DOMAIN_ACTION_REASON
USER_CREATE_EMAIL_INVALID
ORDER_SUBMIT_INSUFFICIENT_FUNDS
AUTH_LOGIN_INVALID_CREDENTIALS
```

### Каталог кодов
Поддерживать централизованный enum/объект всех кодов.

## Обработка

### Уровни
1. **Локальная** — try/catch на операции
2. **Middleware** — глобальный error handler
3. **Границы** — преобразование в HTTP response

### Паттерн middleware
```typescript
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = status < 500 ? error.message : 'Internal server error';
  
  logger.error({ error, requestId: req.id });
  res.status(status).json({ error: { code, message } });
});
```

## Логирование

### Что логировать
- Все ошибки с контекстом (requestId, userId, action)
- Stack trace для 5xx
- Input для воспроизведения (sanitized)

### Что НЕ логировать
- Пароли, токены, секреты
- Полные PII без маскирования
- Большие тела запросов/ответов

### Паттерн
```typescript
logger.error({
  code: error.code,
  message: error.message,
  stack: error.stack,
  requestId: req.id,
  userId: user?.id,
  action: 'createOrder',
  input: sanitize(input)
});
```

## Retry стратегия

### Для transient ошибок
```typescript
const retryConfig = {
  maxAttempts: 3,
  backoff: 'exponential',
  initialDelay: 1000,
  maxDelay: 30000,
  retryOn: [502, 503, 504, 'ECONNRESET']
};
```

### Circuit Breaker
- Открыть после N последовательных ошибок
- Half-open через timeout
- Сбросить при успехе

## Сообщения пользователю

### Принципы
- 4xx: Объяснить что не так и как исправить
- 5xx: "Произошла ошибка, попробуйте позже" (без деталей)
- Включать requestId для поддержки

---
_Фокус на паттернах. Конкретные библиотеки логирования в tech.md._
