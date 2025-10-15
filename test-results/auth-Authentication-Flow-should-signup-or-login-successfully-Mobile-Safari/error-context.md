# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - heading "Registrieren" [level=1] [ref=e4]
    - generic [ref=e5]:
      - generic [ref=e6]: Email
      - textbox "Email" [active] [ref=e7]
    - generic [ref=e8]:
      - generic [ref=e9]: Passwort
      - textbox "Passwort" [ref=e10]: TestUser!23456
    - button "Registrieren" [ref=e11]
    - link "Bereits angemeldet? Login" [ref=e13]:
      - /url: /auth/login
  - button "Open Next.js Dev Tools" [ref=e19] [cursor=pointer]:
    - img [ref=e20]
  - alert [ref=e25]
```