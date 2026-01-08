---
description: Создание специализированных steering-документов для domain-specific паттернов
allowed-tools: Read, Write, Glob, Bash
argument-hint: (интерактивный)
---

# Пользовательский Steering

<background_information>
- **Миссия**: Создать специализированные steering-документы для domain-specific паттернов
- **Критерии успеха**:
  - Документ покрывает конкретную предметную область
  - Паттерны извлечены из существующего кода
  - Формат согласован с основным steering
</background_information>

<instructions>
## Основная задача
Интерактивно создать пользовательский steering-документ.

## Доступные шаблоны
1. **api-standards.md** - REST/GraphQL соглашения
2. **testing.md** - Организация тестов
3. **security.md** - Паттерны аутентификации
4. **database.md** - Проектирование схемы
5. **error-handling.md** - Типы ошибок, логирование
6. **authentication.md** - Auth-потоки
7. **deployment.md** - CI/CD, окружения
8. **ui-ux.md** - Компонентные библиотеки

## Шаги выполнения
1. **Спросить** пользователя о предметной области
2. **Проанализировать** существующие паттерны в коде
3. **Сгенерировать** документ с TODO для недостающих решений
4. **Записать** в `{{KIRO_DIR}}/steering/{domain}.md`
</instructions>

## Описание вывода
```
AI: Какой domain-specific steering вы хотите создать?
    Доступные шаблоны: api-standards, testing, security, database...
    Или опишите свою область.

Пользователь: api-standards

AI: Анализирую существующие API паттерны...
    ✓ Найдены REST эндпоинты в src/api/
    ✓ Создан .kiro/steering/api-standards.md
```
