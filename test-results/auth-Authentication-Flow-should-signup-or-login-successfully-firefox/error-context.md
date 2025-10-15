# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "Registrieren" [level=1] [ref=e4]
    - paragraph [ref=e5]: Diese E-Mail ist bereits registriert. Bitte loggen Sie sich ein.
    - generic [ref=e6]:
      - generic [ref=e7]: Email
      - textbox "Email" [ref=e8]: e2e.user+local@test.dev
    - generic [ref=e9]:
      - generic [ref=e10]: Passwort
      - textbox "Passwort" [ref=e11]: TestUser!23456
    - button "Registrieren" [ref=e12]
    - link "Bereits angemeldet? Login" [ref=e14] [cursor=pointer]:
      - /url: /auth/login
  - button "Open Next.js Dev Tools" [ref=e20] [cursor=pointer]:
    - img [ref=e21]
  - alert [ref=e25]
```