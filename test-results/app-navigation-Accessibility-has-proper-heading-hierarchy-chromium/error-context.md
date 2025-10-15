# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "Login" [level=1] [ref=e4]
    - generic [ref=e5]:
      - generic [ref=e6]: Email
      - textbox "Email" [ref=e7]
    - generic [ref=e8]:
      - generic [ref=e9]: Passwort
      - textbox "Passwort" [ref=e10]
    - button "Einloggen" [ref=e11]
    - link "Noch kein Konto? Registrieren" [ref=e13] [cursor=pointer]:
      - /url: /auth/signup
    - link "Passwort vergessen?" [ref=e15] [cursor=pointer]:
      - /url: /auth/reset-password
  - button "Open Next.js Dev Tools" [ref=e21] [cursor=pointer]:
    - img [ref=e22]
  - alert [ref=e25]
```