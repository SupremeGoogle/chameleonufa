# Хамелеон — редизайн (claymorphism)

Второй вариант сайта агентства детских праздников «Хамелеон» (Уфа) — [chameleonufa.ru](https://chameleonufa.ru/).
Стиль claymorphism, плавные анимации и переходы на React + Framer Motion.

- **Стек:** Vite, React 19, TypeScript, Framer Motion, Lenis (плавный скролл), lucide-react.
- **Контент:** все тексты, цены и контакты — в `src/data.ts`.
- **Картинки:** 3D-иконки — [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT), фото — с оригинального сайта (`public/img/photos`).

```bash
npm install
npm run dev     # локально
npm run build   # сборка в dist/
```

Деплой на GitHub Pages — `.github/workflows/deploy.yml` (Settings → Pages → Source: GitHub Actions).
