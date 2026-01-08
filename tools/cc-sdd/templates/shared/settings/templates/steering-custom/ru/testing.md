# Стандарты тестирования

[Назначение: паттерны для организации тестов, покрытия, моков и качества]

## Философия
- Тесты = документация поведения
- Быстрые тесты = частый запуск
- Изоляция: каждый тест независим

## Пирамида тестирования

```
        ╭────────────╮
        │   E2E      │  ~10% — критические пути
        ├────────────┤
        │ Integration│  ~30% — контракты между модулями
        ├────────────┤
        │   Unit     │  ~60% — бизнес-логика
        ╰────────────╯
```

## Требования к покрытию

| Тип | Минимум | Цель |
|-----|---------|------|
| Unit | 80% | 90% |
| Integration | 60% | 70% |
| E2E | Критические пути | — |

## Организация файлов

### Паттерн co-location
```
src/
  users/
    user.service.ts
    user.service.test.ts      # unit
    user.integration.test.ts  # integration
```

### Паттерн отдельной директории
```
src/users/user.service.ts
tests/
  unit/users/user.service.test.ts
  integration/users/user.integration.test.ts
  e2e/users.e2e.test.ts
```

Выбор: [наш паттерн] потому что [причина]

## Именование тестов

### Паттерн
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should throw ValidationError when email is invalid', () => {});
    it('should throw ConflictError when email exists', () => {});
  });
});
```

### Формат
`should [action] when [condition]`

## Моки и Стубы

### Когда мокать
- Внешние сервисы (API, DB в unit тестах)
- Время, рандом
- Сайд-эффекты (email, файлы)

### Когда НЕ мокать
- Тестируемый модуль
- Простые утилиты
- В integration тестах (по возможности)

### Паттерн
```typescript
const mockUserRepository = {
  findById: jest.fn(),
  save: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});
```

## Фикстуры и Фабрики

```typescript
// factories/user.factory.ts
export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  ...overrides,
});
```

## CI интеграция

### Обязательные проверки
- Все тесты зелёные перед merge
- Покрытие не падает
- Lint ошибок нет

### Параллелизация
- Unit тесты параллельно
- Integration с изоляцией БД
- E2E последовательно (или containerized)

---
_Фокус на паттернах. Конкретные фреймворки тестирования в tech.md._
