# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "Login" [level=1] [ref=e4]
    - paragraph [ref=e5]: Invalid login credentials
    - generic [ref=e6]:
      - generic [ref=e7]: Email
      - textbox "Email" [ref=e8]: e2e.user+local@test.dev
    - generic [ref=e9]:
      - generic [ref=e10]: Passwort
      - textbox "Passwort" [ref=e11]: TestUser!23456
    - button "Einloggen" [ref=e12]
    - link "Noch kein Konto? Registrieren" [ref=e14] [cursor=pointer]:
      - /url: /auth/signup
    - link "Passwort vergessen?" [ref=e16] [cursor=pointer]:
      - /url: /auth/reset-password
  - button "Open Next.js Dev Tools" [ref=e22] [cursor=pointer]:
    - img [ref=e23]
  - alert [ref=e26]
```