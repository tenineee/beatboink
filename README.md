# 🎵 beat.boink - Музыкальный Стриминговый Сервис

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Современная платформа для прослушивания и загрузки музыки. Создавай плейлисты, делись треками, открывай новых артистов.

## 📋 Описание

**beat.boink** - это веб-приложение для музыкального стриминга, которое позволяет:
- 🎧 Слушать музыку онлайн
- 📤 Загружать свои треки
- 📝 Создавать плейлисты
- 👥 Делиться музыкой с друзьями
- 🎨 Развивать аудиторию для артистов

## 🚀 Технологии

### Backend
- **Node.js** - серверная платформа
- **Express.js** - веб-фреймворк
- **TypeScript** - типизированный JavaScript
- **PostgreSQL** - реляционная база данных
- **JWT** - токены для авторизации
- **bcrypt** - хеширование паролей
- **express-rate-limit** - защита от брутфорса

### Frontend
- **React** - библиотека для UI
- **TypeScript** - строгая типизация
- **Vite** - сборщик проекта
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **Context API** - управление состоянием

## 📁 Структура проекта

beatmoink/
├── server/ # Backend приложение
│ ├── src/
│ │ ├── config/ # Конфигурация БД
│ │ ├── controllers/ # Бизнес-логика
│ │ ├── middleware/ # Промежуточные обработчики
│ │ ├── routes/ # API маршруты
│ │ ├── types/ # TypeScript типы
│ │ ├── utils/ # Утилиты
│ │ └── server.ts # Точка входа
│ ├── package.json
│ └── tsconfig.json
│
├── client/ # Frontend приложение
│ ├── src/
│ │ ├── assets/ # Статические ресурсы
│ │ ├── components/ # React компоненты
│ │ ├── context/ # Context API
│ │ ├── pages/ # Страницы
│ │ ├── services/ # API запросы
│ │ ├── styles/ # Глобальные стили
│ │ ├── types/ # TypeScript интерфейсы
│ │ ├── App.tsx
│ │ └── main.tsx
│ ├── package.json
│ └── vite.config.ts
│
└── README.md



## 🛠️ Установка и запуск

### Предварительные требования

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** или **yarn**

### 1. Клонирование репозитория


### 2. Настройка Backend

- cd server
- npm install


Создайте файл `.env` в папке `server`:

DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=music_streaming
JWT_SECRET=your_super_secret_key_here
PORT=5001
NODE_ENV=development

Создайте базу данных (init.sql)


Сервер запустится на `http://localhost:5001`

### 3. Настройка Frontend

Откройте новый терминал:

- `cd client`
- `npm install`


Создайте файл `.env` в папке `client`:

`VITE_API_URL=http://localhost:5001`


Запустите клиент:

- `npm run dev`

Приложение откроется на `http://localhost:3000`